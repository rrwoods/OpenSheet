/* Tab parents */

var TAB_ARGS = 3;

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

    openTab: function() {
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
			}
		}

		// load the HTML
		$("#" + qualifiedName + "-body").load("src/"+ qualifiedName.split("_").pop() +".html", onLoadCallback(this));
	},
	
	getQualifiedName: function() {
		return this.owner.name + "_" + this.name;
	},

	populateTab: function() {
		$("#" + this.getQualifiedName() + "-body").append("<br>" + this.name + " populated!");
	},

	layoutSelf: function() {
		var qualifiedName = this.getQualifiedName();

		// Create buttons
		$("#main-sidebar").append('<div class="button" id="'+ qualifiedName +'-btn">' + this.displayName +'</div>');

		// Create pages
		$("#main-body").append('<div class="tab-body" id="'+ qualifiedName +'-body"><p>This is '+ qualifiedName +'.</p></div>');

		// Create button handlers to tie buttons to pages
		this.createHandler(qualifiedName);
	},

	createHandler: function() {
		$("#" + this.getQualifiedName() + "-btn").click(this, function(event) {
			event.data.openTab(event.data.name);
		});
	},
}

function Group(name, fromFile) {
	this.name = name;
	this.fromFile = fromFile;
	this.tabs = {};
	this.collapsible = false;
	this.collapsed = false;
}

Group.prototype = {
	constructor: Group,

	addTabs: function(tabData) {
		var tabName, prefix;

		if(!this.collapsible) {
			tabName = "Summary";
			prefix = this.name + "_" + tabName;
			this.tabs[prefix] = MakeTab("Summary", [this, tabName, {}]);
		}

		for (tabName in tabData) {		
			var newTab = MakeTab(tabName, [this, tabName, tabData[tabName]]);
			this.tabs[newTab.name] = newTab;
		}
	},

	layoutSelf: function() {
		for (tab in this.tabs) {	
			this.tabs[tab].layoutSelf();
		}
	},
}

/* Tab subclasses */
// Arguments for tab subclasses are: Arguments for Tab, then arguments for subclass

function MakeTab(type, args) {
	switch(type)
	{
		case "Basics":
			return new BasicsTab(args);
		default:
			return new Tab(args);
	}
}

BasicsTab.prototype = new Tab(); 
BasicsTab.prototype.constructor = BasicsTab; 

function BasicsTab(args) {
	this.initialize(args);
}

BasicsTab.prototype.populateTab = function() {
	var qn = this.getQualifiedName();
	var bodyTab = "#" + qn + "-body";
	
	// Name
	$(bodyTab).append(h1(this.data.Name, qn+'_Name'));
	// Gender Race (Alignment)
	$(bodyTab).append(
		h3(
			span(this.data.Alignment, qn+'_Alignment') + ' ' +
			span(this.data.Gender,    qn+'_Gender') + ' ' +
			span(this.data.Race,      qn+'_Race'),
		qn+'_Subtitle')
	);

	$(bodyTab).append(
		div(p("forms table here"))
	);	

	// Languages
	$(bodyTab).append(
		table('',
			tr(
				td("Automatic Languages: ") +
				td(this.data.Auto_Lang.join(", ")) 
			) +
			tr(
				td("Bonus Languages: ") +
				td(this.data.Bonus_Lang.join(", "))
			),
		'', '', 'invisible')
	);

	$(bodyTab).append(
		div(p("class levels table here"))
	);	
}
