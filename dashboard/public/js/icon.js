// Namespace
var icon = icon || {};

icon = (function() {

	'use strict';

	function changeColors(iconData, fillColor, strokeColor) {
		var re;
		if (fillColor) {
			re = /(<!ENTITY fill_color ")(.*)(">)/;
			iconData = iconData.replace(re, "$1" + fillColor + "$3");
		}

		if (strokeColor) {
			re = /(<!ENTITY stroke_color ")(.*)(">)/;
			iconData = iconData.replace(re, "$1" + strokeColor + "$3");

		}

		return iconData;
	}

	function load(iconInfo, callback) {
		var source = iconInfo.uri;
		var fillColor = iconInfo.fillColor;
		var strokeColor = iconInfo.strokeColor;
		var dataHeader = "data:image/svg+xml,";
		var client = new XMLHttpRequest();

		client.onload = function() {
			var iconData = this.responseText;
			var newData = changeColors(iconData, fillColor, strokeColor);
			callback(dataHeader + escape(newData));
		};

		client.open("GET", source);
		client.send();
	}

	function colorize(url, colors, uid) {

		var iconInfo = {
			"uri": url,
			"strokeColor": colors.stroke,
			"fillColor": colors.fill
		};
		load(iconInfo, function(url) {
			var ele = document.getElementById(uid);
			if (ele) {
				for (var i = 0; i < ele.childNodes.length; i++) {
					if (ele.childNodes[i].className == "xo-icon") {
						ele.childNodes[i].style.backgroundImage = "url('" + url + "')";
						ele.childNodes[i].style.backgroundSize = "30px";
					}
				}
			}
		});
	}

	function colorizeByClass(url, colors, uid) {
		var iconInfo = {
			"uri": url,
			"strokeColor": colors.stroke,
			"fillColor": colors.fill
		};
		load(iconInfo, function(url) {
			var ele = document.getElementsByClassName(uid);
			if (ele && ele.length > 0) {
				for (var i=0; i < ele.length; i++) {
					for (var j = 0; j < ele[i].childNodes.length; j++) {
						if (ele[i].childNodes[j].className == "xo-icon") {
							ele[i].childNodes[j].style.backgroundImage = "url('" + url + "')";
							ele[i].childNodes[j].style.backgroundSize = "30px";
						}
					}
				}
			}
		});
	}

	// PUBLIC INTERFACE
	return {
		load: function(url, colors, uid) {
			colorize(url, colors, uid);
		},
		loadByClass: function(url, colors, uid) {
			colorizeByClass(url, colors, uid);
		},
	};
});
