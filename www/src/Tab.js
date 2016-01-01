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

	var formsTable = new Table(qn+"_Forms", "standard");
	var formsTableHeader = [
		th('', 'wide-cell'),
		th('STR', 'thin-cell'),
		th('DEX', 'thin-cell'),
		th('CON', 'thin-cell'),
		th('INT', 'thin-cell'),
		th('WIS', 'thin-cell'),
		th('CHA', 'thin-cell'),
		th('Speed', 'medium-cell'),
		th('Size', 'medium-cell'),
		th('Weight', 'medium-cell'),
		th('Nat. Armor', 'medium-cell'),
		th('', 'spacer-small no-border no-background'),
		th('', 'no-border no-background'), // +button
	];
	formsTable.addSection("thead", [formsTableHeader]);

	formsTable.addSection("tbody");
	$.each(this.data.Forms, function(index, theForm) {
		formsTable.addRow("tbody", index, [
			th(theForm.Name, 'wide-cell'),
			td(theForm.STR, 'thin-cell'),
			td(theForm.DEX, 'thin-cell'),
			td(theForm.CON, 'thin-cell'),
			td(theForm.INT, 'thin-cell'),
			td(theForm.WIS, 'thin-cell'),
			td(theForm.CHA, 'thin-cell'),
			td(theForm.Speed, 'medium-cell'),
			td(theForm.Size, 'medium-cell'),
			td(theForm.Weight, 'medium-cell'),
			td(theForm.NA, 'medium-cell'),
			td('', 'spacer-small no-border'),
			td('', 'no-border'),
		])
	})
	formsTable.changeCell("tbody", -1, -1, td('+', 'add-button no-border'));

	$(bodyTab).append(
		div(formsTable.getHTML(), '', 'table-container')
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

	// build the class levels table -- but first, we need to see
	// what skill headers are needed, so go over all the class levels
	// and figure that out.
	var skillNames = [];
	for(level of this.data.Class_Levels)
		for(skillName in level.Skills)
			if($.inArray(skillName, skillNames) == -1)
				skillNames.push(skillName);
	var skillHeaders = $.map(skillNames, function(skillName, i) {
		return th(skillName, 'thin-cell');
	})

	var classLevelsTable = new Table(qn+"_Levels", "standard");
	var classLevelsTableHeader = [
		th('Classes', 'wide-cell'),
		th('Lvl', 'thin-cell'),
		th('HP rolls', 'medium-cell'),
		th('+Abl', 'thin-cell'),
	];
	$.merge(classLevelsTableHeader, skillHeaders);
	classLevelsTableHeader.push(th('', 'spacer-small no-border no-background'));
	classLevelsTableHeader.push(th('+', 'add-button no-border'));
	classLevelsTable.addSection("thead", [classLevelsTableHeader]);

	classLevelsTracker = {}
	classLevelsTable.addSection("tbody");
	$.each(this.data.Class_Levels, function(index, theLevel) {
		var lvl = 1;
		if(theLevel.Class in classLevelsTracker) {
			classLevelsTracker[theLevel.Class]++;
			lvl = classLevelsTracker[theLevel.Class];
		} else {
			classLevelsTracker[theLevel.Class] = 1;
		}
		var newRow = [
			td(theLevel.Class),
			td(lvl),
			td(theLevel.HP),
			td("Ability_Increment" in theLevel ? theLevel.Ability_Increment : ""),
		]
		$.merge(newRow, $.map(skillNames, function(skillName, i) {
			return td(skillName in theLevel.Skills ? theLevel.Skills[skillName] : "");
		}));
		newRow.push(td('', 'spacer-small no-border'));
		newRow.push(td('', 'no-border'));
		classLevelsTable.addRow("tbody", index, newRow)
	})
	classLevelsTable.changeCell("tbody", -1, -1, td('+', 'add-button no-border'));

	$(bodyTab).append(
		div(classLevelsTable.getHTML(), '', 'table-container')
	);	
}
