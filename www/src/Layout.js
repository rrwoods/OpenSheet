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

td = function(text, id = "", classString = "", attrString = "") {
	return '<td '+attrString+' class="'+classString+'">'+text+'</td>\n';
}

th = function(text, id = "", classString = "", attrString = "") {
	return '<th '+attrString+' class="'+classString+'">'+text+'</th>\n';
}

tr = function(cells, id = "", classString = "") {
	return '<tr class="'+classString+'">'+cells+'</tr>\n';
}

thead = function(rows, classString = "") {
	return '<thead class="'+classString+'>'+rows+'</thead>\n';
}

tbody = function(rows, classString = "") {
	return '<tbody class="'+classString+'>'+rows+'</tbody>\n';	
}

tfoot = function(rows, classString = "") {
	return '<tfoot class="'+classString+'>'+rows+'</tfoot>\n';
}

table = function(head, body, foot, id = "", classString = "") {
	return '<table'+ifID(id)+' class="'+classString+'">'+head+body+foot+'</table>\n';
}

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
			var rowLength = sumArray($.map(row, function(cell, i) {
				return cell.colspan;
			}))
			if(this.width == 0) {
				this.width = rowLength;
			} else {
				if (this.width != rowLength) {
					console.log("Error, you're trying to add a non-rectangular array");
					return false;
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
			return false;
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
			for(section in this.contents) {
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

	getHTML: function() {
		toReturn = "<table" + ifID(this.id) + ifClasses(this.classes) + ">\n";

		for(section of ['thead', 'tbody', 'tfoot']) {
			if(section in this.contents) {
				toReturn += '<'+section+'>';
				for(row of this.contents[section]) {
					toReturn += '<tr>';
					for(cell of row) {
						toReturn += cell.getHTML();
					}
					toReturn += '</tr>';
				}
				toReturn += '</'+section+'>';
			}
		}

		toReturn += '</table>';
		return toReturn;
	}
}

function TableCell(text = '') {
	this.text = text;
	this.id = '';
	this.classes = [];
	this.isTh = false;
	this.colSpan = 1;
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

	setColspan: function(newColspan) {
		this.colspan = newColspan;
		return this;
	},

	getHTML: function() {
		tag = this.isTh ? th : td;
		attrString = (this.colspan == 1 ? '' : 'colspan="' + this.colspan + '"');
		return tag(this.text, this.id, this.classes.join(' '), this.attrString);
	}
}