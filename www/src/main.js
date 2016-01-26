/* File Handling */
OPENSHEET.file = {
	loadedFiles: {},
	data: {
		groups: {},
	},

	loadFile: function(path) {
		$.getJSON(path, 'json', function(loadedFile) {
				OPENSHEET.file.loadedFiles[path] = loadedFile;
				OPENSHEET.layout.parseFile();
		}).fail(function(jqXHR) {
			alert("File load failed! Error " + jqXHR.status);
		});
	}
};

window.sumArray = function(array)
{
	return array.reduce(function(pv, cv) { return pv + cv; }, 0);
};

/* Ready, set, go! */

$(document).ready(function() {
	$.ajaxSetup({
		beforeSend: function(xhr) {
			if (xhr.overrideMimeType) {
		 		xhr.overrideMimeType("application/json");
			}
		},

		cache: false,
	});

	var fileToLoad = "User Data/Saved Sheets/Alth_Shrenan.json";
	OPENSHEET.file.loadFile(fileToLoad);

	$("#main-sidebar").effect("shake");

	//OPENSHEET.layout.openTab("group0_Basics");
}); 