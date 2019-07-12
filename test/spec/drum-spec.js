/* jshint jquery: true */
/* global describe, it, expect, Drum */

'use strict';


describe('Drum jQuery plugin', function() {
	const $drum = $('<div>').appendTo('body');
	const $drumFromInput = $('<input type="number" min="3" max="10" value="4" step="0.5">').appendTo('body');
	const $drumFromSelect = $('<select>').html('<option>Sunday</option><option selected>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>').appendTo('body');

	$drum.drum({
		min: 0,
		max: 100,
	});
	$drumFromInput.drum();
	$drumFromSelect.drum();

	it('sets value', function() {
		$drum.drum('option', 'min', 0);
		$drum.drum('option', 'max', 10);
		$drum.drum('option', 'value', 5);
		expect($drum.drum('option', 'value')).toBe(5);
		$drum.drum('option', 'value', '6');
		expect($drum.drum('option', 'value')).toBe(6);
		$drum.drum('value', '7');
		expect($drum.drum('value')).toBe(7);
		expect($drum.attr('aria-valuenow')).toBe('7');
	});

	it('sets min', function() {
		$drum.drum('option', 'min', 10);
		$drum.drum('option', 'min', 1);
		expect($drum.drum('option', 'min')).toBe(1);
		$drum.drum('option', 'min', '2');
		expect($drum.drum('option', 'min')).toBe(2);
		$drum.drum('min', '3');
		expect($drum.drum('min')).toBe(3);
		expect($drum.attr('aria-valuemin')).toBe('3');
	});

	it('sets max', function() {
		$drum.drum('option', 'min', 0);
		$drum.drum('option', 'max', 9);
		expect($drum.drum('option', 'max')).toBe(9);
		$drum.drum('option', 'max', '10');
		expect($drum.drum('option', 'max')).toBe(10);
		$drum.drum('max', '11');
		expect($drum.drum('max')).toBe(11);
		expect($drum.attr('aria-valuemax')).toBe('11');
	});

	it('does not accept min greater than max and max less than min', function() {
		$drum.drum('option', 'min', 2);
		$drum.drum('option', 'max', 10);
		$drum.drum('option', 'min', 11);
		expect($drum.drum('option', 'min')).toBe(2);
		$drum.drum('option', 'max', 1);
		expect($drum.drum('option', 'max')).toBe(10);
	});

	it('sets step', function() {
		$drum.drum('option', 'step', 2);
		$drum.drum('option', 'max', 10);
		$drum.drum('option', 'min', 0);
		var drumItems = $drum.find('.drum-drum').children();
		expect(drumItems[0].dataset.value).toBe('0');
		expect(drumItems[1].dataset.value).toBe('2');
		expect(drumItems.length).toBe(6);
	});

	it('reads values from the original input element', function() {
		const $drumFromInput = $('<input type="number" min="3" max="10" value="4" step="0.5">').appendTo('body');
		$drumFromInput.drum();
		expect($drumFromInput.drum('option', 'min')).toBe(3);
		expect($drumFromInput.drum('option', 'max')).toBe(10);
		expect($drumFromInput.drum('option', 'step')).toBe(.5);
		expect($drumFromInput.drum('option', 'value')).toBe(4);
		$drumFromInput.drum('destroy').drum('instance').element.remove();
		$drumFromInput.remove();
	});

	it('updates values on the original input element', function() {
		$drumFromInput.drum('option', 'min', 2);
		$drumFromInput.drum('option', 'max', 12);
		$drumFromInput.drum('option', 'step', 2);
		$drumFromInput.drum('option', 'value', 4);
		expect($drumFromInput[0].min).toBe('2');
		expect($drumFromInput[0].max).toBe('12');
		expect($drumFromInput[0].step).toBe('2');
		expect($drumFromInput[0].value).toBe('4');
	});

	it('reads values from the original select element', function() {
		const $drum = $('<select>').html('<option>Sunday</option><option selected>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>').appendTo('body');
		$drum.drum();
		expect($drum.drum('option', 'value')).toBe('Monday');
		$drum.drum('destroy').drum('instance').element.remove();
		$drum.remove();
	});

	it('updates values on the original select element', function() {
		$drumFromSelect.drum('option', 'value', 'Thursday');
		expect($drumFromSelect[0].value).toBe('Thursday');
	});

	it('throws errors for options with wrong format', function() {
		expect(function() {$drum.drum('option', 'orderAsc', 'foo');}).toThrow();
		expect(function() {$drum.drum('option', 'options', 'foo');}).toThrow();
		expect(function() {$drum.drum('option', 'acceleration', 'foo');}).toThrow();
	});

	// it('sets constrain', function() {
	// 	$drum.drum('option', 'constrain', true);
	// 	expect($drum.drum('option', 'constrain')).toBe(true);
	// 	$drum.drum('option', 'constrain', false);
	// 	expect($drum.drum('option', 'constrain')).toBe(false);
	// 	$drum.drum('option', 'constrain', 1);
	// 	expect($drum.drum('option', 'constrain')).toBe(true);
	// 	$drum.drum('option', 'constrain', '');
	// 	expect($drum.drum('option', 'constrain')).toBe(false);
	// });

	// it('can constrain value between min and max', function() {
	// 	$drum.drum('option', 'constrain', true);
	// 	$drum.drum('option', 'min', 2);
	// 	$drum.drum('option', 'max', 10);
	// 	$drum.drum('option', 'value', -2);
	// 	expect($drum.drum('option', 'value')).toBe(2);
	// 	$drum.drum('option', 'value', 20);
	// 	expect($drum.drum('option', 'value')).toBe(10);
	// 	$drum.drum('option', 'max', 8);
	// 	expect($drum.drum('option', 'value')).toBe(8);
	// 	$drum.drum('option', 'value', 3);
	// 	$drum.drum('option', 'min', 4);
	// 	expect($drum.drum('option', 'value')).toBe(4);
	// });

	// it('can extend value outside min and max, if constrain is set to false', function() {
	// 	$drum.drum('option', 'constrain', false);
	// 	$drum.drum('option', 'min', 2);
	// 	$drum.drum('option', 'max', 10);
	// 	$drum.drum('option', 'value', -2);
	// 	expect($drum.drum('option', 'value')).toBe(-2);
	// 	$drum.drum('option', 'value', 20);
	// 	expect($drum.drum('option', 'value')).toBe(20);
	// });

	// it('sets start angle', function() {
	// 	$drum.drum('option', 'startAngle', 45);
	// 	expect($drum.drum('option', 'startAngle')).toBe(45);
	// 	$drum.drum('option', 'startAngle', '90');
	// 	expect($drum.drum('option', 'startAngle')).toBe(90);
	// });

	// it('should constrain start angle between 0 and 360', function() {
	// 	$drum.drum('option', 'startAngle', -30);
	// 	expect($drum.drum('option', 'startAngle')).toBe(0);
	// 	$drum.drum('option', 'startAngle', 400);
	// 	expect($drum.drum('option', 'startAngle')).toBe(360);
	// });

	// it('goes clockwise and anticlockwise', function() {
	// 	cp.clockwise = true;
	// 	expect()
	// });
});
