function initDragDrop() {

	var adjustment;

	$("ol.simple_with_animation").sortable({
		handle: '.draggable',
		group: 'simple_with_animation',
		pullPlaceholder: false,
		placeholder: '<div class="placeholder"></div>',
		// animation on drop
		onDrop: function($item, container, _super) {
			var $clonedItem = $('<li/>').css({
				height: 0
			});
			$item.before($clonedItem);
			$clonedItem.animate({
				'height': $item.height()
			});

			$item.animate($clonedItem.position(), function() {
				$clonedItem.detach();
				_super($item, container);
			});

			//update activities
			updateActivities();
		},

		// set $item relative to cursor position
		onDragStart: function($item, container, _super) {
			var offset = $item.offset(),
				pointer = container.rootGroup.pointer;

			adjustment = {
				left: pointer.left - offset.left,
				top: pointer.top - offset.top
			};

			_super($item, container);
		},
		onDrag: function($item, position) {
			$item.css({
				left: position.left - adjustment.left,
				top: position.top - adjustment.top
			});
		}
	});
}

// -- HTML5 IndexedDB handling
var html5indexedDB = {};
html5indexedDB.db = null;
var filestoreName = 'sugar_filestore';

// Test indexedDB support
html5indexedDB.test = function() {
	return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
};

// Load database or create database on first launch
html5indexedDB.load = function(then) {
	if (html5indexedDB.db != null) {
		then(null);
		return;
	}
	if (!html5indexedDB.test()) {
		if (then) {
			then(-1);
		}
		return;
	}
	var request = window.indexedDB.open(filestoreName, 1);
	request.onerror = function() {
		if (then) {
			then(-2);
		}
	};
	request.onsuccess = function() {
		html5indexedDB.db = request.result;
		if (then) {
			then(null);
		}
	};
	request.onupgradeneeded = function(event) {
		var db = event.target.result;
		var objectStore = db.createObjectStore(filestoreName, {keyPath: "objectId"});
		objectStore.createIndex("objectId", "objectId", { unique: true });
	};
};

// Set a value in the database
html5indexedDB.setValue = function(key, value, then) {
	var transaction = html5indexedDB.db.transaction([filestoreName], "readwrite");
	var objectStore = transaction.objectStore(filestoreName);
	var request = objectStore.put({objectId: key, text: value});
	request.onerror = function() {
		if (then) {
			then(request.errorCode);
		}
	};
	request.onsuccess = function() {
		if (then) {
			then(null);
		}
	};
};

// Remove a value from the database
html5indexedDB.removeValue = function(key, then) {
	var transaction = html5indexedDB.db.transaction([filestoreName], "readwrite");
	var objectStore = transaction.objectStore(filestoreName);
	var request = objectStore.delete(key);
	request.onerror = function() {
		if (then) {
			then(request.errorCode);
		}
	};
	request.onsuccess = function() {
		if (then) {
			then(null);
		}
	};
};

