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
			span(this.data.Gender,          qn+'_Gender') + ' ' +
			span(this.data.Race,            qn+'_Race') + ' ' +
			'('+span(this.data.Alignment,   qn+'_Alignment')+')',
		qn+'_Subtitle')
	);

	// Forms table
	var buildFormsTableRows = function(data) {
		toReturn = "";

		for (i=0; i<data.Forms.length; ++i) {
			console.log(i);
			form = data.Forms[i];
			toReturn +=
				tr(
					th(form.Name, 'wide-cell') +
					td(form.STR, 'thin-cell') +
					td(form.DEX, 'thin-cell') +
					td(form.CON, 'thin-cell') +
					td(form.INT, 'thin-cell') +
					td(form.WIS, 'thin-cell') +
					td(form.CHA, 'thin-cell') +
					td(form.Speed, 'medium-cell') +
					td(form.Size, 'medium-cell') +
					td(form.Weight, 'medium-cell') +
					td(form.NA, 'medium-cell') +
					td('', 'spacer-small no-border no-background') +
					(i==data.Forms.length-1 ? 
						td('+', 'no-border add-button') : 
						td('', 'no-border no-background' )
					)
				);
		}

		return toReturn;
	}

	$(bodyTab).append(
		div(
			table(
				thead(
					tr(
						th('', 'wide-cell') +
						th('STR', 'thin-cell') +
						th('DEX', 'thin-cell') +
						th('CON', 'thin-cell') +
						th('INT', 'thin-cell') +
						th('WIS', 'thin-cell') +
						th('CHA', 'thin-cell') +
						th('Speed', 'medium-cell') +
						th('Size', 'medium-cell') +
						th('Weight', 'medium-cell') +
						th('Nat. Armor', 'medium-cell') +
						th('', 'spacer-small no-border no-background') +
						th('', 'no-border no-background')
					)
				),
				tbody(
					buildFormsTableRows(this.data)
				),
				'',
			qn+'_Forms', 'standard'), // /table
		'', 'table-container') // /div
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

	// Levels table
	var buildSkillColumns = function(data) {
		toReturn = "";

		for (i=0; i<data.Forms.length; ++i) {
			console.log(i);
			form = data.Forms[i];
			toReturn +=
				tr(
					th(form.Name, 'wide-cell') +
					td(form.STR, 'thin-cell') +
					td(form.DEX, 'thin-cell') +
					td(form.CON, 'thin-cell') +
					td(form.INT, 'thin-cell') +
					td(form.WIS, 'thin-cell') +
					td(form.CHA, 'thin-cell') +
					td(form.Speed, 'medium-cell') +
					td(form.Size, 'medium-cell') +
					td(form.Weight, 'medium-cell') +
					td(form.NA, 'medium-cell') +
					td('', 'spacer-small no-border no-background') +
					(i==data.Forms.length-1 ? 
						td('+', 'no-border add-button') : 
						td('', 'no-border no-background' )
					)
				);
		}

		return toReturn;
	}

	var buildLevelTableRows = function(data) {
		toReturn = "";

		for (i=0; i<data.Forms.length; ++i) {
			console.log(i);
			form = data.Forms[i];
			toReturn +=
				tr(
					th(form.Name, 'wide-cell') +
					td(form.STR, 'thin-cell') +
					td(form.DEX, 'thin-cell') +
					td(form.CON, 'thin-cell') +
					td(form.INT, 'thin-cell') +
					td(form.WIS, 'thin-cell') +
					td(form.CHA, 'thin-cell') +
					td(form.Speed, 'medium-cell') +
					td(form.Size, 'medium-cell') +
					td(form.Weight, 'medium-cell') +
					td(form.NA, 'medium-cell') +
					td('', 'spacer-small no-border no-background') +
					(i==data.Forms.length-1 ? 
						td('+', 'no-border add-button') : 
						td('', 'no-border no-background' )
					)
				);
		}

		return toReturn;
	}

	$(bodyTab).append(
		div(
			table(
				thead(
					tr(
						td('', 'no-border', 'colspan="4"')
						td('Skill Points (n Spent)', 'black-border', 'colspan="8"')
					) +
					tr(
						th('Classes', 'wide-cell') +
						th('Lvl', 'thin-cell') +
						th('HP Rolls', 'medium-cell') +
						th('+Abl', 'thin-cell') +
						buildSkillCols(this.data) +
						th('', 'spacer-small no-border no-background') +
						th('+', 'add-button no-border')
					)
				),
				tbody(
					buildFormsTableRows(this.data)
				),
				'',
			qn+'_Levels', 'standard'), // /table
		'', 'table-container') // /div
	);	
}
