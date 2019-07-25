// Tutorial handling

function sugarizerTour(currentView, role) {
	console.log("sugarizerTour", currentView, role);
	var tutorial = {};
	var tour;
	var launched = false;
    
	tutorial.elements = [];

	// Init tutorial
	tutorial.init = function() {
		var prevString = "Prev";
		var nextString = "Next";
		var endString = "End";
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
					title: "Welcome to Sugarizer Server",
					content: "Sugarizer Server allow deployment of Sugarizer on a local server, for example on a school server, so expose locally Sugarizer as a Web Application."
				},
				{
					element: "#dashboard-home-cards",
					placement: "bottom",
					title: "Sugarizer Summary Cards",
					content: "These cards contains realtime user summary of the deployed server like total number of students, total classrooms, available activities and total journal entry count."
				},
				{
					element: "#top-contributor-chart-parent",
					placement: "right",
					title: "Top Contributor Chart",
					content: "This chart shows top 5 contributing students of all time."
				},
				{
					element: "#top-activities-chart-parent",
					placement: "left",
					title: "Top Activities Chart",
					content: "This chart shows most frequently used Sugarizer Activities."
				},
				{
					element: "#recent-users-table-parent",
					placement: "top",
					title:  "Recent Students Table",
					content: "This table shows the list of most recently active users."
				},
				{
					element: "#recent-activities-table-parent",
					placement: "top",
					title: "Recent Entries Table",
					content: "This table shows the most recenly added journal entries by the students."
				},
				{
					element: "#sugarizer-sidebar",
					placement: "right",
					title: "Sugarizer Server Sidebar",
					content: "This is the Sugarizer Server Sidebar, use this to navigate through the application."
				},
				{
					element: "#languageSelection",
					placement: "bottom",
					title: "Language Selection",
					content: "This is the Language Selection dropdown. Use this to switch Sugarizer-Server language."
				},
				{
					element: "#navbar-xo-icon",
					placement: "left",
					title: "Navbar XO",
					content: "This is the XO icon. Use this to access your Profile or Logout from Sugarizer Server."
				}
			]);
		} else if (currentView == "users") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: "Welcome to the Users View",
					content: "This is the users view. You can create, view, edit and delete users from this view."
				},
				{
					element: "#user-serach-row",
					placement: "bottom",
					title: "User Search",
					content: "You can search for the users from here by entering the name and clicking on Show Results button."
				},
				{
					element: "#users-adduser",
					placement: "left",
					title: "Add User",
					content: "This button will take you to the Add User view where you can create a new user."
				},
				{
					element: "#users-addfromcsv",
					placement: "bottom",
					title:  "Add From CSV",
					content: "This button will let you upload multiple users at one by using a CSV file as input."
				},
				{
					element: "#users-exportusers",
					placement: "bottom",
					title: "Export Users",
					content: "This button will export all the existing users as a CSV file."
				},
				{
					element: "#seeJournalEntries",
					placement: "left",
					title: "See Journal Entries",
					content: "This button opens all the journal entries for a user."
				},
				{
					element: "#editUser",
					placement: "left",
					title: "Edit User",
					content: "This button opens the edit user view."
				},
				{
					element: "#deleteUser",
					placement: "left",
					title: "Delete User",
					content: "This button removes the user from the Sugarizer-Server."
				}
			]);
		} else if (currentView == "activities") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: "Welcome to the Activities View",
					content: "In this view, you can view and launch the Sugarizer activities. You can also reorder them and add/remove them from the favourites."
				},
				{
					element: "#activities-list-parent",
					placement: "left",
					title: "Activities List",
					content: "This is the list of all the Sugarizer Activities."
				},
				{
					element: "#activities-searchbox",
					placement: "left",
					title: "Activity Search",
					content: "You can search for an activity using this search box."
				},
				{
					element: "#activities-card",
					placement: "bottom",
					title:  "Activity Card",
					content: "Each activity card contains the icon, name and version of the activity."
				},
				{
					element: "#activities-draggable",
					placement: "right",
					title: "Reorder Activity",
					content: "You can drag and drop an activity by this handle to reorder."
				},
				{
					element: "#activities-favoriteBox",
					placement: "left",
					title: "Toggle Favourite",
					content: "This button will toggle the activity from the favourites list."
				},
				{
					element: "#activity-launch",
					placement: "left",
					title: "Launch Activity",
					content: "This button will launch the activity in another tab."
				}
			]);
		} else if (currentView == "journal1") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: "Welcome to the Journal View",
					content: "In this view, you can view the journal entries of the students and launch them exactly as they appear in the student's device."
				},
				{
					element: "#journal-search-card",
					placement: "bottom",
					title: "Find Journal",
					content: "Select the student and journal type and click on Show Results to list the journal entries."
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
						title: "Welcome to the Journal View",
						content: "In this view, you can view the journal entries of the students and launch them exactly as they appear in the student's device."
					},
					{
						element: "#journal-search-card",
						placement: "bottom",
						title: "Find Journal",
						content: "Select the student and journal type and click on Show Results to list the journal entries."
					}
				]);
			}
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: "Welcome to the Journal View",
					content: "In this view, you can view the journal entries of the students and launch them exactly as they appear in the student's device."
				},
				{
					element: "#journal-search-card",
					placement: "bottom",
					title: "Find Journal",
					content: "Select the student and journal type and click on Show Results to list the journal entries."
				},
				{
					element: "#journal-cards-parent",
					placement: "top",
					title: "Entrites",
					content: "This is the list of all the Journal Entries by the user."
				},
				{
					element: "#journal-entry-card",
					placement: "bottom",
					title: "Journal Entry",
					content: "Each journal entry card contains icon, title, timestamp and size of the entry."
				},
				{
					element: "#journal-activity-launch",
					placement: "left",
					title: "Launch Activity",
					content: "This button will launch the activity in another tab exactly as they appear in the student's device."
				},
				{
					element: "#journal-activity-delete",
					placement: "left",
					title: "Delete User",
					content: "This button removes the entry from the student's journal."
				}
			]);
		} else if (currentView == "classroom") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: "Welcome to the Classroom View",
					content: "In this view, you can add, list, edit and delete the classrooms."
				},
				{
					element: "#classroom-serach-row",
					placement: "bottom",
					title: "Classroom Search",
					content: "You can search for the classrooms from here by entering the name and clicking on Show Results button."
				},
				{
					element: "#classroom-addclassroom",
					placement: "left",
					title: "Add Classroom",
					content: "This button will take you to the Add Classroom view where you can create a new classroom."
				},
				{
					element: "#classroom-cards-parent",
					placement: "top",
					title: "Classrooms",
					content: "This is the list of all the classrooms."
				},
				{
					element: "#classroom-card",
					placement: "bottom",
					title: "Classroom",
					content: "Each classroom row contains icon, name, student count and timestamp of the last update."
				},
				{
					element: "#classroom-view-students",
					placement: "left",
					title: "View Students",
					content: "This will open the list of students present in this classroom."
				},
				{
					element: "#classroom-edit-class",
					placement: "left",
					title: "Edit Classroom",
					content: "This button opens the edit classroom view."
				},
				{
					element: "#classroom-delete-class",
					placement: "left",
					title: "Delete Classroom",
					content: "This button removes the classroom from the Sugarizer-Server."
				}
			]);
		} else if (currentView == "stats") {
			tour.addSteps([
				{
					element: "",
					orphan: true,
					placement: "bottom",
					title: "Welcome to the Statistics View",
					content: "In this view, you can view the statistics of the deployed Sugarizer Server."
				}
			]);
		}
		tour.init();
	};

	// Start tutorial
	tutorial.start = function() {
		tutorial.init();
		tour.start(true);
		launched = true;
	};

	// Test if launched
	tutorial.isLaunched = function() {
		return launched;
	};

	return tutorial;
}
