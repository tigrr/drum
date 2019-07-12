/*!
 * watchDrag widget
 * Watch mouse (touch) drag on an element
 *
 * @author Tigran Sargsyan <tigran.sn@gmail.com>
 * @license https://github.com/tigrr/drum/blob/master/LICENSE MIT
 */

'use strict';

/* jshint globalstrict: true, jquery: true, browser: true */


$.widget('tl.watchDrag', {
	options: {
		watchOutside: true,
		minDragInterval: 100
	},

	_create: function() {
		this._resetCoords();
		this._on(this.element, this._eventsStart);
	},

	_captureCoords: function(ev) {
		var x = ev.pageX,
			y = ev.pageY,
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
			x: null,// Mouse left offset relative to the document.
			y: null,// Mouse top offset relative to the document.
			t: null// Timestamp in milliseconds
		};
		this._coords.dx = this._coords.dy = this._coords.dt = 0;
	},

	_eventsStart: {
		mousedown: function(ev) {
			if(ev.which !== 1) return;

			this._listenOn = this.options.watchOutside ? $(window) : this.element;
			this._on(this._listenOn, this._eventsDrag);

			this._resetCoords();
			this._coords.x = ev.pageX;
			this._coords.y = ev.pageY;
			this._coords.t = Date.now();

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
			var data = $.extend({}, this._coords);

			if(Date.now() - this._coords.t <= this.options.minDragInterval) {
				data.vx = data.dx / data.dt * 1000;
				data.vy = data.dy / data.dt * 1000;
			} else {
				data.vx = data.vy = 0;
			}
			this._off(this._listenOn, 'mousemove mouseup');

			this._trigger('dragend', ev, data);
		}
	}
});