function launch_activity(callurl) {
	function loadDataDeprec(response, lsBackup) {
		for (var index in response.lsObj) {
			lsBackup[index] = localStorage.getItem(index);
			var encodedValue = response.lsObj[index];
			var rawValue = JSON.parse(encodedValue);
			if (rawValue && rawValue.server) {
				rawValue.server.url = window.location.protocol+"//"+window.location.hostname+":"+rawValue.server.web;
				encodedValue = JSON.stringify(rawValue);
			}
			localStorage.setItem(index, encodedValue);
		}
	}

	function loadData(response, lsBackup) {
		for (var index in response.lsObj) {
			lsBackup[index] = localStorage.getItem(index);
			if (index == "sugar_datastoretext_" + response.objectId) {
				html5indexedDB.setValue(response.objectId, response.lsObj[index]);
			} else {
				var encodedValue = response.lsObj[index];
				var rawValue = JSON.parse(encodedValue);
				if (rawValue && rawValue.server) {
					rawValue.server.url = window.location.protocol+"//"+window.location.hostname+":"+rawValue.server.web;
					encodedValue = JSON.stringify(rawValue);
				}
				localStorage.setItem(index, encodedValue);
			}
		}
	}

	$.get((callurl), function(response) {
		if (response.error) {
			$.notify({
				icon: "error",
				message: response.error
			},{
				type: 'danger'
			});
		}
		// backup current storage and create a virtual context in local storage
		var keyHistory = [];
		var datastorePrefix = 'sugar_datastore';
		for (var i = 0 ; i < localStorage.length ; i++) {
			var key = localStorage.key(i);
			if (key.indexOf(datastorePrefix) == 0) {
				keyHistory.push(key);
			}
		}

		// Check Sugarizer Version -- Backward Compatibilty
		var lsBackup = [];
		if (response.version > 1.1) {
			if (html5indexedDB.db == null) {
				html5indexedDB.load(function(err) {
					if (err) {
						console.log("FATAL ERROR: indexedDB not supported, could be related to use of private mode");
					} else {
						loadData(response, lsBackup);
					}
				});
			} else {
				loadData(response, lsBackup);
			}
		} else {
			loadDataDeprec(response, lsBackup);
		}

		// open window
		if (response.url) {
			var win = window.open(response.url+"&sa=1", '_blank');
			if (win) {
				win.focus();
				win.onbeforeunload = function(){
					// restore old context
					for (var index in lsBackup) {
						if (lsBackup[index] == null) {
							localStorage.removeItem(index);
						} else {
							localStorage.setItem(index, lsBackup[index]);
						}
					}

					// remove created storage
					for (var i = 0 ; i < localStorage.length ; i++) {
						var key = localStorage.key(i);
						if (key.indexOf(datastorePrefix) == -1) {
							continue;
						}
						var found = false;
						for (var j = 0 ; !found && j < keyHistory.length ; j++) {
							if (keyHistory[j] == key) {
								found = true;
							}
						}
						if (!found) {
							localStorage.removeItem(key);
						}
					}

					// // Remove IndexDB storage
					if (response.version > 1.1 && html5indexedDB.db != null) {
						html5indexedDB.removeValue(response.objectId);
					}
				};
			} else {
				$.notify({
					icon: "error",
					message: document.webL10n.get('CantOpenWindow')
				},{
					type: 'danger'
				});
			}
		}
	});
}

function updateActivities() {

	//get favorites
	var list = [];
	$.each($('[name="favoriteActivities"]:checked'), function(index, value) {
		list.push($(this).parent().data('id'));
	});
	var data = {
		favorites: list.join()
	};

	$.post((url + 'api/v1/activities?' + decodeURIComponent($.param({
		x_key: headers['x-key'],
		access_token: headers['x-access-token']
	}))), data, function(response) {
		$.notify({
			icon: "notifications",
			message: document.webL10n.get('successActivityUpdate')
		}, {
			type: 'success',
			timer: 2000,
			placement: {
				from: 'top',
				align: 'right'
			}
		});
	});
}

function initChartDragDrop() {
	var adjustment;

	$("ol.simple_with_animation").sortable({
		handle: '.draggable',
		group: 'simple_with_animation',
		pullPlaceholder: false,
		placeholder: '<div class="placeholder"></div>',
		// animation on drop
		onDrop: function($item, container, _super) {
			var $clonedItem = $('<li/>').css({
				height: 0
			});
			$item.before($clonedItem);
			$clonedItem.animate({
				'height': $item.height()
			});

			$item.animate($clonedItem.position(), function() {
				$clonedItem.detach();
				_super($item, container);
			});

			// Update chart order
			updateChartOrder();
		},

		// set $item relative to cursor position
		onDragStart: function($item, container, _super) {
			var offset = $item.offset(),
				pointer = container.rootGroup.pointer;

			adjustment = {
				left: pointer.left - offset.left,
				top: pointer.top - offset.top
			};

			_super($item, container);
		},
		onDrag: function($item, position) {
			$item.css({
				left: position.left - adjustment.left,
				top: position.top - adjustment.top
			});
		}
	});
}

