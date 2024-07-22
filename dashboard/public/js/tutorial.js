// Tutorial handling

function sugarizerTour(currentView, role, mode) {
	var tutorial = {};
	var tour;
	var launched = false;

	var tutorialName = currentView;
	if (mode) {
		tutorialName = currentView + "_" + mode;
	}

	// Init tutorial
	tutorial.init = function () {
		var prevString = document.webL10n.get("TutoPrev");
		var nextString = document.webL10n.get("TutoNext");
		var endString = document.webL10n.get("TutoEnd");
		var steps=[]
		if (currentView == "home") {
			lockScroll();
			steps.push(getStep("home","", "bottom", 1, true));
			steps.push(getStep("home", "#dashboard-home-cards", "bottom", 2));
			steps.push(getStep("home", "#top-contributor-chart-parent", "right", 3));
			steps.push(getStep("home", "#top-activities-chart-parent", "left", 4));
			steps.push(getStep("home", "#recent-users-table-parent", "top", 5));
			steps.push(getStep("home", "#recent-activities-table-parent", "top", 6));
			steps.push(getStep("home", "#sugarizer-sidebar", "right", 7));
			steps.push(getStep("home", "#languageSelection", "bottom", 8));
			steps.push(getStep("home", "#navbar-xo-icon", "left", 9));
			steps.push(getStep("home", "#navbar-help", "left", 10));
		}else if (currentView == "users") {
			steps.push(getStep("users", "", "bottom", 1, true));
			steps.push(getStep("users", "#user-serach-row", "bottom", 2));
			steps.push(getStep("users", "#username", "bottom", 3));
			steps.push(getStep("users", "#select2-user-type-select2-container", "bottom", 4));
			steps.push(getStep("users", "#select2-classroom_select-container", "bottom", 5));
			steps.push(getStep("users", "#show-result", "bottom", 6));
			steps.push(getStep("users", "#users-adduser", "left", 7));
			steps.push(getStep("users", "#users-addfromcsv", "bottom", 8));
			steps.push(getStep("users", "#users-exportusers", "bottom", 9));
			steps.push(getStep("users", "#seeJournalEntries", "left", 10));
			steps.push(getStep("users", "#editUser", "left", 11));
			steps.push(getStep("users", "#deleteUser", "left", 12));
			steps.push(getStep("users", "#checkAll", "right", 13));
			steps.push(getStep("users", "#users-deleteMultiple", "left", 14));
		}else if (currentView == "activities") {
			steps.push(getStep("activities", "", "bottom", 1, true));
			steps.push(getStep("activities", "#activities-list-parent", "left", 2));
			steps.push(getStep("activities", "#activities-searchbox", "left", 3));
			steps.push(getStep("activities", "#activities-card", "bottom", 4));
			steps.push(getStep("activities", "#activities-draggable", "right", 5));
			steps.push(getStep("activities", "#activities-favoriteBox", "left", 6));
			steps.push(getStep("activities", "#activity-launch", "left", 7));
		}else if (currentView == "journal1") {
			steps.push(getStep("journal", "", "bottom", 1, true));
			steps.push(getStep("journal", "#journal-search-card", "bottom", 2));
		}else if (currentView == "journal2") {
			if (!(window.localStorage.journal1_end == "yes" || window.localStorage.journal1_current_step == "1")) {
				localStorage.setItem('journal1_end', 'yes');
				localStorage.setItem('journal1_current_step', 1);
				steps.push(getStep("journal", "", "bottom", 1, true));
				steps.push(getStep("journal", "#journal-search-card", "bottom", 2));
			}
			steps.push(getStep("journal", "#journal-cards-parent", "top", 3));
			steps.push(getStep("journal", "#journal-entry-card", "bottom", 4));
			steps.push(getStep("journal", "#journal-activity-launch", "left", 5));
			steps.push(getStep("journal", "#journal-activity-download", "left", 6));
			steps.push(getStep("journal", "#journal-activity-delete", "left", 7));
			steps.push(getStep("journal", "#journal-uploadJournal", "left", 8));
			steps.push(getStep("journal", "#checkAll", "right", 9));
			steps.push(getStep("journal", "#journal-downloadMultiple", "left", 10));
			steps.push(getStep("journal", "#journal-deleteMultiple", "left", 11));
		} else if (currentView == "classroom") {
			steps.push(getStep("classroom", "", "bottom", 1, true));
			steps.push(getStep("classroom", "#classroom-serach-row", "bottom", 2));
			steps.push(getStep("classroom", "#classroom-addclassroom", "left", 3));
			steps.push(getStep("classroom", "#classroom-cards-parent", "top", 4));
			steps.push(getStep("classroom", "#classroom-card", "bottom", 5));
			steps.push(getStep("classroom", "#classroom-view-students", "left", 6));
			steps.push(getStep("classroom", "#classroom-edit-class", "left", 7));
			steps.push(getStep("classroom", "#classroom-delete-class", "left", 8));
			steps.push(getStep("classroom", "#checkAll", "right", 9));
			steps.push(getStep("classroom", "#classroom-deleteMultiple", "left", 10));
		} else if (currentView == "assignment") {
			steps.push(getStep("assignment", "#assignment-serach-row", "bottom", 2));
			steps.push(getStep("assignment", "#assignment-deleteMultiple", "left", 10));
			steps.push(getStep("assignment", "#assignment-addassignment", "left", 3));
			steps.push(getStep("assignment", "#assignment-cards-parent", "top", 4));
			steps.push(getStep("assignment", "#checkAll", "right", 9));
			steps.push(getStep("assignment", "#assignment-card", "bottom", 5));
			steps.push(getStep("assignment", "#assignment-delete-class", "left", 8));
			steps.push(getStep("assignment", "#assignment-view-students", "left", 6));
			steps.push(getStep("assignment", "#assignment-launch", "left", 5));
		} else if (currentView == "deliveries") {
			steps.push(getStep("deliveries", "#deliveries-serach-row", "bottom", 2));
			steps.push(getStep("deliveries", "#deliveries-deleteMultiple", "left", 10));
			steps.push(getStep("deliveries", "#deliveries-cards-parent", "top", 4));
			steps.push(getStep("deliveries", "#checkAll", "right", 9));
			steps.push(getStep("deliveries", "#deliveries-card", "bottom", 5));
			steps.push(getStep("deliveries", "#deliveries-delete-delivery", "left", 8));
			steps.push(getStep("deliveries", "#deliveries-comment", "left", 11));
			steps.push(getStep("deliveries", "#deliveries-launch", "left", 7));
			steps.push(getStep("deliveries", "#deliveries-journal-activity-download", "right", 3));

		}
		else if (currentView == "stats") {
			tour.addStep(getStep("stats", "", "bottom", 1, true));
			tour.addStep(getStep("stats", "#stats-addChart", "left", 2));
			tour.addStep(getStep("stats", "#stats-listCharts", "left", 3));
		} else if (currentView == "listCharts") {
			tour.addStep(getStep("listCharts", "", "bottom", 1, true));
			tour.addStep(getStep("listCharts", "#listCharts-chartList", "left", 2));
			tour.addStep(getStep("listCharts", "#listCharts-viewCharts", "left", 3));
			tour.addStep(getStep("listCharts", "#listCharts-addChart", "left", 4));
			tour.addStep(getStep("listCharts", "#listCharts-searchbox", "bottom", 5));
			tour.addStep(getStep("listCharts", "#listCharts-card", "bottom", 6));
			tour.addStep(getStep("listCharts", "#listCharts-draggable", "right", 7));
			tour.addStep(getStep("listCharts", "#listCharts-toggleBox", "left", 8));
			tour.addStep(getStep("listCharts", "#listCharts-editChart", "left", 9));
			tour.addStep(getStep("listCharts", "#listCharts-deleteChart", "left", 10));
		} else if (currentView == "editUser") {
			tour.addStep(getStep("editUser", "", "bottom", 1, true));
			tour.addStep(getStep("editUser", "#editUser-name", "right", 2));
			tour.addStep(getStep("editUser", "#editUser-language", "right", 3));
			tour.addStep(getStep("editUser", "#editUser-role", "right", 4));
			tour.addStep(getStep("editUser", "#editUser-colors", "right", 5));
			tour.addStep(getStep("editUser", "#editUser-password", "right", 6));
			tour.addStep(getStep("editUser", "#searchable-select-classrooms-row", "right", 7));
			tour.addStep(getStep("editUser", "#editUser-twoFactor", "right", 8));
			tour.addStep(getStep("editUser", "#editUser-created", "right", 9));
			tour.addStep(getStep("editUser", "#editUser-lastseen", "right", 10));
		} else if (currentView == "editClassroom") {
			tour.addStep(getStep("editClassroom", "", "bottom", 1, true));
			tour.addStep(getStep("editClassroom", "#editClassroom-name", "right", 2));
			tour.addStep(getStep("editClassroom", "#editClassroom-students", "right", 3));
			tour.addStep(getStep("editClassroom", "#editClassroom-colors", "right", 4));
			tour.addStep(getStep("editClassroom", "#editClassroom-created", "right", 5));
			tour.addStep(getStep("editClassroom", "#editClassroom-lastupdated", "right", 6));
		} else if (currentView == "editAssignment") {
			tour.addStep(getStep("editAssignment", "", "bottom", 1, true));
			tour.addStep(getStep("editAssignment", "#editAssignment-name", "right", 2));
			tour.addStep(getStep("editAssignment", "#editAssignment-activity", "right", 3));
			tour.addStep(getStep("editAssignment", "#editAssignment-instructions", "right", 4));
			tour.addStep(getStep("editAssignment", "#editAssignment-duedate", "right", 5));
			tour.addStep(getStep("editAssignment", "#searchable-select-classrooms-row", "right", 6));
		} else if (currentView == "editChart") {
			tour.addStep(getStep("editChart", "", "bottom", 1, true));
			tour.addStep(getStep("editChart", "#editChart-title", "right", 2));
			tour.addStep(getStep("editChart", "#editChart-type", "right", 3));
			tour.addStep(getStep("editChart", "#editChart-selectchart", "right", 4));
			tour.addStep(getStep("editChart", "#editChart-display", "right", 5));
		}				
		

		steps = steps.filter(
			(step) =>
			  !("element" in step) ||
			  (step.element.length &&
				document.querySelector(step.element) &&
				document.querySelector(step.element).style.display != "none" &&
				document.querySelector(step.element).getBoundingClientRect().y != 0)
		  );

		  introJs()
		  .setOptions({
			tooltipClass: "customTooltip",
			steps: steps,
			prevLabel: document.webL10n.get("TutoPrev"),
			nextLabel: document.webL10n.get("TutoNext"),
			exitOnOverlayClick: false,
			nextToDone: false,
			showBullets: false,
		  })
		  .start();
	};

	// Start tutorial
	tutorial.start = function () {
		if ($(window).width() > 992) {
			document.webL10n.ready(function () {
				var refreshIntervalId = setInterval(function () {
					if (document.webL10n.getReadyState() == "complete") {
						clearInterval(refreshIntervalId);
						tutorial.init();
						// tour.start(true);
						launched = true;
					}
				}, 100);
			});
		}
	};

	// Check if already finished
	tutorial.isFinished = function () {
		if (window.localStorage[tutorialName + "_end"] == "yes") return true;
		return false;
	};

	tutorial.restart = function () {
		localStorage.setItem(tutorialName + "_current_step", 0);
		localStorage.removeItem(tutorialName + "_end");
		tutorial.start();
	};

	// Test if launched
	tutorial.isLaunched = function () {
		return launched;
	};

	function getStep(view, element, placement, step, orphan) {
		var step = {
			title: document.webL10n.get(view + "Title" + step),
			intro: document.webL10n.get(view + "Content" + step),
			placement: placement
		};
		if (orphan == true) {
			step['orphan'] = true;
		}
		if(element!="")
			step['element']=element
		return step;
	}

	function lockScroll() {
		var scrollPosition = [
			self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
			self.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
		];
		var html = jQuery('html'); // it would make more sense to apply this to body, but IE7 won't have that
		html.data('scroll-position', scrollPosition);
		html.data('previous-overflow', html.css('overflow'));
		html.css('overflow', 'hidden');
		window.scrollTo(scrollPosition[0], scrollPosition[1]);
	}

	function unlockScroll() {
		var html = jQuery('html');
		var scrollPosition = html.data('scroll-position');
		html.css('overflow', html.data('previous-overflow'));
		window.scrollTo(scrollPosition[0], scrollPosition[1]);
	}

	return tutorial;
}
