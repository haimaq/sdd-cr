// Version 1.3 - SSM
// SSM version removes fixMessageLogBug

// Setting to determine whether the sections with empty required fields should be highlighted 
var EnhancedValidation_HighlightSections = true;

// Css class to add to the section title when highlighting
var EnhancedValidation_HighlightClass = "reqempty"; 

// Field types that are containers
var _pageSectionTypes = ["tab", "section"];

// Variable used to cache the page sections
var _pageSections = null;


function NavigateToField(fieldName) {
	var fld = null;
	
	//if submitting and Deployment Path is required (new Release Package) then override fieldName to DeploymentPathOptions (DEF272068)
	if (fieldName === "Deployment Path" && getCurrentTemplate() === "newbody") {
		fieldName = "DeploymentPathOptions";
	}
	
	for (var i = 0; i < aFieldLookup.Fields.length; i++) {
		if(aFieldLookup.Fields[i].dbName == fieldName || aFieldLookup.Fields[i].name == fieldName) {
			fld = aFieldLookup.Fields[i];
			break;
		}
	}
	
	if(fld != null) {
		// Find field id, replace if journal field
		var fldJq = jQuerySBM("#" + fld.fid);
		var fieldNumber = fld.fid;
		if (fld.name =="Message Log" || fld.subType == "journal") {
			fieldNumber = (fld.fid).replace("F", "H");
			fldJq = jQuerySBM("#"+ fieldNumber);
		}
		
		// Expand sections that contain the field
		var pageSections = GetPageSections();
		
		for(var i = 0; i < pageSections.length; i++) {
			var context = document.getElementById("Section" + pageSections[i].fid + "_container");
				
			if(context != null && jQuerySBM("#" + fieldNumber, context).size() > 0) {
				if(pageSections[i].type == "section" && IsSectionExpanded(pageSections[i].name) == false) {
					ExpandSection(pageSections[i].name);
				}
				else if(pageSections[i].type == "tab" && IsTabActivated(pageSections[i].name) == false) {
					ActivateTab(pageSections[i].name);
				}
			}
		} 
			
		// Scroll to field
		jQuerySBM('html, body').animate({ scrollTop: fldJq.offset().top - 60, scrollLeft: fldJq.offset().left }, 200);
		
		try {
			top.scrollTo(fldJq.offset().left, fldJq.offset().top - 60);
		}catch(_e){}
		
		fldJq.focus();
		fldJq.effect("highlight", {}, 2000);
	}
}



function HighlightSectionsWithReqFields() {
	if(EnhancedValidation_HighlightSections === true) {
		var fields = __getRequiredFields();
		var pageSections = GetPageSections();
		var expandersCollapsed = 0;

		if (getFormType()) {
			for (var i = 0; i < pageSections.length; i++) {
			/*collapse all expanders before checking if data inside is required */
			Section_SetExpanded(pageSections[i].name, "collapse");	
			}
			
			for(var fldIdx = 0; fldIdx < fields.length; fldIdx++) {
				for(var i = 0; i < pageSections.length; i++) {
					var context = document.getElementById("Section" + pageSections[i].fid + "_container");

					if(context != null && jQuerySBM("#" + fields[fldIdx].fid, context).size() > 0) {
						if(pageSections[i].type == "section") {
							jQuerySBM(document.getElementById("Section" + pageSections[i].fid + "_label")).addClass(EnhancedValidation_HighlightClass);
							Section_SetExpanded(pageSections[i].name, "expand");
						}
						else if(pageSections[i].type == "tab") {
							jQuerySBM("a", document.getElementById("tab." + pageSections[i].fid)).first().addClass(EnhancedValidation_HighlightClass);
						}
					}
					if (fields[fldIdx].name == "Message Log" && pageSections[i].name == "NotesExpander") {
						jQuerySBM(document.getElementById("Section" + pageSections[i].fid + "_label")).addClass(EnhancedValidation_HighlightClass);
						Section_SetExpanded(pageSections[i].name, "expand");
					} 
					if ((pageSections[i].name).indexOf("idden") != -1) {
						Section_SetExpanded(pageSections[i].name, "collapse");
					}
				}
			}
			/*get number of expanders that are collapsed*/
			for (var i = 0; i < pageSections.length; i++) {
				if(!IsSectionExpanded(pageSections[i].name)) {
					expandersCollapsed++;
				}
			}
			/*if all expanders are collapsed*/
			if ((expandersCollapsed == pageSections.length) && expandersCollapsed != 1) {
				/*check for hidden expanders and expand first that is not hidden*/
				for (var i = 0; i < pageSections.length; i++) {
					if (!IsSectionShown(pageSections[i].name)) {
						if (pageSections[i+1] && IsSectionShown(pageSections[i+1].name)) {
							Section_SetExpanded(pageSections[i+1].name, "expand");
							break;
						}
					}
					else if (IsSectionShown(pageSections[i].name)) {
						Section_SetExpanded(pageSections[i].name, "expand");
						break;
					}
				}
			}
		}
		else {
			if (expandersCollapsed != 1) {
			for (var i = 0; i < pageSections.length; i++) {
			Section_SetExpanded(pageSections[i].name, "expand");	
			}
		}
	}
}
}