function updateChartOrder() {
	var list = [];
	$.each($('[name="hiddenCharts"]'), function(index, value) {
		list.push($(this).parent().data('id'));
	});
	console.log(list);
	var data = {
		chart: JSON.stringify({
			list: list
		})
	};

	$.ajax({
		url: (url + 'api/v1/charts/reorder' + '?' + decodeURIComponent($.param({
			x_key: headers['x-key'],
			access_token: headers['x-access-token']
		}))),
		type: 'PUT',
		data: data,
		success: function(result) {
			$.notify({
				icon: "notifications",
				message: document.webL10n.get('successChartUpdate')
			}, {
				type: 'success',
				timer: 2000,
				placement: {
					from: 'top',
					align: 'right'
				}
			});
		}
	});
}

function updateChart(chartid) {
	if (!chartid) return;
	var hidden = false;
	if ($('#' + chartid).is(":checked")) {
		hidden = true;
	}
	var data = {
		chart: JSON.stringify({
			hidden: hidden
		})
	};

	$.ajax({
		url: (url + 'api/v1/charts/' + chartid + '?' + decodeURIComponent($.param({
			x_key: headers['x-key'],
			access_token: headers['x-access-token']
		}))),
		type: 'PUT',
		data: data,
		success: function(result) {
			$.notify({
				icon: "notifications",
				message: document.webL10n.get('successChartUpdate')
			}, {
				type: 'success',
				timer: 2000,
				placement: {
					from: 'top',
					align: 'right'
				}
			});
		}
	});
}

function formatUserField(state) {
	if (!state.id) {
		return state.text;
	}
	var $state = $(
		'<div class="student" id="' + $(state.element).data('id') + '">\
			<div class="xo-icon"></div>\
			<div class="name">' + state.text + '</div>\
			<div class="timestamp">' + $(state.element).data('timestamp') + '</div>\
		</div>'
	);
	new icon().load("/public/img/owner-icon.svg", $(state.element).data('color'), $(state.element).data('id'));
	return $state;
}

function formatColorField(state) {
	if (!state.id) {
		return $(state.element).val();
	}
	var id = $(state.element).data('stroke') + $(state.element).data('fill') + Math.floor((Math.random() * 100) + 1);
	var $state = $(
		'<div class="color" id="' + id + '">\
			<div class="xo-icon"></div>\
			<div class="stroke">Stroke - ' + $(state.element).data('stroke') + '</div>\
			<div class="fill">Fill - ' + $(state.element).data('fill') + '</div>\
		</div>'
	);
	if ($(state.element).data('icon')) {
		new icon().load("/public/img/"+$(state.element).data('icon')+".svg", JSON.parse($(state.element).val()), id);
	} else {
		new icon().load("/public/img/owner-icon.svg", JSON.parse($(state.element).val()), id);
	}
	return $state;
}

function matchColorField(params, data) {
	if ($.trim(params.term) === '') {
		return data;
	}
	params.term = params.term.toUpperCase();

	if (typeof data.text === 'undefined') {
		return null;
	}

	if (data.id.indexOf(params.term) > -1) {
		var modifiedData = $.extend({}, data, true);
		modifiedData.text += ' (matched)';
		return modifiedData;
	}

	return null;
}

$(document).ready(function() {
	if ($("#users-select2").length > 0) {
		$("#users-select2").select2({
			templateResult: formatUserField
		}).on("change", function(e) {
			var pj = $("#users-select2 option:selected").data('private_journal');
			var sj = $("#users-select2 option:selected").data('shared_journal');
			$('#journal-type-select2').trigger("change");
			if ($("#journal-type-select2 option:selected").val() == 'shared') {
				$('#getJournalEntries').attr('action', '/dashboard/journal/' + sj);
			} else {
				$('#getJournalEntries').attr('action', '/dashboard/journal/' + pj);
			}
		});
		$("#users-select2").trigger("change");
	}

	if ($("#color-select2").length > 0) {
		$("#color-select2").select2({
			templateResult: formatColorField,
			templateSelection: formatColorField,
			matcher: matchColorField
		});
	}

	if ($("#journal-type-select2").length > 0) {
		$("#journal-type-select2").select2().on("change", function(e) {
			var pj = $("#users-select2 option:selected").data('private_journal');
			var sj = $("#users-select2 option:selected").data('shared_journal');
			if ($("#journal-type-select2 option:selected").val() == 'shared') {
				$('#getJournalEntries').attr('action', '/dashboard/journal/' + sj);
			} else {
				$('#getJournalEntries').attr('action', '/dashboard/journal/' + pj);
			}
		});
	}
});


