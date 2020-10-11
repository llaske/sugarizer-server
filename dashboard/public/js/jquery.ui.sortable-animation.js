/*!
 * jQuery UI Sortable Animation 0.0.1
 *
 * Copyright 2015, Egor Sharapov
 * Licensed under the MIT license.
 *
 * Depends:
 *  jquery.ui.sortable.js
 */
(function(factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery", "jquery-ui"], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function($) {
  var supports = {},
      testProp = function (prefixes) {
        var test_el = document.createElement('div'), i, l;

        for (i = 0; l = prefixes.length, i < l; i++) {
          if (test_el.style[prefixes[i]] != undefined) {
            return prefixes[i];
          }
        }

        return '';
      },
      use_css_animation = false;

  // check for css-transforms support
  supports['transform'] = testProp([
    'transform', 'WebkitTransform',
    'MozTransform', 'OTransform',
    'msTransform'
  ]);

  // check for css-transitions support
  supports['transition'] = testProp([
    'transition', 'WebkitTransition',
    'MozTransition', 'OTransition',
    'msTransition'
  ]);

  use_css_animation = supports['transform'] && supports['transition'];

  $.widget("ui.sortable", $.ui.sortable, {
    options: {
      // adds the new `animation` option, turned off by default.
      animation: 0,
    },

    // called internally by sortable when sortable
    // items are rearranged.
    _rearrange: function (e, item) {
      var $item,
          props = {},
          reset_props = {},
          offset,
          axis = $.trim(this.options.axis);

      // just call the original implementation of _rearrange()
      // if option `animation` is turned off
      // `currentContainer` used for animating received items
      // from another sortable container (`connectWith` option)
      if (!parseInt(this.currentContainer.options.animation) ||
          !axis
      ) {
        return this._superApply(arguments);
      }

      $item = $(item.item[0]);
      // if moved up, then move item up to its height,
      // if moved down, then move item down
      offset = (this.direction == 'up' ? '' : '-') + ($item[axis == 'x' ? 'width' : 'height']()) + 'px';

      // call original _rearrange() at first
      this._superApply(arguments);

      // prepare starting css props
      if (use_css_animation) {
        props[supports['transform']] = (axis == 'x' ? 'translateX' : 'translateY') + '(' + offset + ')';
      } else {
        props = {
          position: 'relative',
        };
        props[axis == 'x' ? 'left' : 'top'] = offset;
      }

      // set starting css props on item
      $item.css(props);

      // if css animations are not supported
      // use jQuery animations
      if (use_css_animation) {
        props[supports['transition']] = supports['transform'] + ' ' + this.options.animation + 'ms';
        props[supports['transform']] = '';
        reset_props[supports['transform']] = '';
        reset_props[supports['transition']] = '';

        setTimeout(function () {
          $item.css(props);
        }, 0);
      } else {
        reset_props.top = '';
        reset_props.position = '';

        $item.animate({
          top: '',
          position: ''
        }, this.options.animation);
      }

      // after animation ends
      // clear changed for animation props
      setTimeout(function () {
        $item.css(reset_props);
      }, this.options.animation);
    }
  });
}));
