function initDragDrop() {

	var adjustment;

	$("ol.simple_with_animation").sortable({
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


function launch_activity(callurl) {
	$.get((callurl), function(response) {
		// backup current storage and create a virtual context in local storage
		var keyHistory = [];
		var datastorePrefix = 'sugar_datastore';
		for (var i = 0 ; i < localStorage.length ; i++) {
			var key = localStorage.key(i);
			if (key.indexOf(datastorePrefix) == 0) {
				keyHistory.push(key);
			}
		}
		var lsBackup = [];
		for (var index in response.lsObj) {
			lsBackup[index] = localStorage.getItem(index);
			var encodedValue = response.lsObj[index];
			var rawValue = JSON.parse(encodedValue);
			if (rawValue.server) {
				rawValue.server.url = window.location.protocol+"//"+window.location.hostname+":"+rawValue.server.web;
				encodedValue = JSON.stringify(rawValue);
			}
			localStorage.setItem(index, encodedValue)
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
				}
			} else {
				$.notify({
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
	var list = []
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
};

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
		})
		$("#users-select2").trigger("change");
	}

	if ($("#color-select2").length > 0) {
		$("#color-select2").select2({
			templateResult: formatColorField,
			templateSelection: formatColorField
		})
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
		})
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

	//scroll
	$('.main-panel').animate({
		scrollTop: (offset - 30)
	}, 500);
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
			l10n.setLanguage(this.value);
			localStorage.setItem("languageSelection", this.value);
		};
	}
}
document.webL10n.ready(onLocalized);

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
										</div>'
				$("#" + response.element).replaceWith(html);
			} else {
				var ctx = document.getElementById(response.element).getContext('2d');
				var myChart = new Chart(ctx, {
					type: response.graph,
					data: response.data,
					options: (response.options ? response.options : {})
				});
			}
		});
	})
}

function createTable(type, element, route) {
	$(document).ready(function() {
		$.get(('/dashboard/' + (route ? route : 'graph')), {
			type: type,
			element: element
		}, function(response) {
			$('#' + response.element + ' tbody').html(response.data);
		});
	})
}