function highlight(text) {

	//set var
	var offset = -1;
	var text = text.toLowerCase().trim();

	//search elemetns for text
	$('.search_textbox').each(function() {

		//get data
		var inputText = $(this).text();
		var index = inputText.toLowerCase().indexOf(text);

		//check
		if (index >= 0 && text.length > 0) {
			if (offset == -1) {
				offset = $(this).offset().top;
			}
			inputText = inputText.substring(0, index) + "<span class='highlight'>" + inputText.substring(index, index + text.length) + "</span>" + inputText.substring(index + text.length);
		}
		$(this).html(inputText);
	});

	//show error
	if (offset === -1 && text !== '') {
		$('.control-label').removeClass('hidden');
		$('.search_query')
			.parent()
			.addClass('label-floating has-error is-focused')
			.removeClass('form-black is-empty');
	} else {
		$('.control-label').addClass('hidden');
		$('.search_query')
			.parent()
			.removeClass('label-floating has-error is-focused');
	}

	//scroll
	if ($(window).width() < 992) {
		$('.main-panel').animate({
			scrollTop: (offset - 86)
		}, 500);
	} else {
		$('.main-panel').animate({
			scrollTop: (offset - 30)
		}, 500);
	}
}

//hide label when input is empty
function hideLabel(value) {
	if (value === '') {
		$('.control-label').addClass('hidden');
		highlight('');
	}
}

// localization
function onLocalized() {
	var l10n = document.webL10n;
	var lang = document.getElementById('languageSelection');

	if (lang != null) {
		if (lang.selectedIndex == -1) {
			lang.value = l10n.getLanguage();
		} else if (localStorage.getItem("languageSelection") == null) {
			l10n.setLanguage(lang.options[lang.selectedIndex].value);
		} else {
			l10n.setLanguage(localStorage.getItem("languageSelection"));
			lang.value = localStorage.getItem("languageSelection");
		}
		lang.onchange = function() {
			localStorage.setItem("languageSelection", this.value);
			location.href = window.location.pathname + "?lang="+lang.value;
		};
	}
}
document.webL10n.ready(onLocalized);

// Initiate localization in mobile view
$(document).ready(function() {
	var toggle = document.getElementById('navbar-toggle');

	if (toggle != null) {
		toggle.addEventListener("click", function(){
			document.webL10n.ready(onLocalized);
		});
	}
});

// graph create
function createGraph(type, element, route) {
	$(document).ready(function() {
		$.get(('/dashboard/' + (route ? route : 'graph')), {
			type: type,
			element: element
		}, function(response) {

			//check for data
			if (response.data.datasets[0].data.length == 0) {
				var html = '<div class="text-center">\
											<i class="material-icons dp96 text-muted">info_outline</i>\
											<p data-l10n-id="noGraphDataText">' + document.webL10n.get('noGraphDataText') + '</p>\
										</div>';
				$("#" + response.element).replaceWith(html);
			} else {
				var ctx = document.getElementById(response.element).getContext('2d');
				var myChart = new Chart(ctx, {
					type: response.graph,
					data: response.data,
					options: (response.options ? response.options : {})
				});
				if (type == 'top-contributor') {
					myChart.options.onClick = function(e) {
						var activePoints = myChart.getElementsAtEvent(e);
						// Avoid console erros when clicking on any white space in the chart
						var index = activePoints.length ? activePoints[0]._index : -1;
						if (index > -1) {
							window.location.href = "/dashboard/journal/" + response.journalIDs[index] + "?uid=" + response.userIDs[index] + "&type=private";
						}
					};
				} else if (type == 'top-activities') {
					myChart.options.onClick = function(e) {
						var activePoints = myChart.getElementsAtEvent(e);
						// Avoid console erros when clicking on any white space in the chart
						var index = activePoints.length ? activePoints[0]._index : -1;
						if (index > -1) {
							window.location.href = "javascript:launch_activity('/dashboard/activities/launch?aid="+response.activityIDs[index]+"')";
						}
					};
				}
			}
		});
	});
}

