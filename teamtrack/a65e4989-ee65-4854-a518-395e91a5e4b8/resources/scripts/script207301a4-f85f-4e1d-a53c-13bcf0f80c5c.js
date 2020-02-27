function CopyValuesToField(arrValueFields, strToField, strPrefix, strSuffix, blnAppend) {
	var val = "";

	
	if(blnAppend !== true) blnAppend = false;
	if(strPrefix) val += strPrefix + "\n";

	for(var i = 0; i < arrValueFields.length; i++) {
		if(jQuerySBM.trim(arrValueFields[i].display).length > 0) {
			val += arrValueFields[i].display + ": ";
		}

		var sbmFldVal = GetFieldValue(arrValueFields[i].field);
		var fldVal = "";

		if(sbmFldVal && sbmFldVal.getMonth) {
			fldVal = (sbmFldVal.getMonth()+1) + "-" + sbmFldVal.getDate() + "-" + sbmFldVal.getFullYear();
		}
		else {
			fldVal = jQuerySBM.trim(sbmFldVal+ "");
		}

		val +=  ((fldVal)?fldVal.replace(/(\r\n|\n|\r)/gm,", "):"(None)") + "\n";
	}

	if(strSuffix) val += strSuffix;

	if(blnAppend) {
		val = GetFieldValue(strToField) + val;
	}

	SetFieldValue(strToField, val);
}

function SetValuesFromField(arrValueFields, strFromField, strSeperator) {
	if(!strSeperator) strSeperator = ":";

	for(var i = 0; i < arrValueFields.length; i++) {
		var fldLabel = jQuerySBM.trim(arrValueFields[i].display);

		if(fldLabel.length > 0) {
			SetFieldValue(arrValueFields[i].field, GetValueByLabel(fldLabel, strSeperator, strFromField));
		}
	}
}

function GetValueByLabel(strLabel, strSeperator, strField) {
	var fldText = GetFieldText(strField);
	var regex = new RegExp("(" + strLabel + ")" + strSeperator + "\\s+(.+)");
	var match = regex.exec(fldText);

	if (match != null && match.length > 2) {
		return jQuerySBM.trim(match[2]);
	} else {
		return  "";
	}
}

function GetFieldText(strFieldName) {
	for(var i = 0; i < aFieldLookup.Fields.length; i++) {
		if(aFieldLookup.Fields[i].name == strFieldName || aFieldLookup.Fields[i].dbName == strFieldName) {
			return jQuerySBM("#" + aFieldLookup.Fields[i].fid).html().replace(/\<br\>/gi, "\n");
		}
	}

	return "";
}

function ValidateUnboundField_Required(strFieldName, strFieldLabel) {
	var val = jQuerySBM.trim(GetFieldValue(strFieldName, ""));
	strFieldLabel = jQuerySBM.trim(strFieldLabel);
	strFieldLabel = (strFieldLabel == "") ? strFieldName : strFieldLabel;

	if(val != "") {
		MakeFieldValid(strFieldName);
		MakeFieldOptional(strFieldName);
	}
	else {
		//MakeFieldInvalid(strFieldName, "Please supply a value for the '" + strFieldLabel + "' field.");
             MakeFieldInvalid(strFieldName);
		MakeFieldRequired(strFieldName);
	} 
}

function ValidateDateField(strFieldName){
	var startDateValueInt = jQuerySBM(GetFieldByName(strFieldName)).val();
	var dateArrayLongString = startDateValueInt.split(" ");
	var checkIfMonth = function(arrMONTHS, dateArrayLongString) {
	    return monthArray.some(function (v) {
	        return dateStringArray.indexOf(v) >= 0;
	    });
	};
	if (checkIfMonth) {return}

	var parsedDateInt = parseDate(startDateValueInt);
	if (parsedDateInt == null){
			alert(startDateValueInt + ' is an invalid value for the date. Please enter a new date.'); 
			SetFieldValue(strFieldName, "Error", false);
	}
	else if (startDateValueInt != parsedDateInt) {
			SetFieldValue(strFieldName, parsedDateInt, false);
	}
}
