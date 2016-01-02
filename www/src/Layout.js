/* Global */

var OPENSHEET = OPENSHEET || {};

/* General Layout */

OPENSHEET.layout = {
	currentTab: "",
	lastTab: "",

	hideCurrentTab: function() {
		this.lastTab = this.currentTab;
		$("#" + this.currentTab + "-body").hide()
		$("#" + this.currentTab + "-btn").removeClass("active");
	},

	parseFile: function() {
		var i = 0;
		for (sheetPath in OPENSHEET.file.loadedFiles) {
			groupName = "group"+i;
			OPENSHEET.file.data.groups[groupName] = new Group(groupName, sheetPath)
			OPENSHEET.file.data.groups[groupName].addTabs(OPENSHEET.file.loadedFiles[sheetPath].groups[i].tabs)
			OPENSHEET.file.data.groups[groupName].collapsible = !OPENSHEET.file.loadedFiles[sheetPath].name;
			++i;
		}

		this.generateLayout();
	},

	generateLayout: function() {
		for (groupName in OPENSHEET.file.data.groups) {
			OPENSHEET.file.data.groups[groupName].layoutSelf();
		}
	},
}

// Convenience functions for layout

ifID = function(text) {
	if (text != "") {
		return ' id="'+text+'"';
	} else {
		return '';
	}
}

ifClasses = function(classes = []) {
	if(classes != "") {
		var classString = classes.join(" ");
		return ' class="'+classString+'"';
	} else {
		return '';	
	} 
}

makeHeader = function(level, text, id, classString = "") {
	return '<h'+level+ifID(id)+' class="'+classString+'">'+text+'</h'+level+'>\n';
}

h1 = function(text, id = "", classString = "") {
	return makeHeader(1, text, id, classString)
}
	
h2 = function(text, id = "", classString = "") {
	return makeHeader(2, text, id, classString)
}

h3 = function(text, id = "", classString = "") {
	return makeHeader(3, text, id, classString)
}

h4 = function(text, id = "", classString = "") {
	return makeHeader(4, text, id, classString)
}

span = function(text, id = "", classString = "") {
	return '<span'+ifID(id)+' class="'+classString+'">'+text+'</span>\n';	
}

div = function(text, id = "", classString = "") {
	return '<div'+ifID(id)+' class="'+classString+'">'+text+'</div>\n';	
}

p = function(text, id = "", classString = "") {
	return '<p'+ifID(id)+' class="'+classString+'">'+text+'</p>\n';	
}

td = function(text, id = "", classes = [], attrString = "") {
	return '<td '+attrString+ifClasses(classes)+'">'+text+'</td>\n';
}

th = function(text, id = "", classes = [], attrString = "") {
	return '<th '+attrString+ifClasses(classes)+'">'+text+'</th>\n';
}

tr = function(cells, id = "", classString = "") {
	return '<tr class="'+classString+'">'+cells+'</tr>\n';
}

thead = function(rows, classString = "") {
	return '<thead class="'+classString+'">'+rows+'</thead>\n';
}

tbody = function(rows, classString = "") {
	return '<tbody class="'+classString+'">'+rows+'</tbody>\n';	
}

tfoot = function(rows, classString = "") {
	return '<tfoot class="'+classString+'">'+rows+'</tfoot>\n';
}

table = function(head, body, foot, id = "", classString = "") {
	return '<table'+ifID(id)+' class="'+classString+'">'+head+body+foot+'</table>\n';
}

tsections = {'thead': thead, 'tbody': tbody, 'tfoot': tfoot};

function Table(id = "", classString = "") {
	this.id = id;
	this.classes = classString = "" ? [] : classString.split(" ");
	this.contents = {};
	this.width = 0;
	this.rowButton = false;
	this.colButton = false;
}

