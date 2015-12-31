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

td = function(text, classString = "", attrString = "") {
	return '<td '+attrString+' class="'+classString+'">'+text+'</td>\n';
}

th = function(text, classString = "") {
	return '<th class="'+classString+'">'+text+'</th>\n';
}

tr = function(cells, classString = "") {
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
}

Table.prototype {
	addSection: function(type, rows = []) {
		for(row in rows) {
			if(this.width == null) {
				this.width = row.length;
			} else {
				if (this.width != row.length) {
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
	}

	addRow: function(section, index, cells) {
		if(cells.length != this.width && this.width != 0) {
			return false;
		} else if (this.width == 0) {
			this.width = cells.length;
		}

		if(index >= 0 && index <= contents[section].length) {
			contents[section].splice(index, 0, cells);
			return true;
		}

		return false;
	}

	addCol: function(index, cells) {
		if(index >= 0 && <= this.width) {
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
	}

	print: function() {
		toReturn = "<table" + ifID(this.id) + ifClasses(this.classes) + ">\n";

		for(section in this.contents) {
			toReturn += '<'+section+'>';
			for(row of this.contents[section]) {
				toReturn += '<tr>';
				for(cell of row) {
					toReturn += cell;
				}
				toReturn += '</tr>';
			}
			toReturn += '</'+section+'>';	
		}

		return toReturn;
	}
}