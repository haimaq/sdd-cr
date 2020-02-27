var SOO = SOO || {};

SOO.changeSelector = {
	initializeList: function(fieldName, dropDownName, noneString) {
		var hasSelection = false;
		var isSelectionValid = false;
		var dropdownId = LookupFieldId(dropDownName);
		var dropdownList = jQuerySBM('#' + dropdownId);
		jQuerySBM(dropdownList).find('option').remove();
		var reportRef = 'USR_RELEASE_PACKAGE.CRS.LinkedCPS';
		var Mask = GetFieldValue('Mask');
		var reportParams = [ { name: 'F_TS_TITLE', value: Mask } ];
		var results = SBMSOL.Report.getJson(reportRef, reportParams, true, 'nocallback');

		//set to currently selected item, if any, else add none and select it.
		var currentSelectionValue = jQuerySBM(GetFieldByName('CHANGE_PACKAGE')).val();
		if (currentSelectionValue != 0 && currentSelectionValue != null && currentSelectionValue != noneString) {
			hasSelection = true;
			jQuerySBM(dropdownList).prepend('<option value=0>None</option>');
		} else {
			jQuerySBM(dropdownList).prepend('<option value=0>None</option>').select();
			//.select not working in FF. Set it manually a second time.
			jQuerySBM(dropdownList).val(0);
		}

		jQuerySBM(results).each(function(intNameIndex) {
			var jSelection = jQuerySBM('<option></option>');
			// Set the selection text.
			jSelection.text(this.ISSUEID + ':' + this.TITLE);
			jSelection.attr('value', this.id);

			jQuerySBM(dropdownList).append(jSelection);
			if (hasSelection && this.id == currentSelectionValue) {
				jQuerySBM(dropdownList).val(this.id);
				isSelectionValid = true;
			}
		});

		if (!isSelectionValid) {
			//add code clear invalid selection
			jQuerySBM(dropdownList).val(0);
			if (jQuerySBM(dropdownList).val() != 0) {
				//.select not working in FF. Set it manually a second time.
				jQuerySBM(dropdownList).val(0);
			}

			SOO.changeSelector.updateField(fieldName, 0, noneString);
		}

		jQuerySBM(dropdownList).change(function() {
			var dropdownValue = jQuerySBM('#' + dropdownId + ' option:selected').attr('value');
			var dropdownText = jQuerySBM('#' + dropdownId + ' option:selected').text();
			var dpTableId = jQuerySBM('#' + dropdownId + ' option:selected').attr('tableid');
			SOO.changeSelector.updateField(fieldName, dropdownValue, dropdownText);
			if (dropdownValue != 0) {
				ShowField('loadingDPText');
			} else {
				MakeFieldInvalid('CHANGE_PACKAGE');
			}
		});
	},
	updateField: function(fieldName, val, displayName) {
		var enFldId = LookupFieldId(fieldName);
		jQuerySBM('#' + enFldId)
			.find('option')
			.remove()
			.end()
			.append(jQuerySBM('<option></option>').attr('value', val).text(displayName))
			.val(val)
			.change();
		SetFieldValue(fieldName, displayName);
	}
};