function createTable(type, element, route) {
	$(document).ready(function() {
		$.get(('/dashboard/' + (route ? route : 'graph')), {
			type: type,
			element: element
		}, function(response) {
			$('#' + response.element + ' tbody').html(response.data);
		});
	});
}

function convertToCSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';

	for (var i = 0; i < array.length; i++) {
		var line = '';
		var flag = false;
		for (var index in array[i]) {
			if (flag) line += ',';
			flag = true;

			try {
				JSON.parse(array[i][index]);
				line += array[i][index];
			} catch (e) {
				line += JSON.stringify(array[i][index]);
			}
		}

		str += line + '\r\n';
	}

	return str;
}

function exportCSVFile(headers, items, fileTitle) {
	if (headers) {
		items.unshift(headers);
	}

	// Convert Object to JSON
	var jsonObject = JSON.stringify(items);

	var csv = this.convertToCSV(jsonObject);

	var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

	var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	if (navigator.msSaveBlob) { // IE 10+
		navigator.msSaveBlob(blob, exportedFilenmae);
	} else {
		var link = document.createElement("a");
		if (link.download !== undefined) { // feature detection
			// Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", exportedFilenmae);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}

function getJsonFromUrl(url) {
	if(!url) url = location.search;
	var query = url.substr(1);
	var result = {};
	query.split("&").forEach(function(part) {
		var item = part.split("=");
		result[item[0]] = decodeURIComponent(item[1]);
	});
	return result;
}

function handleSort() {
	var query = getJsonFromUrl();
	if (query.sort) {
		if (query.sort == "+name" || query.sort == " name") {
			document.getElementById("name-column").innerHTML = document.getElementById("name-column").innerHTML + '<i class="arrow up"></i>';
		} else if (query.sort == "-name") {
			document.getElementById("name-column").innerHTML += '<i class="arrow down"></i>';
		} else if (query.sort == "+timestamp" || query.sort == " timestamp") {
			document.getElementById("last-column").innerHTML += '<i class="arrow up"></i>';
		} else if (query.sort == "-timestamp") {
			document.getElementById("last-column").innerHTML += '<i class="arrow down"></i>';
		} else if (query.sort == "+textsize" || query.sort == " textsize") {
			document.getElementById("journal-size").innerHTML += '<i class="arrow up"></i>';
		} else if (query.sort == "-textsize") {
			document.getElementById("journal-size").innerHTML += '<i class="arrow down"></i>';
		}  else if (query.sort == "+title" || query.sort == " title") {
			document.getElementById("journal-title").innerHTML += '<i class="arrow up"></i>';
		} else if (query.sort == "-title") {
			document.getElementById("journal-title").innerHTML += '<i class="arrow down"></i>';
		}
	}
}

function sortBy(params) {
	var query = getJsonFromUrl();
	var prev = "";
	if (query['sort']) {
		prev = query['sort'];
	}
	if (params == "name") {
		if (prev == "-name") {
			query['sort'] = "+name";
		} else {
			query['sort'] = "-name";
		}
	} else if (params == "time") {
		if (prev == "+timestamp" || prev == " timestamp") {
			query['sort'] = "-timestamp";
		} else if (prev == "-timestamp") {
			delete query.sort;
		} else {
			query['sort'] = "+timestamp";
		}
	} else if (params == "size") {
		if (prev == "+textsize" || prev == " textsize") {
			query['sort'] = "-textsize";
		} else if (prev == "-textsize") {
			delete query.sort;
		} else {
			query['sort'] = "+textsize";
		}
	} else if (params == "title") {
		if (prev == "+title" || prev == " title") {
			query['sort'] = "-title";
		} else if (prev == "-title") {
			delete query.sort;
		} else {
			query['sort'] = "+title";
		}
	} else {
		delete query.sort;
	}

	var url = location.origin + location.pathname + '?';
	for (var key in query) {
		if (key && query.hasOwnProperty(key)) {
			var val = query[key];
			url += key + '=' + val + '&';
		}
	}
	window.location.href = url;
}

function launchTutorial() {
	if (window.currTour && typeof window.currTour.restart == "function") {
		window.currTour.restart();
	}
}
