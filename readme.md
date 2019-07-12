# Drum

> Drum is responsive, accessible jQuery plugin to replace a number field or a select menu.

![](https://i.imgur.com/4XWzVFL.png)

[Demo][site]


## Getting Started

### As jQuery plugin

Download the minified [production version][jquery-min]

In your web page:
```html
<div class="drum"></div>

<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<script src="jquery.drum.min.js"></script>

<script>
  jQuery(function($) {
    $('.drum').drum();
  });
</script>
```

#### A note about jQuery file
The plugin uses jQuery Widget Factory. Two files are available: one that contains the Widget Factory code, and one that doesn't.
1. You can use the smaller `jquery.drum.bare.min.js`, if you have already included the jQuery Widget Factory or another native jQuery widget in your page.
1. Otherwise you must use `jquery.drum.min.js`, which includes the jQuery Widget Factory code.


## Usage
### Initiate Drum

```js
$('.drum').drum(options);
```
where `options` is object map of options (optional).


### Options
You can customize Drum with these options by either passing options object at initiation, or setting them later, e. g.:

```js
$('.drum').drum('option', 'value', 20);
```
or
```js
$('.drum').drum('option', {
	max: 100,
	value: 20,
});
```

#### All available options

| Option     | Type    | Default | Description |
| ------     | ----    | ------- | ----------- |
| type | string | number | Type: either numer or select (currently it is not possible to change type after initialization) |
| min | number | 0 | Minimum value (for type=number) |
| max | number | Infinity | Maximum value (for type=number) |
| step | number | 1 | Increment step (for type=number) |
| options | array | [] | Array of items for type=select. Supported format is either strings or objects {value: 'value', label: 'Value'} |
| orderAsc | boolean | true | Whether the items are displayed in ascending order or descending |
| watchOutside | boolean | true | Whether dragging outside the widget rigion should be counted |
| edgeLimit | number | 0.8 | Limit where the drum can reach on the edges as part of the viewport.<br>E.g. edgeLimit: 1 means the drum can be spinned to the viewport edge but no further.<br>edgeLimit: .5 - the drum can't go further than half the viewport.<br>valuew higher than 1 will let the drum go beyond viewport. |
| acceleration | number | 300 | Drum acceleration (deceleration) |
| renderItemsNum | integer | 100 | Number of items to render in the drum. If total number of items is more, they will be inserted as the drum rolls closer to the edge. |
| maxSpinOffset | number | 500 | Maximum offset the drum can spin to after a swipe in pixels |

To customize widget's appearance, you can style its underlying HTML elements with CSS.
The elements are:

| Class               | Description |
| ------------------- | ----------- |
| `drum-viewport`     | The viewport container |
| `drum-drum`         | The drum containing all the items. Stretches outside the viewport |
| `drum-item`         | Single item inside the drum |
| `drum-item-current` | Currently selected drum item |

You can also add classes using option:
```js
$('.drum').drum('option', 'classes.drum-viewport', 'my-container-name');
```


The default options are stored in jQuery.fn.drum.defaults. You can override them, so that all instances will be created with the overridden options.


## Browser Support
Chrome, Firefox, Safari, Edge and IE 11 are supported.


## License
© 2019 Tigran Sargsyan

Licensed under [the MIT License][license]


[jquery-min]: https://raw.githubusercontent.com/tigrr/drum/master/jquery.drum.min.js
[site]: https://tigrr.github.io/drum/
[license]: https://github.com/tigrr/drum/blob/master/LICENSE
