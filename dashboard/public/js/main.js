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

	//call ajax to update list @TODO
	$.ajax({
		url: (url + 'api/v1/activities'),
		type: "PUT",
		headers: headers,
		contentType: "application/json",
		processData: false,
		data: {
			favorites: JSON.stringify(list)
		},
		success: function(response) {
			console.log(response);
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
		}
	});
}
