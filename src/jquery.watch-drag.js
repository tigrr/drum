/*!
 * watchDrag widget
 * Watch mouse (touch) drag on an element
 *
 * @author Tigran Sargsyan <tigran.sn@gmail.com>
 * @license https://github.com/tigrr/drum/blob/master/LICENSE MIT
 */

'use strict';

/* jshint globalstrict: true, jquery: true, browser: true */

(function($) {

$.widget('tl.watchDrag', {
	options: {
		watchOutside: true,
		minDragInterval: 100
	},

	_create: function() {
		this._resetCoords();
		this._on(this.element, {mousedown: this._eventsStart.mousedown, touchstart: this._eventsStart.mousedown});
	},

	_captureCoords: function(ev) {
		var x = ['touchstart', 'touchmove', 'touchend'].indexOf(ev.type) !== -1 ? ev.touches[0].pageX : ev.pageX,
			y = ['touchstart', 'touchmove', 'touchend'].indexOf(ev.type) !== -1 ? ev.touches[0].pageY : ev.pageY,
			t = Date.now(),
			dx = x - this._coords.x,
			dy = y - this._coords.y,
			dt = t - this._coords.t;

		return {
			x: x,
			y: y,
			t: t,
			dx: dx,
			dy: dy,
			dt: dt
		};
	},

	_updateCoords: function(coords) {
		this._coords = coords;
	},

	_resetCoords: function() {
		this._coords = {
			x: null, // Pointer left offset relative to the document.
			y: null, // Pointer top offset relative to the document.
			t: null, // Timestamp in milliseconds
			dx: 0, // X change in pointer position from the begining of drag
			dy: 0, // Y change in pointer position from the begining of drag
			dt: 0  // Change in time from the begining of drag
		};
	},

	_eventsStart: {
		mousedown: function(ev) {
			if(ev.type === 'mousedown' && ev.which !== 1) return;

			ev.preventDefault();
			ev.stopPropagation();

			this._listenOn = this.options.watchOutside ? $(window) : this.element;
			this._on(this._listenOn, {
				mousemove: this._eventsDrag.mousemove,
				touchmove: this._eventsDrag.mousemove,
				mouseup: this._eventsDrag.mouseup,
				touchend: this._eventsDrag.mouseup,
			});

			this._resetCoords();
			var coords = this._captureCoords(ev);
			this._coords.x = coords.x;
			this._coords.y = coords.y;
			this._coords.t = coords.t;

			this._trigger('dragstart', ev, this._coords);
		}
	},

	_eventsDrag: {
		mousemove: function(ev) {
			var data = this._captureCoords(ev);

			this._updateCoords(data);

			this._trigger('drag', ev, data);
		},

		mouseup: function(ev) {
			ev.preventDefault();
			ev.stopPropagation();

			var data = $.extend({}, this._coords);

			if(Date.now() - this._coords.t <= this.options.minDragInterval) {
				data.vx = data.dx / data.dt * 1000;
				data.vy = data.dy / data.dt * 1000;
			} else {
				data.vx = data.vy = 0;
			}
			this._off(this._listenOn, 'mousemove mouseup touchmove touchend');

			this._trigger('dragend', ev, data);
		}
	}
});

}(jQuery));
