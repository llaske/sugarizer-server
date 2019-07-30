// Tutorial handling

function sugarizerTour(currentView, role) {
	var tutorial = {};
	var tour;
	var launched = false;
    
	tutorial.elements = [];

	// Init tutorial
	tutorial.init = function() {
		var prevString = document.webL10n.get("TutoPrev");
		var nextString = document.webL10n.get("TutoNext");
		var endString = document.webL10n.get("TutoEnd");
		tour = new window.Tour({
			name: currentView,
			template: "\
			<div class='popover tour'>\
				<div class='arrow'></div>\
				<h3 class='popover-title tutorial-title'></h3>\
				<table><tr><td style='vertical-align:top;'><div id='icon-tutorial' style='visibility:hidden;display:inline-block;'></div>\
				</td><td><div class='popover-content'></div></td></tr></table>\
				<div class='popover-navigation' style='display: flex; flex-wrap:wrap; justify-content: center; align-items: center'>\
					<div class='tutorial-prev-icon icon-button' data-role='prev'>\
						<div class='tutorial-prev-icon1 web-activity'>\
							<div class='tutorial-prev-icon2 web-activity-icon'></div>\
							<div class='tutorial-prev-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+prevString+"</div>\
					</div>\
					<span data-role='separator' style='margin: 4px'>|</span>\
					<div class='tutorial-next-icon icon-button' data-role='next'>\
						<div class='tutorial-next-icon1 web-activity'>\
							<div class='tutorial-next-icon2 web-activity-icon'></div>\
							<div class='tutorial-next-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+nextString+"</div>\
					</div>\
					<div class='tutorial-end-icon icon-button' data-role='end'>\
						<div class='tutorial-end-icon1 web-activity'>\
							<div class='tutorial-end-icon2 web-activity-icon'></div>\
							<div class='tutorial-end-icon3 web-activity-disable'></div>\
						</div>\
						<div class='icon-tutorial-text'>"+endString+"</div>\
					</div>\
				</div>\
			</div>",
			storage: window.localStorage,
			backdrop: true,
			autoscroll: true,
			steps: [],
			keyboard: true,
			onEnd: function() {
				tutorial.elements = [];
			}
		});
		if (currentView == "home") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: document.webL10n.get("homeTitle1"),
					content: document.webL10n.get("homeContent1")
				},
				{
					element: "#dashboard-home-cards",
					placement: "bottom",
					title: document.webL10n.get("homeTitle2"),
					content: document.webL10n.get("homeContent2")
				},
				{
					element: "#top-contributor-chart-parent",
					placement: "right",
					title: document.webL10n.get("homeTitle3"),
					content: document.webL10n.get("homeContent3")
				},
				{
					element: "#top-activities-chart-parent",
					placement: "left",
					title: document.webL10n.get("homeTitle4"),
					content: document.webL10n.get("homeContent4")
				},
				{
					element: "#recent-users-table-parent",
					placement: "top",
					title:  document.webL10n.get("homeTitle5"),
					content: document.webL10n.get("homeContent5")
				},
				{
					element: "#recent-activities-table-parent",
					placement: "top",
					title: document.webL10n.get("homeTitle6"),
					content: document.webL10n.get("homeContent6")
				},
				{
					element: "#sugarizer-sidebar",
					placement: "right",
					title: document.webL10n.get("homeTitle7"),
					content: document.webL10n.get("homeContent7")
				},
				{
					element: "#languageSelection",
					placement: "bottom",
					title: document.webL10n.get("homeTitle8"),
					content: document.webL10n.get("homeContent8")
				},
				{
					element: "#navbar-xo-icon",
					placement: "left",
					title: document.webL10n.get("homeTitle9"),
					content: document.webL10n.get("homeContent9")
				}
			]);
		} else if (currentView == "users") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: document.webL10n.get("usersTitle1"),
					content: document.webL10n.get("usersContent1")
				},
				{
					element: "#user-serach-row",
					placement: "bottom",
					title: document.webL10n.get("usersTitle2"),
					content: document.webL10n.get("usersContent2")
				},
				{
					element: "#users-adduser",
					placement: "left",
					title: document.webL10n.get("usersTitle3"),
					content: document.webL10n.get("usersContent3")
				},
				{
					element: "#users-addfromcsv",
					placement: "bottom",
					title:  document.webL10n.get("usersTitle4"),
					content: document.webL10n.get("usersContent4")
				},
				{
					element: "#users-exportusers",
					placement: "bottom",
					title: document.webL10n.get("usersTitle5"),
					content: document.webL10n.get("usersContent5")
				},
				{
					element: "#seeJournalEntries",
					placement: "left",
					title: document.webL10n.get("usersTitle6"),
					content: document.webL10n.get("usersContent6")
				},
				{
					element: "#editUser",
					placement: "left",
					title: document.webL10n.get("usersTitle7"),
					content: document.webL10n.get("usersContent7")
				},
				{
					element: "#deleteUser",
					placement: "left",
					title: document.webL10n.get("usersTitle8"),
					content: document.webL10n.get("usersContent8")
				}
			]);
		} else if (currentView == "activities") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: document.webL10n.get("activitiesTitle1"),
					content: document.webL10n.get("activitiesContent1")
				},
				{
					element: "#activities-list-parent",
					placement: "left",
					title: document.webL10n.get("activitiesTitle2"),
					content: document.webL10n.get("activitiesContent2")
				},
				{
					element: "#activities-searchbox",
					placement: "left",
					title: document.webL10n.get("activitiesTitle3"),
					content: document.webL10n.get("activitiesContent3")
				},
				{
					element: "#activities-card",
					placement: "bottom",
					title: document.webL10n.get("activitiesTitle4"),
					content: document.webL10n.get("activitiesContent4")
				},
				{
					element: "#activities-draggable",
					placement: "right",
					title: document.webL10n.get("activitiesTitle5"),
					content: document.webL10n.get("activitiesContent5")
				},
				{
					element: "#activities-favoriteBox",
					placement: "left",
					title: document.webL10n.get("activitiesTitle6"),
					content: document.webL10n.get("activitiesContent6")
				},
				{
					element: "#activity-launch",
					placement: "left",
					title: document.webL10n.get("activitiesTitle7"),
					content: document.webL10n.get("activitiesContent7")
				}
			]);
		} else if (currentView == "journal1") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: document.webL10n.get("journalTitle1"),
					content: document.webL10n.get("journalContent1")
				},
				{
					element: "#journal-search-card",
					placement: "bottom",
					title: document.webL10n.get("journalTitle2"),
					content: document.webL10n.get("journalContent2")
				}
			]);
		} else if (currentView == "journal2") {
			if (window.localStorage.journal1_end != "yes") {
				localStorage.setItem('journal1_end', 'yes');
				localStorage.setItem('journal1_current_step', 1);
				tour.addSteps([
					{
						element: "",
						orphan: true,
						placement: "bottom",
						title: document.webL10n.get("journalTitle1"),
						content: document.webL10n.get("journalContent1")
					},
					{
						element: "#journal-search-card",
						placement: "bottom",
						title: document.webL10n.get("journalTitle2"),
						content: document.webL10n.get("journalContent2")
					}
				]);
			}
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: document.webL10n.get("journalTitle1"),
					content: document.webL10n.get("journalContent1")
				},
				{
					element: "#journal-search-card",
					placement: "bottom",
					title: document.webL10n.get("journalTitle2"),
					content: document.webL10n.get("journalContent2")
				},
				{
					element: "#journal-cards-parent",
					placement: "top",
					title: document.webL10n.get("journalTitle3"),
					content: document.webL10n.get("journalContent3")
				},
				{
					element: "#journal-entry-card",
					placement: "bottom",
					title: document.webL10n.get("journalTitle4"),
					content: document.webL10n.get("journalContent4")
				},
				{
					element: "#journal-activity-launch",
					placement: "left",
					title: document.webL10n.get("journalTitle5"),
					content: document.webL10n.get("journalContent5")
				},
				{
					element: "#journal-activity-delete",
					placement: "left",
					title: document.webL10n.get("journalTitle6"),
					content: document.webL10n.get("journalContent6")
				}
			]);
		} else if (currentView == "classroom") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: document.webL10n.get("classroomTitle1"),
					content: document.webL10n.get("classroomContent1")
				},
				{
					element: "#classroom-serach-row",
					placement: "bottom",
					title: document.webL10n.get("classroomTitle2"),
					content: document.webL10n.get("classroomContent2")
				},
				{
					element: "#classroom-addclassroom",
					placement: "left",
					title: document.webL10n.get("classroomTitle3"),
					content: document.webL10n.get("classroomContent3")
				},
				{
					element: "#classroom-cards-parent",
					placement: "top",
					title: document.webL10n.get("classroomTitle4"),
					content: document.webL10n.get("classroomContent4")
				},
				{
					element: "#classroom-card",
					placement: "bottom",
					title: document.webL10n.get("classroomTitle5"),
					content: document.webL10n.get("classroomContent5")
				},
				{
					element: "#classroom-view-students",
					placement: "left",
					title: document.webL10n.get("classroomTitle6"),
					content: document.webL10n.get("classroomContent6")
				},
				{
					element: "#classroom-edit-class",
					placement: "left",
					title: document.webL10n.get("classroomTitle7"),
					content: document.webL10n.get("classroomContent7")
				},
				{
					element: "#classroom-delete-class",
					placement: "left",
					title: document.webL10n.get("classroomTitle8"),
					content: document.webL10n.get("classroomContent8")
				}
			]);
		} else if (currentView == "stats") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: document.webL10n.get("statsTitle1"),
					content: document.webL10n.get("statsContent1")
				}
			]);
		}
		tour.init();
	};

	// Start tutorial
	tutorial.start = function() {
		document.webL10n.ready(function() {
			var refreshIntervalId = setInterval(function() {
				if (document.webL10n.getReadyState() == "complete") {
					clearInterval(refreshIntervalId);
					tutorial.init();
					tour.start(true);
					launched = true;
				}
			}, 100);
		});
	};

	// Test if launched
	tutorial.isLaunched = function() {
		return launched;
	};

	return tutorial;
}
