function initDragDrop() {
	var adjustment;

	$("ol.simple_with_animation").sortable({
		group: 'simple_with_animation',
		pullPlaceholder: false,
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
			updateActivties();
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


function updateActivties() {

	//get favorites
	var list = []
	$.each($('[name="optionsCheckboxes"]:checked'), function(index, value) {
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
			message: "Activities successfully updated!"
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
