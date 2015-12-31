/* Global */

var OPENSHEET = OPENSHEET || {};

/* File Handling */
OPENSHEET.file = {
	dataObjects: {},

	loadFile: function(path) {
		$.getJSON(path, 'json', function(data) {
				OPENSHEET.file.dataObjects[path] = data;
				OPENSHEET.layout.generateLayout();
		}).fail(function(jqXHR) {
			alert("File load failed! Error " + jqXHR.status);
		});
	}
}

/* General Layout */

OPENSHEET.layout = {
	currentTab: "",
	lastTab: "",

	hideCurrentTab: function() {
		this.lastTab = this.currentTab;
		$("#" + this.currentTab + "-body").hide()
		$("#" + this.currentTab + "-btn").removeClass("active");
	},

	loadTabHTML: function(path) {

	},

	openTab: function(tabName) {
		this.hideCurrentTab();
		$("#" + tabName + "-btn").addClass("active");
		this.currentTab = tabName;

		$("#" + tabName + "-body").load("src/"+ tabName.split("_").pop() +".html", function(data) {
			$("#" + tabName + "-body").show();
		});
	},

	createHandler: function(tabName) {
		$("#" + tabName + "-btn").click([this, tabName], function(event) {
			event.data[0].openTab(event.data[1]);
		});
	},

	createTabs: function(groupName, tabs, shouldCreateSummary) {
		var prefix = groupName + "_Summary";

		if(shouldCreateSummary) {
			$("#main-sidebar").append('<div class="button" id="'+ prefix +'-btn">Summary</div>');
			$("#main-body").append('<div class="tab-body" id="'+ prefix +'-body"><p>This is '+ groupName + '_Summary.</p></div>');
			this.createHandler(prefix);
		}

		for (tab in tabs) {			
			prefix = groupName + "_" + tab.replace(/\s/g, "-");

			// Create buttons
			$("#main-sidebar").append('<div class="button" id="'+ prefix +'-btn">' + tab +'</div>');

			// Create pages
			$("#main-body").append('<div class="tab-body" id="'+ prefix +'-body"><p>This is '+ groupName + "_" + tab +'.</p></div>');

			// Create button handlers to tie buttons to pages
			this.createHandler(prefix);
		}
	},

	generateLayout: function() {
		var i = 0;
		for (sheet in OPENSHEET.file.dataObjects) {
			if(!OPENSHEET.file.dataObjects[sheet].name) {

				this.createTabs("group"+i, OPENSHEET.file.dataObjects[sheet].groups[i].tabs, true)
			} else {
				// Todo: collapsible group labels
			}

			++i;
		}
	}
}

/* Ready, set, go! */

$(document).ready(function() {
	$.ajaxSetup({
		beforeSend: function(xhr) {
			if (xhr.overrideMimeType) {
		 		xhr.overrideMimeType("application/json");
			}
		},

		cache: false
	});

	var fileToLoad = "User Data/Saved Sheets/Alth_Shrenan.json";
	OPENSHEET.file.loadFile(fileToLoad);

	$("#main-sidebar").effect("shake");

	OPENSHEET.layout.openTab("group0_Basics");
}); 