Table.prototype = {
	constructor: Table,

	addSection: function(type, rows = []) {
		for(row of rows) {
			if(this.width == 0) {
				this.width = row.length;
			} else {
				if (this.width != row.length) {
					console.log("Error, you're trying to add a non-rectangular array");
				}
			}
		}

		switch (type)
		{
			case "thead":
			case "tbody":
			case "tfoot":
				this.contents[type] = rows;
				return true;
			default:
				// Intentionally left blank
				break;
		}

		return false;
	},

	addRow: function(section, index, cells) {
		if(cells.length != this.width && this.width != 0) {
			console.log("can't add row because it doesn't have " + this.width + " cells");
		} else if (this.width == 0) {
			this.width = cells.length;
		}

		if(index >= 0 && index <= this.contents[section].length) {
			this.contents[section].splice(index, 0, cells);
			return true;
		}

		return false;
	},

	addCol: function(index, cells) {
		if(index >= 0 && index <= this.width) {
			var i = 0;
			for(section of ['thead', 'tbody', 'tfoot']) {
				if(!(section in this.contents)) {
					continue;
				}
				for(row of this.contents[section]) {
					row.splice(index, 0, cells[i]);
					i++;
				}
			}
			this.width++;
			return true;
		}

		return false;
	},

	canAddRows: function() {
		this.rowButton = true;
	},

	canAddCols: function() {
		this.colButton = true;
	},

	// if row or col is negative, this uses python-style indexing
	getCell: function(sectionName, row, col) {
		var section = this.contents[sectionName];
		if(row < 0) row += section.length;
		if(col < 0) col += section[row].length;
		return section[row][col];
	},

	renderSection: function(sectionName) {
		if(!(sectionName in this.contents)) {
			return '';
		}

		return tsections[sectionName](
			$.map(this.contents[sectionName], function(row, i){
				return renderRow(row);
			}).join('')
		);
	},

	getHTML: function() {
		if(this.rowButton || this.colButton) {
			var height = sumArray($.map(this.contents, function(section, sectionName) {
				return section.length;
			}));

			this.addCol(this.width, $.map(new Array(height), function(x, i) {
				return new TableCell('').setClasses('spacer-small no-border');
			}));
			this.addCol(this.width, $.map(new Array(height), function(x, i) {
				return new TableCell('').setClasses('no-border');
			}));

			if(this.rowButton) {
				this.getCell('tbody', -1, -1).setText('+').addClass('add-button');
			}
			if(this.colButton) {
				this.getCell('thead', -1, -1).setText('+').addClass('add-button').setTh();
			}
		}
		return table( 
			this.renderSection('thead'), 
			this.renderSection('tbody'), 
			this.renderSection('tfoot'), 
			this.ID, 
			this.classes.join(' ')
		);
	}
}

determineColspan = function(row, cellIndex) {
	if(cellIndex == row.length - 1) {
		return 1;
	}
	if(row[cellIndex + 1] != null) {
		return 1;
	}
	return 1 + determineColspan(row, cellIndex + 1);
}

renderRow = function(row) {
	var rowText = '';
	for(var i = 0; i < row.length; ++i) {
		if(row[i] != null) {
			rowText += row[i].getHTML(determineColspan(row, i));
		}
	}

	return tr(rowText);
}

function TableCell(text = '') {
	this.text = text;
	this.id = '';
	this.classes = [];
	this.isTh = false;
}

TableCell.prototype = {
	constructor: TableCell,

	setText: function(newText) {
		this.text = newText;
		return this;
	},

	setID: function(newID) {
		this.ID = newID;
		return this;
	},

	setClasses: function(classString) {
		this.classes = (classString == '' ? [] : classString.split(' '));
		return this;
	},

	addClass: function(newClass) {
		this.classes.push(newClass);
		return this;
	},

	setTh: function(isTh = true) {
		this.isTh = isTh;
		return this;
	},

	getHTML: function(colspan) {
		var tag = this.isTh ? th : td;
		var attrString = (colspan == 1 ? '' : 'colspan="' + colspan + '"');
		return tag(this.text, this.id, this.classes, attrString);
	}
}