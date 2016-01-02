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
		h4(
			span(this.data.Gender,    qn+'_Gender') + ' ' +
			span(this.data.Race,      qn+'_Race') + ' ' +
			span('(' + this.data.Alignment + ')', qn+'_Alignment'),
		qn+'_Subtitle')
	);

	// $(bodyTab).append('<hr class="heavy"/>');

	/*
	 * Forms
	*/
	{
		$(bodyTab).append(h3('Forms', '', 'section-head'));

		$(bodyTab).append('<hr class="light"/>');

		var formsTable = new Table(qn+"_Forms", "standard");
		var formsTableHeader = [
			new TableCell('Form Name').setClasses('wide-cell no-border no-background'),
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
	}

	// Languages
	$(bodyTab).append(
		h3('Languages', '', 'section-head') + '<hr class="light"/>' +
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

	/**
	 * Class levels
	**/
	{
		$(bodyTab).append(h3('Levels', '', 'section-head'));

		$(bodyTab).append('<hr class="light"/>');

		var classLevelsTable = new Table(qn+"_Levels", "standard");

		var classLevelsTableHeader = [
			new TableCell('Level').setClasses('thin-cell').setTh(),
			new TableCell('Class').setClasses('wide-cell').setTh(),
			new TableCell('Hit Die Roll').setClasses('thin-cell').setTh(),
			new TableCell('Increased Ability').setClasses('thin-cell').setTh(),
		];

		classLevelsTable.addSection("thead", [classLevelsTableHeader]);
		
		var classLevelsTracker = {};
		classLevelsTable.addSection("tbody");
		var characterLevel = 0;
		$.each(this.data.Class_Levels, function(index, theLevel) {
			characterLevel++;
			var lvl = 1;
			if(theLevel.Class in classLevelsTracker) {
				classLevelsTracker[theLevel.Class]++;
				lvl = classLevelsTracker[theLevel.Class];
			} else {
				classLevelsTracker[theLevel.Class] = 1;
			}
			var newRow = [
				new TableCell(characterLevel).setClasses('thin-cell'),
				new TableCell(theLevel.Class + ' ' + lvl).setClasses('wide-cell'),
				new TableCell(theLevel.HP).setClasses('thin-cell'),
				new TableCell("Ability_Increment" in theLevel ? theLevel.Ability_Increment : "").setClasses('thin-cell'),
			];
			classLevelsTable.addRow("tbody", index, newRow);
		});

		$(bodyTab).append(
			div(classLevelsTable.getHTML(), '', 'table-container')
		);
	}

	// $(bodyTab).append('<br /><hr class="light"/>');

	/**
	 * Skills
	**/
	{

		$(bodyTab).append(h3('Skills', '', 'section-head'));

		$(bodyTab).append('<hr class="light"/>');

		var skillLevelsTable = new Table(qn+"_Skills", "standard");
		var skillLevelsTableHeader = [[new TableCell('Level').setClasses('wide-cell')]];
		var skillLevelsTableBody = [];
		var skillLevelsTracker = {};
		var skillTotalsTracker = {};
		var skillsAdded = 0;

		$.each(this.data.Class_Levels, function(levelIndex, theLevel) {
			$.each(theLevel.Skills, function(skillName, points) {
				if(!(skillName in skillLevelsTracker)) {
					skillLevelsTableBody.push([new TableCell(skillName).setClasses('wide-cell').setTh()]);
					skillLevelsTracker[skillName] = skillsAdded;
					skillTotalsTracker[skillName] = 0;
					skillsAdded++;
				}
			});
		});

		skillLevelsTable.addSection("thead", skillLevelsTableHeader);
		skillLevelsTable.addSection("tbody", skillLevelsTableBody);

		$.each(this.data.Class_Levels, function(levelIndex, theLevel) {
			var col = [new TableCell(levelIndex+1).setClasses('very-thin-cell').setTh()];
			$.merge(col, $.map(new Array(skillsAdded), function () {
				return new TableCell('').setClasses('very-thin-cell');
			}));

			$.each(theLevel.Skills, function(skillName, points) {
				col[skillLevelsTracker[skillName]+1].setText(points);
				skillTotalsTracker[skillName] += points;
			});

			skillLevelsTable.addCol(levelIndex+1, col);
		});

		var totalsCol = [null];
		$.merge(totalsCol, $.map(new Array(skillsAdded), function () {
			return new TableCell('').setClasses('very-thin-cell highlight');
		}));

		$.each(skillTotalsTracker, function(skillName, points) {
			console.log(skillName + ", " + points);
			totalsCol[skillLevelsTracker[skillName]+1].setText(points);
		});

		skillLevelsTable.addCol(1, totalsCol);

		$(bodyTab).append(
			div(skillLevelsTable.getHTML(), '', 'table-container')
		);
	}

	$(bodyTab).append('<br /><br />');
}
