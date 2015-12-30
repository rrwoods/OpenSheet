/* Global */

var OPENSHEET = OPENSHEET || {};

/* Tab handling */

OPENSHEET.tab = {
	currentTab: "",
	lastTab: "",

	hideCurrentTab: function() {
		this.lastTab = this.currentTab;
		$("#" + this.currentTab + "-body").hide()
		$("#" + this.currentTab + "-btn").removeClass("active");
	},

	openTab: function(tabName) {
		this.hideCurrentTab();
		$("#" + tabName + "-body").show();
		$("#" + tabName + "-btn").addClass("active");
		this.currentTab = tabName;
	},

	createHandler: function(tabName) {
		$("#" + tabName + "-btn").click([this, tabName], function(event) {
			event.data[0].openTab(event.data[1]);
		});
	},

	createTabs: function(groups) {		
		for (group of groups) {
			for (tab of group.tabs) {
				// Create buttons
				$("#main-sidebar").append('<div class="button" id="'+ group.name +'_'+ tab.name +'-btn">'+ tab.displayName +'</div>');

				// Create pages
				$("#main-body").append('<div class="tab-body" id="'+ group.name +'_'+ tab.name +'-body"><p>This is '+ group.name + "_" + tab.displayName +'.</p></div>');

				// Create button handlers to tie buttons to pages
				this.createHandler(group.name + "_" + tab.name);
			}
		}
	},
}

/* Ready, set, go! */

$(document).ready(function() {
	var groups = [{name: "group1", tabs: [{name: "tab1", displayName: "Tab 1"}, {name: "tab2", displayName: "Tab 2"}, {name: "tab3", displayName: "Tab 3"}, {name: "tab4", displayName: "Tab 4"}, {name: "tab5", displayName: "Tab 5"}]}]; 	
	
	OPENSHEET.tab.createTabs(groups);

	// TODO: Draw the rest of the owl
}); 