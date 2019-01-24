// Authors: Alejandro Elizondo 1155123257, Ubaydullo Rustami 1155102622, Andres Tamez 1155123046


$(document).ready(function() {

	document.getElementById('txtFileUpload').addEventListener('change', upload, false);

	function browserSupportFileUpload() {
		var isCompatible = false;
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			isCompatible = true;
		}
		return isCompatible;
	}

	function fillInputs(data){
		$('#actName').val(data[0][0]);
		$('#actSchedule').val(data[0][1]);
		$('#actOrg').val(data[0][2]);
		$('#actLoc').val(data[0][3]);
		if(data[0][4].toUpperCase() == "TRUE" ) {
			$('#actCharity').val(1);
			$('#actCharity').prop('checked', true);
		} else {
			$('#actCharity').val(0);
			$('#actCharity').prop('checked', false);
		}
	}

	function upload(evt) {
		if (!browserSupportFileUpload()) {
			alert('The File APIs are not fully supported in this browser!');
		} else {
			var data = null;
			var file = evt.target.files[0];
			var reader = new FileReader();
			reader.readAsText(file);
			reader.onload = function(event) {
				var csvData = event.target.result;
				data = CSVToArray(csvData, ',');
                // $.csv.toArrays(csvData);
                if (data && data.length > 0) {
                	fillInputs(data);
                } else {
                	alert('No data to import!');
                }
            };
            reader.onerror = function() {
            	alert('Unable to read ' + file.fileName);
            };
        }
    }

    function CSVToArray( strData, strDelimiter ){
    	strDelimiter = (strDelimiter || ",");

    	var objPattern = new RegExp(
    		(
    			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

    			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

    			"([^\"\\" + strDelimiter + "\\r\\n]*))"
    			),
    		"gi"
    		);

    	var arrData = [[]];
    	var arrMatches = null;

    	while (arrMatches = objPattern.exec( strData )){

    		var strMatchedDelimiter = arrMatches[ 1 ];
    		if (
    			strMatchedDelimiter.length &&
    			strMatchedDelimiter !== strDelimiter
    			){

    			arrData.push( [] );

    	}

    	var strMatchedValue;

    	if (arrMatches[ 2 ]){

    		strMatchedValue = arrMatches[ 2 ].replace(
    			new RegExp( "\"\"", "g" ),
    			"\""
    			);

    	} else {

    		strMatchedValue = arrMatches[ 3 ];

    	}

    	arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    return( arrData );
}
});

$(document).on('click', ".form-check-input",function(){
	$(this).val(this.checked ? 1 : 0);
});

$(document).on('click', "#flush",function(){
	$.ajax({
		type: 'POST',
		url: '/flush',
		data: {},
		success: function(data) {
			alert(data);
		}
	});
});

$(document).on('click', "#addActivity",function(){
	let data = {aName: $("#actName").val(), schedule: $("#actSchedule").val(), oName: $("#actOrg").val(),
	lName: $("#actLoc").val(), charity: $("#actCharity").val()};
	$.ajax({
		type: 'POST',
		url: '/activity',
		data: data,
		success: function(data) {
			alert(data);
		}
	});
});