function GetPageSections() {
	if(_pageSections == null) {
		_pageSections = [];
		
		for (var i = 0; i < aFieldLookup.Fields.length; i++) {
			var fldType = aFieldLookup.Fields[i].type;
			
			for(var j = 0; j < _pageSectionTypes.length; j++) {
				if(fldType == _pageSectionTypes[j]) {
					_pageSections.push(aFieldLookup.Fields[i]);
					break;
				}
			}
		}
	}
	
	return _pageSections;
}

function AddLinksToErrorMsg() {
	var errMsgJq = jQuerySBM("#ErrorMsg");
	
	if(errMsgJq.size() > 0 && errMsgJq.is(":visible")) {
		var errorHtml = errMsgJq.html();
		newErrorHtml = errorHtml.replace(/\'(.+?)\'/g, "'<a href=\"javascript:NavigateToField('$1');\">$1</a>'");
		errMsgJq.html(newErrorHtml);
	}
}


function __getRequiredFields() {

	var fields = GetRequiredFields();

	for (var i = 0; i < aFieldLookup.Fields.length; i++) 
	{
		var objname = aFieldLookup.Fields[i].dbName;
		var label = GetLabelByName(objname);
		if (label == null) continue;

		var spantags = label.getElementsByTagName("span");
		if ((spantags != null) && (spantags.length > 0) && ((spantags[0].className == "reqempty"))) // || (spantags[0].className == "reqfilled")
		{
			if (!RequiredFields[aFieldLookup.Fields[i].fid])  // if was not already in the required list...
			{
				fields[fields.length] = aFieldLookup.Fields[i];
			}
		}
	}   
	
	return fields;
}

// OVERRIDE: aeplugin_2009_r2.js - SubmitCallback
function SubmitCallback(type, bPost)
{
    ShowErrorDiv(false);

    var frm = document.SubmitForm;
    if (!frm) frm = document.TransitionForm;
  
    if ( (type == 1) && (!frm || frm.ReloadForm.value != "1") ) // OK button; not Cancel button
    {
        // Call submit callbacks
        for( var i = 0; i < SubmitCallbacks.length; i++ ) {
            var callback = SubmitCallbacks[i];
            if (callback != null) {
                var result = callback();
                if (result == false) {
                    return result;
                }
            }
        }        
        
        // Check for required fields
        var msg = defaultErrorString;
        msg += "<br>";
        var req = false;
        var fields = GetRequiredFields();
        if (bValidateRequiredFields)
        {
            for (var i = 0; i < aFieldLookup.Fields.length; i++) 
            {
                var objname = aFieldLookup.Fields[i].dbName;
                var label = GetLabelByName(objname);
                if (label == null) continue;

                var spantags = label.getElementsByTagName("span");
                if ((spantags != null) && (spantags.length > 0) && ((spantags[0].className == "reqempty") || (spantags[0].className == "reqfilled")))
                {
					if (!RequiredFields[aFieldLookup.Fields[i].fid])  // if was not already in the required list...
					{
						fields[fields.length] = aFieldLookup.Fields[i];
                    }
                }
            }                
        }
        
        for ( var i = 0; i < fields.length; i++ )
        {
            if (fields[i].dbName && IsFieldEmpty( fields[i].dbName ))
            {
                var params = new Array();
                params[0] = "<a href='javascript:NavigateToField(\"" + fields[i].name + "\");'>" + fields[i].name + "</a>";
                var fldmsg = BuildString(defaultRequiredString, params);
                msg += fldmsg + "<br>";
                req = true;
            }
			else if (IsFieldEmpty( fields[i].name))
			{
			var params = new Array();
                params[0] = "<a href='javascript:NavigateToField(\"" + fields[i].name + "\");'>" + fields[i].name + "</a>";
                var fldmsg = BuildString(defaultRequiredString, params);
                msg += fldmsg + "<br>";
                req = true;
			}
        }
        
        // check for invalid fields
        fields = GetInvalidFields();
        for ( var i = 0; i < fields.length; i++ )
        {
            var fldmsg = InvalidFields[fields[i].fid];
            //fields[i].name + " - " + ;
            msg += fldmsg.replace(fields[i].name,  "<a href='javascript:NavigateToField(\"" + fields[i].name + "\");'>" + fields[i].name + "</a>") + "<br>";
            req = true;
        }
        msg += "<br>";
              
        // Show/hide error message
        if (req) {
            ShowErrorDiv(true, msg);
            return false;
        }
    }
    
    return OldGoSubmit(type, bPost);
}

function getQueryParameterByName(name)
{
	name = name.toLowerCase();
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search.toLowerCase());
	
	if (results === null) {
		return "";
	} 
	else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}

function getCurrentTemplate() 
{
	var template = this.getQueryParameterByName("template");
	return (template == null) ? "" : template.toLowerCase();
}

function getFormType()
{
	var template = this.getCurrentTemplate();
	if (template === "newbody") {
		//submit
		return true;
	}
	else if (template === "formbody") {
		//transition
		return true;
	}
	else {
		//state
		return false;
	}
}

AddLoadCallback(HighlightSectionsWithReqFields);
AddLoadCallback(AddLinksToErrorMsg);