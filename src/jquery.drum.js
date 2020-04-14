/*!
 * Drum widget
 *
 * @author Tigran Sargsyan <tigran.sn@gmail.com>
 * @license https://github.com/tigrr/drum/blob/master/LICENSE MIT
 */

/**
 * @todo Make it possible to change type
 * @todo Horizontal drum
 * @todo Infinite cycle
 */

'use strict';

/* jshint globalstrict: true, jquery: true, browser: true */

(function($) {

// LIB
var sign = function(x) {
    x = +x; // convert to a number
    if (x === 0 || isNaN(x))
        return x;
    return x > 0 ? 1 : -1;
};
// /LIB



/**
 * Drum widget
 * @param {object} [options] Widget options
 * @param {string} [options.type=number] Type: either numer or select
 * @param {number} [options.min=0] Minimum value (for type=number)
 * @param {number} [options.max=Infinity] Maximum value (for type=number)
 * @param {number} [options.step=1] Increment step (for type=number)
 * @param {boolean} [options.orderAsc=true] Whether the items are displayed in ascending order or descending
 * @param {array} [options.options] Array of items for type=select. Supported format is either strings or objects {value: 'value', label: 'Value'}
 * @param {boolean} [options.watchOutside=true] Whether dragging outside the widget rigion should be counted
 * @param {number} [options.edgeLimit=.8] Limit where the drum can reach on the edges as part of the viewport.
 *                                        E.g. edgeLimit: 1 means the drum can be spinned to the viewport edge but no further.
 *                                        edgeLimit: .5 - the drum can't go further than half the viewport.
 *                                        valuew higher than 1 will let the drum go beyond viewport.
 * @param {number} [options.acceleration=300] Drum acceleration (deceleration)
 * @param {integer} [options.renderItemsNum=100] Number of items to render in the drum. If total number of items is more, they will be inserted as the drum rolls closer to the edge.
 * @param {number} [options.maxSpinOffset=500] Maximum offset the drum can spin to after a swipe in pixels
 */
$.widget('tl.drum', {
	options: {
		classes: {
			'drum-viewport': 'drum-viewport',
			'drum-drum': 'drum-drum',
		},
		type: 'number',
		min: 0,
		max: Infinity,
		step: 1,
		orderAsc: true,
		watchOutside: true,
		edgeLimit: .8,
		acceleration: 300,
		renderItemsNum: 100,
		maxSpinOffset: 500
	},

	/**
	 * Create, initialize widget
	 */
	_create: function() {
		var that = this;

		this._drumOffset = 0;
		this._state = 'standby';
		this.items = [];
		for(var key in this.options) {
			this.options[key] = this._formatValue(key, this.options[key]);
		}
		this._render();

		this.element.watchDrag({
			dragstart: function(ev, data) {
				that.element.focus();
				if(that._state === 'revolving') {
					that._scrollToOffset(that._getCurrentOffset());
					that._refillValuesAroundView();
				}
				that._state = 'dragging';
				that._drumEl
					.css('transition', 'none')
					.addClass('dragging');
				that._trigger('dragstart', ev, data);
			},
			drag: function(ev, data) {
				that._scrollToOffset(that._drumOffset + data.dy);
				that._trigger('drag', ev, data);
			},
			dragend: function(ev, data) {
				var v, t, offset, a = that.options.acceleration;

				v = Math.abs(data.vy);

				if(v) {
					offset = Math.pow(v, 2) / (2 * a);
					if(offset > that.options.maxSpinOffset) offset = that.options.maxSpinOffset;
					offset = offset * sign(data.dy);
					offset = that._drumOffset + offset;
					offset = that._processOffset(offset);
					t = 2 * Math.abs(offset - that._drumOffset) / v;
					that._drumEl.css({'transition': 'transform ' + t + 's cubic-bezier(0.25, 0.46, 0.45, 0.94)'});
					that._scrollToOffset(offset);

					that._state = 'revolving';
					setTimeout(function() {
						that._stopRevolving(ev);
					}, t * 1000 + 40);
				} else {
					that._stopRevolving(ev);
				}
				that._drumEl.removeClass('dragging');
				that._trigger('dragend', ev, data);
			}
		}).keydown(function(e) {
			if(e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;
			switch(e.keyCode) {
			case 38:
				that.selectPrev();
				e.preventDefault();
				break;

			case 40:
				that.selectNext();
				e.preventDefault();
				break;

			}
		});
	},

	/**
	 * Stop the drum from freely revolving
	 * @param  {Event} ev Event object
	 */
	_stopRevolving: function(ev) {
		if(this._state === 'standby') return;

		this._refillValuesAroundView();
		this.options.value = this._formatValue('value', this._centerView().dataset.value);
		this._updateValues('value', this.options.value);
		this._state = 'standby';

		this._trigger('change', ev, {value: this.options.value});
	},

	/**
	 * Render the drum control
	 * Called when it is first created.
	 */
	_render: function() {
		var origEl = this.element[0];

		if(origEl.nodeName === 'SELECT' || origEl.nodeName === 'INPUT') {
			if(origEl.nodeName === 'INPUT' && origEl.type !== 'number') throw new Error('Input element must be of type "number"');
			this._origControl = origEl;
			origEl.style.display = 'none';
			this.element = $('<div>').insertAfter(this.element);
		}
		this._addClass(this.element, 'drum-viewport');
		this.element.attr('tabindex', 0).css({
			'display': 'inline-block',
			'overflow-y': 'hidden',
			'-moz-user-select': 'none',
			'-ms-user-select': 'none',
			'-webkit-user-select': 'none',
			'user-select': 'none',
		});
		this._drumEl = $('<div style="position: relative;">').appendTo(this.element);
		this._addClass(this._drumEl, 'drum-drum');
		if(origEl.nodeName === 'SELECT' || this.options.options || this.options.type === 'select') {
			this.options.type = 'select';
			this.options.min = this.options.max = this.options.step = undefined;
			// ARIA
			this.element.attr('role', 'listbox');
			if(this.options.options) {
				this._setOption('options', this.options.options);
			} else {
				if(origEl.nodeName === 'SELECT') {
					this.options.value = origEl.value;
					this._setOption('options', this._parseSelectMenuOptions($(origEl).find('option')));
				} else {
					throw new Error('Either options array or select element must be passed');
				}
			}

			if(this.options.value === undefined) this.options.value = this.options.options[0].value;
		} else if((this.options.min || this.options.max) || origEl.nodeName === 'INPUT' && origEl.type === 'number' || this.options.type === 'number') {
			this.options.type = 'number';

			if(origEl.nodeName === 'INPUT') {
				if(origEl.min !== '') this.options.min = this._formatValue('min', origEl.min);
				if(origEl.max !== '') this.options.max = this._formatValue('max', origEl.max);
				if(origEl.step !== '') this.options.step = this._formatValue('step', origEl.step);
				if(origEl.value !== '') this.options.value = this._formatValue('value', origEl.value);
			}

			if(this.options.value === undefined) this.options.value = typeof this.options.min === 'number' ? this.options.min : 0;

			// ARIA
			this.element.attr('role', 'spinbutton');
			this.element.attr('aria-valuemin', this.options.min);
			this.element.attr('aria-valuemax', this.options.max);
			this.element.attr('aria-valuenow', this.options.value);

			this._fillValues();
		}

		this._setOption('value', this.options.value, false);
	},

	/**
	 * Insert items as new contents of the drum
	 * @param  {Array}  items    Items to populate the drum with
	 */
	_drawItems: function(items) {
		var that = this, items_html = '';

		items.forEach(function(item) {
			var itm_html = '<div class="drum-item" data-value="' + item.value + '">' + item.label + '</div>';
			if(that.options.orderAsc) items_html += itm_html;
			else items_html = itm_html + items_html;
		});

		this._drumEl.html(items_html);
	},

	/**
	 * Parse option being set bringing it to apropriate format
	 * @param  {string} name   Option name
	 * @param  {mixed}  value  Option value
	 * @return {mixed}         Formatted option value
	 */
	_parseOption: function(name, def) {
		var inputEl = this.element[0];
		if(this.options[name] !== undefined) return this.options[name];
		if(inputEl.nodeName === 'INPUT' && inputEl.type === 'number') return inputEl[name];
		return def;
	},

	/**
	 * Collect options' data from select menu element and draw them on the drum
	 * @param  {jQuery} options jQuery collection of option elements
	 */
	_parseSelectMenuOptions: function(options) {
		var that = this,
			items = [];

		options.each(function(index, item) {
			items.push(that._parseSelectMenuOption($(item), index));
		});
		return items;
	},

	/**
	 * Parse single option html element's data
	 * @param  {jQuery} option Option element as jQuery object
	 * @param  {integer} index  The index of the option in set of options (such as a select menu)
	 * @return {Object}        Option's data
	 */
	_parseSelectMenuOption: function(option, index) {
		return {
			// element: option,
			// index: index,
			value: option.val(),
			label: option.text()
		};
	},

	/**
	 * Fill the drum with values around a passed value
	 * @param  {float} curValue Current value. Defaults to options.value
	 */
	_fillValues: function(curValue) {
		var start, end, step, value,
			items = [];

		curValue = curValue || this.options.value;
		step = this.options.step || 1;
		start = curValue - Math.floor(step * this.options.renderItemsNum / 2);
		if(typeof this.options.min === 'number' && start < this.options.min) start = this.options.min;
		end = start + step * (this.options.renderItemsNum - 1);
		if(typeof this.options.max === 'number' && this.options.max < end) end = this.options.max;

		for(value = start; value <= end; value += step) {
			items.push({
				value: value,
				label: value
			});
		}
		this.items = items;

		this._drawItems(items);
	},

	/**
	 * Refill values around the value currently in view
	 * Used when type of drum is "number".
	 */
	_refillValuesAroundView: function(value) {
		var oldValueAtTop, newValueAtTop, oldOffset;

		if(this.options.type !== 'number') return;
		if(value === undefined) value = this._getValue();
		// if(value === this.options.value) return;
		oldValueAtTop = (this.options.orderAsc ? this.items[this.items.length - 1] : this.items[0]).value;
		oldOffset = this._drumOffset;
		this._fillValues(value);
		newValueAtTop = (this.options.orderAsc ? this.items[this.items.length - 1] : this.items[0]).value;
		this._drumEl.css('transition', 'none');
		this._scrollToOffset(oldOffset + this._drumEl.find('.drum-item')[0].offsetHeight * (oldValueAtTop - newValueAtTop));
	},

	/**
	 * Get the value of the item currently in view
	 * @return {float} The value of the item currently in view
	 */
	_getValue: function() {
		return this._formatValue('value', this._getItemInView().dataset.value);
	},

	/**
	 * Parse (format) value
	 * Used when type of drum is "number".
	 * @param  {mixed} value Raw value
	 * @return {float}       Value formatted and checked against min / max limits
	 */
	_formatValue: function(key, val) {
		switch(key) {
			case 'value':
			case 'min':
			case 'max':
			case 'step':
				if(this.options.type === 'number') {
					val = parseFloat(val);
					if(!isFinite(val)) val = undefined;
				}
				break;
			case 'type':
				if(val !== 'number' && val !== 'select') throw new Error('Wrong value for type: "' + val + '". The supported types are "number" and "select".');
				break;
			case 'orderAsc':
			case 'watchOutside':
				if(typeof val !== 'boolean') throw new TypeError(key + ' must be boolean. ' + (typeof val) + ' passed.');
				break;
			case 'options':
				if(!Array.isArray(val)) throw new TypeError('Options option must be an array');
				val = val.map(function(opt) {
					if(typeof opt === 'string') {
						return {value: opt, label: opt};
					} else {
						return {value: opt.value, label: opt.label};
					}
				});
				break;
			case 'minDragInterval':
			case 'acceleration':
			case 'renderItemsNum':
			case 'maxSpinOffset':
				val = parseFloat(val);
				if(!isFinite(val)) throw new TypeError(key + ' must be number');
				break;
		}
		return val;
	},

	/**
	 * Set option
	 * @param {string} key     Option name
	 * @param {mixed} val   Option value
	 * @param {boolean} animate Whether to animate drum scrolling
	 */
	_setOption: function(key, val, animate) {
		var that = this;
		val = this._formatValue(key, val)

		if(val === undefined) throw new TypeError('Failed to set the ' + key + ' property on Drum: The provided value is non-finite.');
		if(['min', 'max', 'step'].indexOf(key) !== -1 && this.options.type !== 'number') throw new TypeError('Failed to set the ' + key + ' property on Drum: ' + key + ' can only be set on widget type number.');

		if(key === 'value') {
			if(this.options.type === 'number') {
				if(this.options.min != null && val < this.options.min) {
					val = this.options.min;
				}
				if(this.options.max != null && val > this.options.max) {
					val = this.options.max;
				}
			}
		}

		if(key === 'min' && val >= this.options.max) return;
		if(key === 'max' && val <= this.options.min) return;

		if(key === 'options') {
			this.items = val.slice();
			if(!val.some(function(opt) {return opt.value === that.options.value})) this.options.value = val[0].value;
			this._drawItems(this.items);
		}

		this.options[key] = val;

		this._updateValues(key, val);

		if(key === 'min' && this.options.value < val) {
			return this._setOption('value', val);
		}
		if(key === 'max' && this.options.value > val) {
			return this._setOption('value', val);
		}

		if(['min', 'max', 'step', 'value', 'options'].indexOf(key) !== -1) {
			this._refillValuesAroundView(key === 'value' ? val : null);
			this._centerView(this._drumEl.find('[data-value="' + this.options.value + '"]')[0], animate);
		}
	},

	/**
	 * Update values in aria attributes and the original form element if exists
	 * @param  {string} key Option key
	 * @param  {mixed} val Option value
	 */
	_updateValues: function(key, val) {
		var ariaAttrs = {value: 'aria-valuenow', min: 'aria-valuemin', max: 'aria-valuemax'};

		if(this._origControl) {
			if(this._origControl.nodeName === 'INPUT' && (key === 'value' || key === 'max' || key === 'min' || key === 'step')) {
				this._origControl[key] = val;
			}
			if(this._origControl.nodeName === 'SELECT') {
				if(key === 'value') {
					this._origControl.value = val;
				} else if(key === 'options') {
					this._origControl.innerHTML = val.map(function(item) {
						return '<option value="' + item.value + '">' + item.label + '</option>';
					}).join('');
				}
			}
		}

		if(key in ariaAttrs) {
			if(val !== undefined) this.element.attr(ariaAttrs[key], val);
			else this.element.removeAttr(ariaAttrs[key]);
		}
	},

	/**
	 * Scroll the drum to offset
	 * @param  {float} offset New offset to scroll the drum to
	 */
	_scrollToOffset: function(offset) {
		if(offset === undefined) throw new Error('You must pass an offset value');

		offset = this._processOffset(offset);
		this._drumOffset = offset;
		this._drumEl.css({'transform': 'translate(0,' + offset + 'px)'});
	},

	_processOffset: function(offset) {
		var q = this.options.edgeLimit;
		var viewportHeight = this.element[0].clientHeight;
		return Math.max(Math.min(offset, q * viewportHeight), -this._drumEl[0].offsetHeight + viewportHeight * (1 - q));
	},

	/**
	 * Center view around the item
	 * @param  {Element} itemInView The item to be set to view. Defaults to the item currently in view.
	 * @param  {boolean} animate    Whether to animate the centering
	 * @return {Element}            Item in view
	 */
	_centerView: function(itemInView, animate) {
		var offset, that = this;

		animate = animate !== false;
		itemInView = itemInView || this._getItemInView();
		this._drumEl.find('.drum-item').removeClass('drum-item-current');
		itemInView.classList.add('drum-item-current');
		offset = -itemInView.offsetTop + this.element[0].clientHeight / 2 - itemInView.offsetHeight / 2;

		clearTimeout(this._timer);
		if(animate) {
			this._drumEl.css({'transition': 'transform .13s cubic-bezier(0,.5,.85,1)'});
			this._timer = setTimeout(function() {
				that._drumEl.css('transition', 'none');
			}, 200);
		}
		this._scrollToOffset(offset);

		return itemInView;
	},

	/**
	 * Get current drum offset
	 * @return {float} Current drum offset in pixels
	 */
	_getCurrentOffset: function() {
		return this._drumEl[0].getBoundingClientRect().top - this.element[0].getBoundingClientRect().top;
	},

	/**
	 * Get the item currently in view
	 * @return {Element} HTML element closest to the center of the drum viewport
	 */
	_getItemInView: function() {
		var viewportBB = this.element[0].getBoundingClientRect(),
			viewportCenter = {
				x: viewportBB.left + viewportBB.width / 2,
				y: viewportBB.top + viewportBB.height / 2
			},
			drumItems = this._drumEl.children(),
			drumBB = this._drumEl[0].getBoundingClientRect(),
			i = Math.max(0, Math.min(drumItems.length - 1, Math.floor((viewportCenter.y - drumBB.top) / drumBB.height * drumItems.length))),
			ret;

		ret = drumItems[i];
		// TODO: when drum-items have top bottom margins
		// var drumItemBB = ret.getBoundingClientRect();
		// if(i !== 0 && drumItemBB.top > viewportCenter.y ||  i !== drumItems.length - 1 && drumItemBB.bottom < viewportCenter.y) {
		// 	debugger;
		// }

		// if(!ret) {
		// 	console.error('Drum is out of range');
		// 	return;
		// }
		if(!ret.classList.contains('drum-item')) {
			// throw new Error('Drum is out of range');
			if(this._drumOffset > 0) ret = this._drumEl.children()[0];
			else ret = this._drumEl.children().last()[0];
		}
		return ret;
	},

	/**
	 * value method.
	 * Same as $el.drum('option', 'value');
	 * @return {mixed}     Current value
	 */
	value: function(val) {
		if(val === undefined) return this.options.value;
		this._setOptions({value: val});
	},

	/**
	 * min method.
	 * Same as $el.drum('option', 'min');
	 * @return {number}     min
	 */
	min: function(val) {
		if(val === undefined) return this.options.min;
		this._setOptions({min: val});
	},

	/**
	 * max method.
	 * Same as $el.drum('option', 'max');
	 * @return {number}     max
	 */
	max: function(val) {
		if(val === undefined) return this.options.max;
		this._setOptions({max: val});
	},

	/**
	 * Move focus to the next item
	 */
	selectNext: function() {
		var next = this._getItemInView().nextElementSibling;
		if(next) {
			this._setOption('value', next.dataset.value);
			return next;
		} else {
			return false;
		}
	},

	/**
	 * Move focus to the previous item
	 */
	selectPrev: function() {
		var next = this._getItemInView().previousElementSibling;
		if(next) {
			this._setOption('value', next.dataset.value);
			return next;
		} else {
			return false;
		}
	}
});

}(jQuery));
