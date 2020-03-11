function initDragDrop() {

	$("ol.simple_with_animation").sortable({
		handle: '.draggable',
		axis: 'y',
		containment: 'parent',
		animation: 150,
		scrollSensitivity: 50,
		scrollSpeed: 15,
		update: function (event, ui) {
			//update activities
			updateActivities();
		},
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

function base64toBlob(mimetype, base64) {
	var contentType = mimetype;
	var byteCharacters = atob(base64.substr(base64.indexOf(';base64,')+8));
	var byteArrays = [];
	for (var offset = 0; offset < byteCharacters.length; offset += 1024) {
		var slice = byteCharacters.slice(offset, offset + 1024);
		var byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}
		var byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}
	var blob = new Blob(byteArrays, {type: contentType});
	return blob;
}

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

	function loadData(response, lsBackup, callback) {
		var len = 0;
		for (var index in response.lsObj) {
			len++;
		}
		var lastCall = function() {
			if (--len == 0) {
				callback();
			}
		};
		for (var index in response.lsObj) {
			lsBackup[index] = localStorage.getItem(index);
			if (index == "sugar_datastoretext_" + response.objectId) {
				html5indexedDB.setValue(response.objectId, response.lsObj[index], lastCall);
			} else {
				var encodedValue = response.lsObj[index];
				var rawValue = JSON.parse(encodedValue);
				if (rawValue && rawValue.server) {
					rawValue.server.url = window.location.protocol+"//"+window.location.hostname+":"+rawValue.server.web;
					encodedValue = JSON.stringify(rawValue);
				}
				localStorage.setItem(index, encodedValue);
				lastCall();
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

		var metadata = {};
		if (response && response.lsObj) {
			try {
				metadata = JSON.parse(response.lsObj["sugar_datastore_" + response.objectId]);
			} catch (e) {
				metadata = response.lsObj["sugar_datastore_" + response.objectId];
			}
		}
		if (metadata && metadata.metadata && metadata.metadata.mimetype == "application/pdf") {
			// Convert blob object URL
			var blob = base64toBlob(metadata.metadata.mimetype, response.lsObj["sugar_datastoretext_" + response.objectId]);
			var blobUrl = URL.createObjectURL(blob);

			// Open in a new browser tab
			window.open(blobUrl, '_blank');
			return;
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

		// open window
		var openInWindow = function() {
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

						// Remove IndexDB storage if was not already there
						if (response.version > 1.1 && html5indexedDB.db != null) {
							if (!lsBackup["sugar_datastore_"+response.objectId]) {
								html5indexedDB.removeValue(response.objectId);
							}
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
		};

		// Check Sugarizer Version -- Backward Compatibilty
		var lsBackup = [];
		if (response.version > 1.1) {
			if (html5indexedDB.db == null) {
				html5indexedDB.load(function(err) {
					if (err) {
						console.log("FATAL ERROR: indexedDB not supported, could be related to use of private mode");
					} else {
						loadData(response, lsBackup, function() {
							openInWindow();
						});
					}
				});
			} else {
				loadData(response, lsBackup, function() {
					openInWindow();
				});
			}
		} else {
			loadDataDeprec(response, lsBackup);
			openInWindow();
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
	$("ol.simple_with_animation").sortable({
		handle: '.draggable',
		axis: 'y',
		containment: 'parent',
		animation: 150,
		scrollSensitivity: 50,
		scrollSpeed: 15,
		update: function (event, ui) {
			//update chart order
			updateChartOrder();
		},
	});
}

function updateChartOrder() {
	var list = [];
	$.each($('[name="hiddenCharts"]'), function(index, value) {
		list.push($(this).parent().data('id'));
	});
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
	if (!state._id) {
		return state.text;
	}
	var d = new Date(state.timestamp);
	var $state = $(
		'<div class="student" id="' + state._id + '">\
			<div class="xo-icon"></div>\
			<div class="name">' + state.name + '</div>\
			<div class="timestamp">' + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + '</div>\
		</div>\
		<script>\
			new icon().load("/public/img/owner-icon.svg", ' + JSON.stringify(state.color) + ', "' + state._id + '");\
		</script>'
	);
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
	document.webL10n.ready(function() {
		var refreshIntervalId = setInterval(function() {
			if (document.webL10n.getReadyState() == "complete") {
				clearInterval(refreshIntervalId);
				if ($("#users-select2").length > 0) {
					$("#users-select2").select2({
						ajax: {
							url: "/dashboard/users/search",
							dataType: 'json',
							delay: 250,
							data: function (params) {
								return {
									q: params.term,
									role: 'stuteach'
								};
							},
							processResults: function (data) {
								if (data && data.data && data.data.users && data.data.users.length > 0) {
									for (var i=0; i<data.data.users.length; i++) {
										data.data.users[i].id = data.data.users[i]._id;
										data.data.users[i].text = data.data.users[i].name;
									}
									return {
										results: data.data.users
									};
								} else {
									return {
										results: []
									};
								}
							},
							cache: true
						},
						templateResult: formatUserField,
						placeholder: document.webL10n.get("searchUser")
					}).on("select2:select", function (e) {
						if (e.params && e.params.data && (e.params.data.private_journal || e.params.data.shared_journal)) {
							document.pj_global = e.params.data.private_journal;
							document.sj_global = e.params.data.shared_journal;
							$('#getJournalEntries').attr('action', '/dashboard/journal/' + document.pj_global);
						}
					}).on("change", function(e) {
						if ($("#users-select2 option:selected").data('private_journal') || $("#users-select2 option:selected").data('shared_journal')) {
							document.pj_global = $("#users-select2 option:selected").data('private_journal');
							document.sj_global = $("#users-select2 option:selected").data('shared_journal');
							$('#getJournalEntries').attr('action', '/dashboard/journal/' + document.pj_global);
						}
					});
					$("#users-select2").trigger("change");
				}
			}
		}, 100);
	});

	if ($("#color-select2").length > 0) {
		$("#color-select2").select2({
			templateResult: formatColorField,
			templateSelection: formatColorField,
			matcher: matchColorField
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
		if (key && Object.prototype.hasOwnProperty.call(query, key)) {
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

function generateQRCode() {
	var placeholder = document.getElementById("qrplaceholder");
	placeholder.innerHTML = "";
	var qrCode = new QRCode("qrplaceholder", {width: 300, height: 300, colorDark: "#000000", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H});
	qrCode.clear();
	qrCode.makeCode(window.location.protocol+"//"+window.location.host);
	$('#qrpopup').on('show.bs.modal', function () {
		$(this).find('.modal-dialog').css({width:'350px',height:'350px'});
	});
	$("#qrpopup").modal();
}

// Decoding functions taken from
// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
function b64ToUint6(nChr) {
	return nChr > 64 && nChr < 91 ?
		nChr - 65
		: nChr > 96 && nChr < 123 ?
			nChr - 71
			: nChr > 47 && nChr < 58 ?
				nChr + 4
				: nChr === 43 ?
					62
					: nChr === 47 ?
						63
						:
						0;
}

function base64DecToArr(sBase64, nBlocksSize) {
	var
		sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, ""), nInLen = sB64Enc.length,
		nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen);
	for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
		nMod4 = nInIdx & 3;
		nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
				taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
			}
			nUint24 = 0;
		}
	}
	return taBytes;
}

// Write a new file
function writeFile(metadata, content, callback) {
	var binary = null;
	var text = null;
	var extension = "json";
	var title = metadata.title;
	var mimetype = 'application/json';
	if (metadata && metadata.mimetype) {
		mimetype = metadata.mimetype;
		if (mimetype == "image/jpeg") {
			extension = "jpg";
		} else if (mimetype == "image/png") {
			extension = "png";
		} else if (mimetype == "audio/wav") {
			extension = "wav";
		} else if (mimetype == "video/webm") {
			extension = "webm";
		} else if (mimetype == "audio/mp3"||mimetype == "audio/mpeg") {
			extension = "mp3";
		} else if (mimetype == "video/mp4") {
			extension = "mp4";
		} else if (mimetype == "text/plain") {
			extension = "txt";
			text = content;
		} else if (mimetype == "application/pdf") {
			extension = "pdf";
		} else if (mimetype == "application/msword") {
			extension = "doc";
		} else if (mimetype == "application/vnd.oasis.opendocument.text") {
			extension = "odt";
		} else {
			extension = "bin";
		}
		binary = base64DecToArr(content.substr(content.indexOf('base64,')+7)).buffer;
	} else {
		text = JSON.stringify({metadata: metadata, text: content});
	}
	var filename = title;
	if (filename.indexOf("."+extension)==-1) {
		filename += "."+extension;
	}
	var blob = new Blob((text?[text]:[binary]), {type:mimetype});
	callback(blob, filename);
}

function download_activity(callurl) {
	$.get((callurl), function(response) {
		if (response.error) {
			$.notify({
				icon: "error",
				message: response.error
			},{
				type: 'danger'
			});
		}

		var metadata = {};
		
		if (response && response.lsObj) {
			try {
				metadata = JSON.parse(response.lsObj["sugar_datastore_" + response.objectId]);
			} catch (e) {
				metadata = response.lsObj["sugar_datastore_" + response.objectId];
			}
			writeFile(metadata.metadata, response.lsObj["sugar_datastoretext_" + response.objectId], function(blob, filename) {
				saveAs(blob, filename);
			});
		}
	});
}

// Write file content to datastore
function writeFileToStore(file, text, callback) {
	if (file.type == 'application/json') {
		// Handle JSON file
		var data = null;
		try {
			data = JSON.parse(text);
			if (!data.metadata) {
				callback(file.name, -1);
				return;
			}
		} catch(e) {
			callback(file.name, -1);
			return;
		}
		callback(file.name, 0, data.metadata, data.text);
	} else {
		var activity = "";
		if (file.type != "text/plain" && file.type != "application/pdf" && file.type != "application/msword" && file.type != "application/vnd.oasis.opendocument.text") {
			activity = "org.olpcfrance.MediaViewerActivity";
		}
		var metadata = {
			title: file.name,
			mimetype: file.type,
			activity: activity
		};
		callback(file.name, 0, metadata, text);
	}
}

// Create a uuid
function createUUID() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	return uuid;
}

function upload_journal(files, journalId, name, user_id, color) {
	var file = files[0];
	var reader = new FileReader();
	reader.onload = function() {
		writeFileToStore(file, reader.result, function(filename, err, metadata, text) {
			if (err) {
				return;
			}
			metadata["timestamp"] = new Date().getTime();
			metadata["creation_time"] = new Date().getTime();

			if (text) {
				metadata["textsize"] = text.length;
			}
			if (name) {
				metadata["buddy_name"] = name;
			}
			if (color) {
				metadata["buddy_color"] = color;
			} else if (!metadata["buddy_color"]) {
				metadata["buddy_color"] = {
					"stroke": "#005FE4",
					"fill": "#FF2B34"
				};
			}
			if (user_id) {
				metadata["user_id"] = user_id;
			}

			var entry = JSON.stringify({
				"objectId": createUUID(),
				"text": text,
				"metadata": metadata
			});

			$.post(('/api/v1/journal/' + journalId + '/?'+ decodeURIComponent($.param({
				x_key: headers['x-key'],
				access_token: headers['x-access-token']
			}))), {
				"journal": entry
			}, function(res) {
				var timer = 2000;
				if (res && res.objectId) {
					$.notify({
						icon: "notifications",
						message: document.webL10n.get('journalUploaded', {title: metadata.title})

					},{
						type: 'success',
						timer: timer,
						placement: {
							from: 'top',
							align: 'right'
						}
					});
				} else {
					$.notify({
						icon: "error",
						message: document.webL10n.get('journalUploadError')
					},{
						type: 'danger',
						timer: timer,
						placement: {
							from: 'top',
							align: 'right'
						}
					});
				}
				setTimeout(function () {
					location.reload();
				}, timer);
			});
		});
		
	};

	if (file) {
		if (file.type == 'application/json' || file.type == 'text/plain') {
			reader.readAsText(file);
		} else {
			reader.readAsDataURL(file);
		}
	}
}
