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

	createTabs: function(groupName, tabs) {
		var i = 0;
		for (tab in tabs) {			
			// Create buttons
			$("#main-sidebar").append('<div class="button" id="'+ groupName +'_tab' + i +'-btn">' + tab +'</div>');

			// Create pages
			$("#main-body").append('<div class="tab-body" id="'+ groupName +'_tab' + i +'-body"><p>This is '+ groupName + "_" + tab +'.</p></div>');

			// Create button handlers to tie buttons to pages
			this.createHandler(groupName + "_tab" + i);

			++i;
		}
	},

	generateLayout: function() {
		var i = 0;
		for (sheet in OPENSHEET.file.dataObjects) {
			if(!OPENSHEET.file.dataObjects[sheet].name) {
				this.createTabs("group"+i, OPENSHEET.file.dataObjects[sheet].groups[i].tabs)
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
}); 

