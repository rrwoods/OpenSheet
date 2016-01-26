/* Tab parents */

function Tab(args) {
	if(args) {
		this.initialize(args);
	}
}

Tab.prototype = {
    constructor: Tab,

    initialize: function(args) {
    	this.owner = args[0];
		this.displayName = args[1];
		this.name = this.displayName.replace(/\s/g, "-");
		this.visible = true;
		this.data = args[2];
    },

    clickTab: function() {
		OPENSHEET.layout.hideCurrentTab();
		var qualifiedName = this.getQualifiedName();

		$("#" + qualifiedName + "-btn").addClass("active");
		OPENSHEET.layout.currentTab = qualifiedName;

		var onLoadCallback = function(thisObj) {
			return function(data) {
				// load the tab's JS, which populates data and creates interactivity
				thisObj.populateTab(data);
				// Show the page now, even if it isn't fully loaded
				$("#" + qualifiedName + "-body").show();
			};
		};

		// load the HTML
		$("#" + qualifiedName + "-body").load("src/"+ qualifiedName.split("_").pop() +".html", onLoadCallback(this));
	},
	
	getQualifiedName: function() {
		return this.owner.name + "_" + this.name;
	},

	populateTab: function() {
		$("#" + this.getQualifiedName() + "-body").append("<br>" + this.name + " populated!");
	},

	layoutSelf: function(sidebarContainer, bodyContainer) {
		var qn = this.getQualifiedName();
		var indent = this.owner.collapsible && this.owner.collapseHandle !== this;

		// Create buttons
		$(sidebarContainer).append(
			div(this.displayName, qn+'-btn', 'button' + (indent ? ' indent' : ''))
		);

		// Create pages
		$(bodyContainer).append(
			div(p('This is '+qn), qn+'-body', 'tab-body')
		);

		// Create button handlers to tie buttons to pages
		this.createHandler(qn);
	},

	createHandler: function() {
		$("#" + this.getQualifiedName() + "-btn").click(this, function(event) {
			event.data.clickTab(event.data.name);
		});
	},
};

CollapseTab.prototype = new Tab(); 
CollapseTab.prototype.constructor = CollapseTab; 

function CollapseTab(args) {
	this.initialize(args);
}

CollapseTab.prototype.clickTab = function() {
	$("#"+this.name+'_collapse-contents').toggle("blind");
};

CollapseTab.prototype.initialize = function(args) {
	this.owner = args[0];
	this.displayName = args[1];
	this.name = this.owner.name;
	this.visible = true;
	this.data = args[2];
};

function Group(name, displayName, fromFile) {
	this.name = name;
	this.displayName = displayName;
	this.fromFile = fromFile;
	this.tabs = {};
	this.collapsible = false;
	this.collapsed = false;
	this.collapseHandle = {};
}

Group.prototype = {
	constructor: Group,

	addTabs: function(tabData) {
		var tabName, prefix;

		if(this.collapsible) {
			tabName = this.displayName;
			prefix = this.name + "_Handle";
			this.collapseHandle = MakeTab("Collapse", [this, tabName, {}]);
		}

		for (tabName in tabData) {		
			var newTab = MakeTab(tabName, [this, tabName, tabData[tabName]]);
			this.tabs[newTab.name] = newTab;
		}
	},

	layoutSelf: function() {
		var sidebarContainer = "#main-sidebar";
		var bodyContainer = "#main-body";

		if(this.collapsible) {
			this.collapseHandle.layoutSelf(sidebarContainer, bodyContainer);

			$("#main-sidebar").append(
				div('', this.name+'_collapse-contents', 'display-none collapsible')
			);
			sidebarContainer = '#'+this.name+'_collapse-contents';
		}

		for (var tab in this.tabs) {	
			this.tabs[tab].layoutSelf(sidebarContainer, bodyContainer);
		}
	},
};

/* Tab subclasses */
// Arguments for tab subclasses are: Arguments for Tab, then arguments for subclass

function MakeTab(type, args) {
	switch(type)
	{
		case "Basics":
			return new BasicsTab(args);
		case "Collapse":
			return new CollapseTab(args);
		default:
			return new Tab(args);
	}
}
