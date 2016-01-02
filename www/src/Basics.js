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
			span(this.data.Gender,    qn+'_Gender') + ' ' +
			span(this.data.Race,      qn+'_Race') + ' ' +
			span('(' + this.data.Alignment + ')', qn+'_Alignment'),
		qn+'_Subtitle')
	);

	var formsTable = new Table(qn+"_Forms", "standard");
	var formsTableHeader = [
		new TableCell('').setClasses('wide-cell no-border no-background').setTh(),
		new TableCell('STR').setClasses('thin-cell').setTh(),
		new TableCell('DEX').setClasses('thin-cell').setTh(),
		new TableCell('CON').setClasses('thin-cell').setTh(),
		new TableCell('INT').setClasses('thin-cell').setTh(),
		new TableCell('WIS').setClasses('thin-cell').setTh(),
		new TableCell('CHA').setClasses('thin-cell').setTh(),
		new TableCell('Speed').setClasses('medium-cell').setTh(),
		new TableCell('Size').setClasses('medium-cell').setTh(),
		new TableCell('Weight').setClasses('medium-cell').setTh(),
		new TableCell('Nat. Armor').setClasses('medium-cell').setTh(),
	];
	formsTable.addSection("thead", [formsTableHeader]);

	formsTable.addSection("tbody");
	$.each(this.data.Forms, function(index, theForm) {
		formsTable.addRow("tbody", index, [
			new TableCell(theForm.Name).setClasses('wide-cell').setTh(),
			new TableCell(theForm.STR).setClasses('thin-cell'),
			new TableCell(theForm.DEX).setClasses('thin-cell'),
			new TableCell(theForm.CON).setClasses('thin-cell'),
			new TableCell(theForm.INT).setClasses('thin-cell'),
			new TableCell(theForm.WIS).setClasses('thin-cell'),
			new TableCell(theForm.CHA).setClasses('thin-cell'),
			new TableCell(theForm.Speed).setClasses('medium-cell'),
			new TableCell(theForm.Size).setClasses('medium-cell'),
			new TableCell(theForm.Weight).setClasses('medium-cell'),
			new TableCell(theForm.NA).setClasses('medium-cell'),
		])
	})

	formsTable.canAddRows();
	
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

	var classLevelsTable = new Table(qn+"_Levels", "standard");

	var classLevelsTableHeader = [
		new TableCell('Classes').setClasses('wide-cell').setTh(),
		new TableCell('Lvl').setClasses('thin-cell').setTh(),
		new TableCell('HP rolls').setClasses('medium-cell').setTh(),
		new TableCell('+Abl').setClasses('thin-cell').setTh(),
	];

	classLevelsTable.addSection("thead", [classLevelsTableHeader]);
	
	classLevelsTracker = {}
	classLevelsTable.addSection("tbody");
	var characterLevel = 0;
	$.each(this.data.Class_Levels, function(index, theLevel) {
		var lvl = 1;
		if(theLevel.Class in classLevelsTracker) {
			classLevelsTracker[theLevel.Class]++;
			lvl = classLevelsTracker[theLevel.Class];
		} else {
			classLevelsTracker[theLevel.Class] = 1;
		}
		var newRow = [
			new TableCell(theLevel.Class),
			new TableCell(lvl),
			new TableCell(theLevel.HP),
			new TableCell("Ability_Increment" in theLevel ? theLevel.Ability_Increment : ""),
		]
		classLevelsTable.addRow("tbody", index, newRow)
	})

	classLevelsTable.canAddRows();

	$(bodyTab).append(
		div(classLevelsTable.getHTML(), '', 'table-container')
	);
}
