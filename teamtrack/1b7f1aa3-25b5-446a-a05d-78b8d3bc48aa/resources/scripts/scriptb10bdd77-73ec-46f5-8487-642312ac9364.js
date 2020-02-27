/* 
* Serena SBM Solutions Common Utilities (sbmsol-util.js)
* Author & Copyright (c) 2013-16 Serena Software, Inc.
*
* Version 1.1.1
*
* Requires SBM 11.0.1 (jQuerySBM)
*
* Contains:
*  SBMSOL.Util                General purpose utilities
*  SBMSOL.Item                SBM item manipulation
*  SBMSOL.Item.Current        SBM item manipulation for the current item, assumes an open item on the page
*  SBMSOL.Report              Functions for calling and working with SBM report data  
*  SBMSOL.Dialog              Functions for opening transitions and urls in a dialog
*  SBMSOL.RelationalItemData  Functions for getting data related to a relational field
*  SBMSOL.FormUtil            Functions for modifying forms
*/

var SBMSOL = SBMSOL || {};

/* SBMSOL.Util
* ---------------------------------------------------------------
* Static object to hold utilities used by the SBM solutions.
* --------------------------------------------------------------*/
SBMSOL.Util = {

    /* SBMSOL.Util.Applicaitons
    * ---------------------------------------------------------------
    * List of SBM solution process apps and their uuid's
    * --------------------------------------------------------------*/
    Applications: {
        IncidentManagement: "5130dae1-d94d-4d16-a9da-e4bc5c88b57b",
        ChangeManagement: "8a317e79-5722-42ea-8ac1-271f7a5179c3",
        ProblemManagement: "17767bd8-8d27-4ff9-a6f1-0a56dca8f9dc",
        ConfigurationManagementSystem: "63e6df71-5b17-4eb8-9367-81aaa2bc3b7f",
        SSMIntegrations: "6298c123-8a07-4d52-bba9-b94ba9a2e540",
        ServiceRequest: "d2d1f029-753b-44b1-9c85-2898bc3177c5",
        KnowledgeManagement: "c1f2f84e-f822-40da-8d44-cf57775d89c6",
        StarterPack: "0dfa4980-c815-4c4d-be97-21de70564ab0",
        DemandPlan: "47ffe877-7605-4f76-9091-0d2aff4621b8",
        ReleaseTrain: "7622e3a0-570a-4d69-a2b4-0716c41428f2",
        ApplicationRelease: "a81f1631-5e0c-49c5-b04d-7a2f75d8b895",
        Approvals: "e560fdd7-1dd7-461f-80b1-3c574efaeabf",
        Environment: "8d2f8d52-fddb-4fc1-83a7-046fc27395c5",
        TurnOver: "f3e2355a-278d-4fd0-babd-8102a9514af8",
        Runbook: "2344d20-a5e5-4648-8296-e03772137651",
        EnvironmentSchedule: "84f266cd-dd00-44ac-9b8c-6a927698b336",
        DeploymentPath: "a0ca4e38-fbcd-4a99-b111-309e2bfb2030"
    },

    getDll: function () {
        var shell = SBMSOL.Util.getQueryParameterByName("shell");
        var dll = "tmtrack.dll?";

        if (shell.length > 0) {
            dll += "shell=" + shell + "&";
        }
        return dll;
    },

    // Checks if a process app is deployed and the current user has permission to 
    // view it.
    isAppDeployed: function (uuid) {
        var request = SBMSOL.Util.getDll() + "StdPage&template=shellapps";
        var result = false;

        jQuerySBM.ajax({
            url: request,
            dataType: 'json',
            async: false,
            success: function (json) {
                if (json.Applications) {
                    for (var i = 0; i < json.Applications.length; i++) {
                        if (json.Applications[i].uuid == uuid) {
                            result = true;
                            break;
                        }
                    }
                }
            }
        });
        return result;
    },

    getAllApps: function () {
        var request = SBMSOL.Util.getDll() + "StdPage&template=shellapps";
        var result = false;

        jQuerySBM.ajax({
            url: request,
            dataType: 'json',
            async: false,
            success: function (json) {
                result = json;
            }
        });

        return result;
    },

    getAppInfo: function (uuid, includeProjects) {
        includeProjects = (includeProjects === false) ? false : true;
        var appRequest = SBMSOL.Util.getDll() + "StdPage&template=shellapps";
        var result = { application: {}, projects: [] };

        jQuerySBM.ajax({
            url: appRequest,
            dataType: 'json',
            async: false,
            success: function (json) {
                if (json.Applications) {
                    for (var i = 0; i < json.Applications.length; i++) {
                        if (json.Applications[i].uuid == uuid) {
                            result.application = json.Applications[i];
                            break;
                        }
                    }
                }
            }
        });

        if (result.application.tableuuid && includeProjects) {
            result.projects = SBMSOL.Util.getProjects(result.application.tableuuid, result.application.uuid);
        }
        return result;
    },

    getProjects: function (tableUuid, solutionUuid) {
        var result = null;
        var projRequest = SBMSOL.Util.getDll() + "JSONPage&command=getprojects&tableuuid=" + tableUuid + "&solutionuuid=" + solutionUuid;

        jQuerySBM.ajax({
            url: projRequest,
            dataType: 'json',
            async: false,
            success: function (json) {
                if (json.result.projects) {
                    result = json.result.projects;
                }
            }
        });
        return result;
    },

    getStatesAndTransitions: function(projectId) {
        var result = null;
        var projRequest = SBMSOL.Util.getDll() + "JSONPage&command=getprojectstatestransitions&workflowId=NaN&projectId=" + projectId + "&showDeleted=0";
        
        jQuerySBM.ajax({
            url: projRequest,
            dataType: 'json',
            async: false,
            success: function (json) {
                if (json.result.projects) {
                    result = json.statesAndTransitions;
                }
            }
        });
        return result;
    },

    getSubmitInfo: function (projectName, tableUuid) {
        var request = SBMSOL.Util.getDll() + "JSONPage&Command=metadatasubmit&projectName=" + projectName + "&tableUUID=" + tableUuid;
        var result = null;

        jQuerySBM.ajax({
            url: request,
            dataType: 'json',
            async: false,
            success: function (json) {
                result = json;
            }
        });
        return result;
    },

    getQueryParameterByName: function (name) {
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
    },

    createCookie: function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    },

    readCookie: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    eraseCookie: function (name) {
        createCookie(name, "", -1);
    },

    loadCss: function (cssUri) {
        var head = jQuerySBM("head");
        head.append("<link rel='stylesheet' href=" + cssUri + ">");
    },

    loadJavaScript: function (scriptUri) {
        jQuerySBM.ajax({
            url: scriptUri,
            dataType: "script",
            async: false
        });
    },

    ssoToken: null,

    getSsoToken: function () {
        if (SBMSOL.Util.ssoToken == null || SBMSOL.Util.ssoToken == "") {
            jQuerySBM.ajax({
                url: SBMSOL.Util.getDll() + "JSONPage&Command=getssotoken",
                dataType: 'json',
                async: false,
                success: function (json) {
                    SBMSOL.Util.ssoToken = json.result.token;
                }
            });
        }
        return SBMSOL.Util.ssoToken;
    },

    formatString: function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }
        return s;
    },

    parseIssueId: function (issueId) {
        var id = "";
        for (var i = issueId.length - 1; i >= 0; i--) {
            if (jQuerySBM.isNumeric(issueId.charAt(i))) {
                id = issueId.charAt(i) + id;
            }
            else { break; }
        }
        return id;
    }
};

/* SBMSOL.Item
* ---------------------------------------------------------------
* Static object to hold utilities for manipulating SBM items
* --------------------------------------------------------------*/
SBMSOL.Item = {
    get: function (recordId, tableId, projectId, includeMetadata, callback) {
        projectId = (jQuerySBM.isNumeric(projectId)) ? projectId : 0;
        var metadata = (includeMetadata === true) ? 1 : 0;
        var request = SBMSOL.Util.getDll() + "JSONPage&Command=viewitem&projectid=" + projectId + "&recordid=" + recordId + "&tableid=" + tableId + "&metadata=" + metadata + "&avatars=0";
        var result = null;
        var hasCallback = jQuerySBM.isFunction(callback);

        jQuerySBM.ajax({
            url: request,
            dataType: 'json',
            async: hasCallback,
            success: function (json) {
                if (hasCallback) {
                    callback(json);
                }
                else {
                    result = json;
                }
            }
        });
        return result;
    },

    getFieldMetadata: function (metadata, fieldName) {
        for (var i = 0; i < metadata.length; i++) {
            if (metadata[i].dbname == fieldName || metadata[i].name == fieldName) {
                return metadata[i];
            }
        }
        return null;
    },

    createViewLink: function (itemId, tableId, linkStr, target) {
        target = (target == null || target == undefined || target == "") ? "_blank" : target;
        return "<a href='" + SBMSOL.Util.getDll() + "IssuePage&RecordId=" + itemId + "&Template=view&TableId=" + tableId + "' target='" + target + "'>" + linkStr + "</a>";
    },

    getTransitions: function (itemId, tableId, projectId, callback) {
        projectId = (jQuerySBM.isNumeric(projectId)) ? projectId : 0;
        var hasCallback = jQuerySBM.isFunction(callback);
        var result = null;
        var request = SBMSOL.Util.getDll() + "JSONPage&command=gettransitions&projectid=" + projectId + "&recordid=" + itemId + "&tableid=" + tableId;
        jQuerySBM.ajax({
            url: request,
            dataType: 'json',
            async: hasCallback,
            success: function (json) {
                result = json;

                if (hasCallback) {
                    callback(result);
                }
            }
        });
        return result; //transitions = result.result.transitions[]
    },

    del: function (itemId, tableId, projectId, callback) {
        return transition(itemId, tableId, projectId, 2, null, callback);
    },

    submit: function () {
        //http://orl-rpd-soldev/tmtrack/tmtrack.dll?JSONPage&Command=checkoutsubmit&flex=1&projectid=1&recordid=-1&tableid=1045&metadata=1&breaklock=1
    },
	
	submitCheckout: function(itemId, tableId, transitionId, projectId, includeMetadata, callback) {
		projectId = (jQuerySBM.isNumeric(projectId)) ? projectId : 0;
        var metadata = (includeMetadata === true) ? 1 : 0;
		//TODO: support transitionid or null
        var request = SBMSOL.Util.getDll() + "JSONPage&Command=checkoutsubmit&flex=1&projectid=" + projectId + "&recordid=" + itemId + "&tableid=" + tableId + "&metadata=" + metadata + "&breaklock=0"; //&transid=" + transitionId;
        var result = null;
        var hasCallback = jQuerySBM.isFunction(callback);
        jQuerySBM.ajax({
            url: request,
            dataType: 'json',
            async: hasCallback,
            success: function (json) {
                result = json;

                if (hasCallback) {
                    callback(result);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // TODO: handle error - do we need to unlock? probably not
            }
        });
        return result;
	},

    update: function (itemId, tableId, projectId, updateData, callback) {
        return transition(itemId, tableId, projectId, 1, updateData, callback);
    },

    transition: function (itemId, tableId, projectId, transitionId, updateData, callback) {
        projectId = (jQuerySBM.isNumeric(projectId)) ? projectId : 0;
        var hasCallback = jQuerySBM.isFunction(callback);
        var result = null;
        var checkinFunc = function (itemData) {
            var checkinData = SBMSOL.Item.createCheckinStructure(itemData);
            for (var name in itemData) {
                checkinData.items[0][name] = itemData[name];
            }
            SBMSOL.Item.checkin(itemData, callback);
        };
        var item = SBMSOL.Item.checkout(itemid, tableId, transitionId, projectId, 0, hasCallback ? checkinFunc : null);
        if (!hasCallback) {
            result = checkinFunc(item);
        }
        return result;
    },

    checkout: function (itemId, tableId, transitionId, projectId, includeMetadata, callback) {
        projectId = (jQuerySBM.isNumeric(projectId)) ? projectId : 0;
        var metadata = (includeMetadata === true) ? 1 : 0;
        var request = SBMSOL.Util.getDll() + "JSONPage&Command=checkoutitem&flex=1&projectid=" + projectId + "&recordid=" + itemId + "&tableid=" + tableId + "&metadata=" + metadata + "&breaklock=1&transid=" + transitionId;
        var result = null;
        var hasCallback = jQuerySBM.isFunction(callback);
        jQuerySBM.ajax({
            url: request,
            dataType: 'json',
            async: hasCallback,
            success: function (json) {
                result = json;
                if (hasCallback) {
                    callback(result);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // TODO: handle error - do we need to unlock? probably not
            }
        });
        return result; //recLockId = result.result.recLockId
    },

    getRequiredFields: function (checkoutItemData) {
        var md = checkoutItemData.result.metadata;
        var reqFlds = [];
        for (var i = 0; i < md.length; i++) {
            if (md[i].required === true) {
                reqFlds.push(md[i]);
            }
        }
        return reqFlds;
    },

    createCheckinStructure: function (checkoutItemData, isSubmit) {
        isSubmit = (isSubmit === true) ? true : false;
		var items = { "items": [{
				      "tableId": checkoutItemData.request.tableId,
				      "recordId": checkoutItemData.result.item.recordId,
				      "recLockId": checkoutItemData.result.item.recLockId,
				      "isSubmit": isSubmit,
				      "transId": (isSubmit) ? 0 : checkoutItemData.result.item.transId
				  }]
        };
        if (checkoutItemData.PROJECTID) {
            items[0].projectId = checkoutItemData.PROJECTID.id;
        }
        return items;
    },

    checkin: function (itemData, callback) {
        var request = SBMSOL.Util.getDll() + "JSONPage&Command=checkinitem&flex=1";
        var result = null;
        var hasCallback = jQuerySBM.isFunction(callback);
        if (jQuerySBM.type(itemData) !== "string") {
            itemData = JSON.stringify(itemData);
        }
        jQuerySBM.ajax({
            url: request,
            type: "POST",
            dataType: 'json',
            async: hasCallback,
            data: itemData,
            success: function (json) {
                result = json;
                if (hasCallback) {
                    callback(result);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // TODO: handle error - do we need to unlock? probably so
                SBMSOL.Item.unlock(itemData);
                if (hasCallback) {
                    callback(null);
                }
            }
        });
        return result; //recLockId = result.result.recLockId
    },

    checkinHasError: function (checkinResponse) {
        for (var i = 0; i < checkinResponse.results.length; i++) {
            if (checkinResponse.results[i].error) {
                return true;
            }
        }
        return false;
    },

    unlock: function (itemData, callback) {
        var request = SBMSOL.Util.getDll() + "JSONPage&Command=unlockitem&flex=1";
        var result = null;
        var hasCallback = jQuerySBM.isFunction(callback);
        if (jQuerySBM.type(itemData) !== "string") {
            itemData = JSON.stringify(itemData);
        }
        jQuerySBM.ajax({
            url: request,
            type: "POST",
            dataType: 'json',
            async: hasCallback,
            data: itemData,
            success: function (json) {
                result = json;
                if (hasCallback) {
                    callback(result);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // TODO: handle error
            }
        });
    }
};

/* SBMSOL.Item.Current
* ---------------------------------------------------------------
* Static object to hold utilities for working with a currently
* open SBM item
* --------------------------------------------------------------*/
SBMSOL.Item.Current = {

	 getTransitionButtonIds: function () {
	        var list = new Array();
	        jQuerySBM(":button, a").each(function () {
	            if (this.id === null || this.id === undefined) { return; }
	            var name = SBMSOL.Item.Current.lookupNameByFID(this.id);
	            var test = "get" + name + "TransitionID";
	            try {
	                var testFn = eval(test);
	                if (jQuerySBM.isFunction(testFn)) {
	                    list[list.length] = testFn();
	                }
	            }
	            catch (ex) {
	            }
	        });
	        return list;
    	},

	lookupNameByFID: function (fid) {
		if (aFieldLookup === null || aFieldLookup.Fields === null) {
			return fid;
		}
		// Look up by fid
		for (var i = 0; i < aFieldLookup.Fields.length; i++) {
			if (aFieldLookup.Fields[i].fid == fid) {
				return aFieldLookup.Fields[i].name;
			}
		}
		return fid;
	 },

	 performAction: function (url) {
	        if (url.indexOf("button:") === 0) {
	  		var button = document.getElementById(url.substring(7));
			if (button) { 
				button.click(); 
			}
		}
		else {
	  		attEdit(url, window);
		}
	 },

    getTransitionByName: function (name) {
        name = name.toLowerCase();
        for (var i = 0; i < aTransitionLookup.Transitions.length; i++) {
            var thisName = aTransitionLookup.Transitions[i].name.toLowerCase();
            if (name === thisName) {
                return aTransitionLookup.Transitions[i];
            }
        }
        return null;
    },

    getTransitionById: function (id) {
        for (var i = 0; i < aTransitionLookup.Transitions.length; i++) {
            if (id == aTransitionLookup.Transitions[i].tid) {
                return aTransitionLookup.Transitions[i];
            }
        }
        return null;
    },
	
	_pageSectionTypes: ["tab", "section"],	
	_pageSections: null,
	
	getPageSections: function () {
        var self=this;
		if(self._pageSections == null) {
			self._pageSections = [];
			for (var i = 0; i < aFieldLookup.Fields.length; i++) {
				var fldType = aFieldLookup.Fields[i].type;
				for(var j = 0; j < self._pageSectionTypes.length; j++) {
					if(fldType == self._pageSectionTypes[j]) {
						self._pageSections.push(aFieldLookup.Fields[i]);
						break;
					}
				}
			}
		}
		return self._pageSections;
	},
	
	getPageSection: function(sectionName) {
		sectionName = sectionName.toLowerCase();
		var sections = SBMSOL.Item.Current.getPageSections();
		for(var i = 0; i < sections.length; i++) {
			var thisName = sections[i].name.toLowerCase();
			if(thisName == sectionName) {
				return sections[i];
			}
		}
		return null;
	},
	
	hasStateChanged: function() {
		var currState = GetFieldValue("STATE");
		var itemData = SBMSOL.Item.get(sRecordId , sTableId, GetFieldValue("PROJECTID"), false, null);
		if(currState == itemData.result.item.STATE) { 
			return false;
		}
		else { 
			return true;
		}
	}
};


/* SBMSOL.Report
* ---------------------------------------------------------------
* Static object to hold utilities for calling SBM reports and
* working with the json data returned
* --------------------------------------------------------------*/
SBMSOL.Report = {
    // reportParams must be an array of {name: "paramName", value: "paramValue"}
    getJson: function (reportRef, reportParams, rowsOnly, callback, includeAll) {
        var result = null;
        var hasCallback = jQuerySBM.isFunction(callback);
        rowsOnly = (rowsOnly === true) ? true : false;
        includeAll = (includeAll === false) ? false : true;
        reportParams = (jQuerySBM.isArray(reportParams)) ? reportParams : [];
        var hasParams = (reportParams.length > 0) ? "1" : "0";

        var hasParam = function (params, name) {
            for (var i = 0; i < params.length; i++) {
                if (params[i].name.toLowerCase() == name.toLowerCase()) {
                    return true;
                }
            }

            return false;
        };

        if (includeAll === true && !hasParam(reportParams, "recno")) {
            reportParams.push({ name: "recno", value: "-1" });
        }

        var paramStr = "";
        for (var i = 0; i < reportParams.length; i++) {
            paramStr += "&" + reportParams[i].name + "=" + reportParams[i].value;
        }

        var request = SBMSOL.Util.getDll() + "ReportPage&template=reports%2Fjsonlist&ReportRef=" + reportRef + "&HasRuntimeParams=" + hasParams + paramStr;
        jQuerySBM.ajax({
            url: request,
            dataType: 'json',
            async: hasCallback,
            success: function (json) {
                if (rowsOnly) {
                    result = SBMSOL.Report.getRowsFromJsonList(json);
                }
                else {
                    result = json;
                }
                if (hasCallback) {
                    callback(result);
                }
            }
        });
        return result;
    },

    getRowsFromJsonList: function (jsonList) {
        var result = [];
        if (jsonList.results) {
            for (var i = 0; i < jsonList.results.length; i++) {
                var tempRows = jsonList.results[i].rows;
                // Add tableid to the rows
                for (var j = 0; j < tempRows.length; j++) {
                    tempRows[j].tableid = jsonList.results[i].tableid;
                }
                result = result.concat(tempRows);
            }
        }
        return result;
    }
};

/* SBMSOL.Dialog
* ---------------------------------------------------------------
*
*
* --------------------------------------------------------------*/
SBMSOL.Dialog = {
    Size: {
        Small: { width: "500", height: "400" },
        Medium: { width: "900", height: "600" },
        Large: { width: "1024", height: "768" },
        Full: { width: "100%", height: "100%" }
    },

    getDefaultSize: function () { return SBMSOL.Dialog.Size.Large; },
    redirectTemplate: "sbmsol%2Fdialogcomplete",
    //TODO: remove the shell param, replce with SBMSOL.Util.getDll()
    dll: SBMSOL.Util.getDll(),
	
    getTop: function () {
		return SBMSOL.Dialog;
		
		// This was breaking everything :)
		/*
        var p = parent;
        var sd = SBMSOL.Dialog;
        while (p != top) {
            if (p && p.SBMSOL && p.SBMSOL.Dialog) {
                sd = p.SBMSOL.Dialog;
            }
            p = p.parent;
        }
        return sd;
		*/
    },

    openTransition: function (itemId, tableId, projectId, transitionId, transitionName, sizeOption, closeFunction) {
        //TODO: make sure shell is on the dll, remove temp shell name
        var url = SBMSOL.Dialog.dll + "ViewForm&TransitionId." + transitionId + "=" + encodeURIComponent(transitionName) + "&ProjectId=" + projectId + "&RecordId=" + itemId + "&TableId=" + tableId + "&redirecttemplate=" + SBMSOL.Dialog.redirectTemplate;
        var titleText = transitionName;
        SBMSOL.Dialog.getTop().openDialog(url, titleText, sizeOption, closeFunction);
    },

    openDialog: function (url, titleText, sizeOption, closeFunction, scrollable, resizable) {
        SBMSOL.Dialog.getTop()._openDialog(url, titleText, sizeOption, closeFunction, scrollable, resizable);
    },

    _openDialog: function (url, titleText, sizeOption, closeFunction, scrollable, resizable) {
        if (!(sizeOption && sizeOption.width && sizeOption.height)) {
            sizeOption = SBMSOL.Dialog.getDefaultSize();
        }
		if (sizeOption.height > jQuerySBM(window).height()){sizeOption.height = '100%'}
        var classname = "sbm-dialog";
        if (!titleText) { 
			classname += " hidetitlebar";
		}
        var dlgHeight = (sizeOption.height == "100%") ? jQuerySBM(window).height() : sizeOption.height;
		var scrolling = scrollable ? "" : 'scrolling="no" style="overflow:hidden"';
        //add for resize
		var dlgResize = (resizable == "resizable") ? true : false;
        var dialog = jQuerySBM('<div id="sbmsolModalDialog" align="center"><iframe src="' + url + '" width="100%" frameborder="0" height="100%" ' + scrolling + '/></div>').dialog({
            position: "center",
            width: sizeOption.width,
            height: dlgHeight,
            dialogClass: classname,
            title: titleText,
            modal: true,
            resizable: dlgResize,
            draggable: true,
            show: 'fade',
            hide: 'fade',
            closeOnEscape: false,
            close: function (ev, x) {
                // Unbind resize event
                jQuerySBM(window).unbind('resize.sbm-dialog');
                // Remove the inner frame
                jQuerySBM(this).find("iframe").remove();
                // Remove the dialog elements
                jQuerySBM(this).dialog("destroy");
                // Remove the left over element (the original div element)
                jQuerySBM(this).remove();
            },
            open: function () { jQuerySBM("#sbmsolModalDialog").css("overflow", "hidden"); },
            buttons: {}
        });
		if (scrollable) {
			dialog.css("padding", 0);
		}
        dialog.data("closeFunction", closeFunction);
        // Perform cancel when clicking on the X
        jQuerySBM('.ui-dialog-titlebar-close').unbind("click").click(function () {
            var dlg = jQuerySBM('#sbmsolModalDialog');
            var frame = dlg.find("iframe:first");
            var formCalled = false;
            try {
                // try SBM form cancel
                if (formCalled == false && frame.length > 0 && frame[0].contentWindow.buttons.doForm) {
                    frame[0].contentWindow.buttons.doForm(2);
                    // Are we in an error message without a cancel button?
                    if (!frame[0].contentWindow.view.location.href.match(/template=err/i)) {
                        formCalled = true;
                    }
                }
            } catch (ex) { }
            if (formCalled == false) {
                SBMSOL.Dialog.getTop().closeDialog(false);
            }
            return false;
        });
    },

    closeDialog: function (result) {
        SBMSOL.Dialog.getTop()._closeDialog(result);
    },

    _closeDialog: function (result) {
        // result = true for OK and false for Cancel
        if (result == undefined) {
            result = true;
        }
        var dlg = jQuerySBM("#sbmsolModalDialog");
        var closeFunction = dlg.data('closeFunction');
        if (closeFunction && jQuerySBM.isFunction(closeFunction)) {
            closeFunction(result);
        }
        dlg.dialog("close");
    }
};
	   
/* SBMSOL.RelationalItemData
* ---------------------------------------------------------------
*
*
* --------------------------------------------------------------*/
SBMSOL.RelationalItemData = {
       getTwoLevel: function(recordId, tableId, projectId, relationalField, relationalFieldL2, targetField, callback){  
	            projectId = (jQuerySBM.isNumeric(projectId)) ? projectId : 0;
		var level2Item = SBMSOL.Item.get(recordId, tableId, projectId, true);
		var relatedFieldMetadataL2 = SBMSOL.Item.getFieldMetadata( level2Item.result.metadata, relationalField);
		var relatedFieldTableIdL2 = relatedFieldMetadataL2.relTableId;
		var relatedItems =  level2Item.result.item[relationalField];
               var hasCallback = jQuerySBM.isFunction(callback);
		
		if (relatedItems.length > 0) {	
			var fieldResult = SBMSOL.RelationalItemData.getArrayRelatedFieldValuesL2(relatedItems, targetField, relationalFieldL2, relatedFieldTableIdL2);
			 }
        else if (relatedItems.id > 0) {
			var fieldResult = SBMSOL.RelationalItemData.getArrayRelatedFieldValueL2(relatedItems, targetField, relationalFieldL2, relatedFieldTableIdL2);
		}			
		else if (relatedItems.length == 0) {
				var fieldResult = "";
		}	
		
		if (hasCallback) {
			callback(fieldResult);
		} 
		else {
			return fieldResult;
		}
	},
	   
     getOneLevel: function(recordId, tableId, projectId, relationalField, targetField, callback){  
	            projectId = (jQuerySBM.isNumeric(projectId)) ? projectId : 0;
		var appReleaseItem = SBMSOL.Item.get(recordId, tableId, projectId, true);
		var relatedFieldMetadata = SBMSOL.Item.getFieldMetadata( appReleaseItem.result.metadata, relationalField);
		var relatedFieldTableId = relatedFieldMetadata.relTableId;
		var relatedItems =  appReleaseItem.result.item[relationalField];
               var hasCallback = jQuerySBM.isFunction(callback);
		
		if (relatedItems.length > 1) {	 
			var fieldResult = SBMSOL.RelationalItemData.getArrayRelatedFieldValues(relatedItems, targetField, relatedFieldTableId);
			 }
        else if (relatedItems.length == 1) {
			var relationalItemResult = SBMSOL.Item.get(relatedItems[0].id, relatedFieldTableId, 0, false);
			var fieldResult = new Array();
			fieldResult[0] = relationalItemResult.result.item[targetField];
                                       }			
		else if (relatedItems.length == 0) {
			var fieldResult = "";
		}
        else if (relatedItems.id > 0) {
			var relationalItemResult = SBMSOL.Item.get(relatedItems.id, relatedFieldTableId, 0, false);
			var fieldResult = new Array();
			fieldResult[0] = relationalItemResult.result.item[targetField];
		}
		
		if (hasCallback) {
			callback(fieldResult);
		} 
		else {
			return fieldResult;
		}
	},
	   
	   getArrayRelatedFieldValuesL2: function (relatedItems, targetField, relationalFieldL2, relatedFieldTableIdL2) {
		var fieldDataArray = new Array();
          for (var i = 0; i < relatedItems.length; i++) {
			var relationalItemResultL2 = SBMSOL.Item.get(relatedItems[i].id, relatedFieldTableIdL2, 0, true);
			var relatedFieldMetadataL2 = SBMSOL.Item.getFieldMetadata( relationalItemResultL2.result.metadata, relationalFieldL2);
			var relatedFieldTableIdL3 = relatedFieldMetadataL2.relTableId;
			var relatedItemL3 =  relationalItemResultL2.result.item[relationalFieldL2];
				   //get the field in the related item, second level. Note that it doesn't support multi-relational at this time. 
			var relationalItemResultL3 = SBMSOL.Item.get(relatedItemL3.id, relatedFieldTableIdL3, 0, false);
			
				   if(relationalItemResultL3.result) {
				var targetFieldResult =  relationalItemResultL3.result.item[targetField];
				
				if (targetFieldResult != "") {
					fieldDataArray.push(targetFieldResult);
				} 
				   } else {
				//TODO?
			}				  
		}
		return fieldDataArray;		
	},
					
	  getArrayRelatedFieldValueL2: function (relatedItem, targetField, relationalFieldL2, relatedFieldTableIdL2) {
		var fieldDataArray = new Array();
		var relationalItemResultL2 = SBMSOL.Item.get(relatedItem.id, relatedFieldTableIdL2, 0, true);
		var relatedFieldMetadataL2 = SBMSOL.Item.getFieldMetadata( relationalItemResultL2.result.metadata, relationalFieldL2);
		var relatedFieldTableIdL3 = relatedFieldMetadataL2.relTableId;
		var relatedItemL3 =  relationalItemResultL2.result.item[relationalFieldL2];
				   //get the field in the related item, second level. Note that it doesn't support multi-relational at this time. 
		var relationalItemResultL3 = SBMSOL.Item.get(relatedItemL3.id, relatedFieldTableIdL3, 0, false);
		var targetFieldResult =  relationalItemResultL3.result.item[targetField];
		
		          //strip out non RA fields
		if (targetFieldResult != "") {
			fieldDataArray.push(targetFieldResult);
		} 
		return fieldDataArray;
	},

     getArrayRelatedFieldValues: function (relatedItems, targetField, relatedFieldTableId) {
		var fieldDataArray = new Array();
          for (var i = 0; i < relatedItems.length; i++) {
			var relationalItemResult = SBMSOL.Item.get(relatedItems[i].id, relatedFieldTableId, 0, false);
			var targetFieldResult =  relationalItemResult.result.item[targetField];
			
		          //strip out non RA fields
			if (targetFieldResult != "") {
				fieldDataArray.push(targetFieldResult);
			} 
		}
		return fieldDataArray;
         }
};
		   
/* SBMSOL.FormUtil
* ---------------------------------------------------------------
* Solution Design formatting for State and Transition
* forms and their content
* --------------------------------------------------------------*/
SBMSOL.FormUtil = { 

	BackgroundImage: "none",
	BackgroundColor: "rgba(255, 255, 255, 1)",
	FormPadding: "0 10px 10px 10px",
	DefaultFormWidth:"1200", //allowed 800, 1200, 100  // note(800 and 1200 is pixels, 100 is percent)
	cssPath: "./solutions/sbmsol/styles/sbmsol-style-1.0.css",
	cssLoaded: false,

	MoreActions: {
        	moreActionsInitialized: false,
        		setupMoreActions: function (name) {
            	var fid = LookupFieldId(name);
            	var $link = jQuerySBM("#" + fid);
            	var $contentwrapper = jQuerySBM("#contentwrapper");
            	var className = $link.attr('class');
			$link.addClass("moreActionsBtn"); //for clicking to work

            	$link.click(function () {
                		if (!SBMSOL.FormUtil.MoreActions.moreActionsInitialized) { 
				SBMSOL.FormUtil.MoreActions.initMoreActions(name, className); 
			}
                		var $pop = jQuerySBM("#moreActionsPop");
          		if ($pop.is(":visible")) {
          			 SBMSOL.FormUtil.MoreActions.hideMoreAction(); 
         		}
         		else {
                    $pop.stop(true, true).show();
         		}                                                   
         	});
	},

        showMoreAction: function () {
         	var $pop = jQuerySBM("#moreActionsPop");
            	$pop.stop(true, true).show();
        },

        hideMoreAction: function () {
           	var $pop = jQuerySBM("#moreActionsPop");
            	if ($pop.is(":visible")) {
                		$pop.stop(true, true).hide();
            	}
        },

        initMoreActions: function (name, className) {
			var fid = LookupFieldId(name);
			var $link = jQuerySBM("#" + fid);
			var $pop = jQuerySBM("<div id='moreActionsPop' class='moreActionsPop'></div>").appendTo($link.parent());
			var usedTids = SBMSOL.Item.Current.getTransitionButtonIds();
			var usedActions = []; //[ "attfile", "atturl", "attlink" ];

			var fragment = document.createDocumentFragment();
			// add transitions
			var actionCount = 0;
			if (aTransitionLookup) {
				jQuerySBM.each(aTransitionLookup.Transitions, function () {
					if (this.name === null) return;
					var tid = this.tid;
					if (jQuerySBM.inArray(tid, usedTids) != -1) return;
					var item = jQuerySBM('<a href="javascript:PerformTransition(\'TransitionId.' + tid + '\')">' + this.name + '</a>').addClass(className);
					//          var item = jQuerySBM('<a href="#">' + this.name + '</a>')
					//      .click(function() {
					//        PerformTransition("TransitionId."+tid);
					//        return false;
					//      })
					actionCount++;
					fragment.appendChild(item[0]);
				});
			}

			// add other actions
			if (actionCount > 0) {
				var separator = jQuerySBM('<hr/>');
				fragment.appendChild(separator[0]);
			}

			actionCount = 0;
			jQuerySBM("#AttAction option").each(function (index) {
				if (jQuerySBM(this).css('display') == 'none') { return; } // DEF238597
					var value = jQuerySBM(this).val();
					  if(value == "---") { return; } //DEF245778
					var findValue = "";
				var find = value.search(/&template=/i);
					if (find != -1) {
						var find2 = value.indexOf("&", find + 1);
						findValue = value.substring(find + 10, find2);
					}
					var foundValue = jQuerySBM.grep(usedActions, function (n) {
						return n == findValue;
					});
				if (foundValue.length > 0) { return; }
					var item = jQuerySBM('<a href="javascript:SBMSOL.Item.Current.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>').addClass(className);
				 //var item = jQuerySBM('<a href="#">' + jQuerySBM(this).text() + '</a>')
				 //.click(function() {
					//  PerformAction(value);
					//  return false;
				 //})
					actionCount++;
					fragment.appendChild(item[0]);
            	});
                  //for IE 9/10 bug not displaying above options
			try {
				$hiddenOpts.each(function (index) {    
					if (index === 0) { return; } // skip first option
					var value = jQuerySBM(this).val();
					if(value == "---") { return; }
												
					var findValue = "";
					var find = value.search(/&template=/i);
					if (find != -1) {
						var find2 = value.indexOf("&", find + 1);
						findValue = value.substring(find + 10, find2);
					}
					var foundValue = jQuerySBM.grep(usedActions, function (n) {
						return n == findValue;
					});
					if (foundValue.length > 0) { return; }
				var item = jQuerySBM('<a href="javascript:SBMSOL.Item.Current.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>').addClass(className);
				actionCount++;
				fragment.appendChild(item[0]);
			});
		}
		catch (err){}

			// add even more actions
			if (actionCount > 0) {
				var separator = jQuerySBM('<hr />');
				fragment.appendChild(separator[0]);
			}
           
         	// Removed Show Workflow link code & added to following action count --- ENH239841 
            	actionCount = 0;
           	jQuerySBM("a#refresh_view img, a#printable img,a#emaillink img,a img#copyurl, a#display_associated_workflow img, a#display_help img").each(function (index) {
				//if (index == 0) { return; } // skip first option
				 var anchor = jQuerySBM(this).parent();
				if (anchor.css('display') == 'none') { return; } // DEF238597
					var text = anchor.attr("title");
				 if (text === null || text.length === 0) {
						text = jQuerySBM(this).attr("title");
					}
					var href = anchor.attr("href");
					var item = jQuerySBM('<a href="' + href + '">' + text + '</a>').addClass(className);

					actionCount++;
					fragment.appendChild(item[0]);
			});

			$pop[0].appendChild(fragment);

           	$pop.click(function () {
                		$pop.hide(); // immediate
           	});

			$pop.mouseleave(function () {
				jQuerySBM(document).mouseup(function (e) {
							if (!$pop.is(e.target) // if the target of the click isn't the container...
							&& $pop.has(e.target).length === 0  // ... nor a descendant of the container
							   && !jQuerySBM('.moreActionsBtn').is(e.target)) //nor the button
						{
								$pop.hide(); // immediate
						}
					});
			});
			SBMSOL.FormUtil.MoreActions.moreActionsInitialized = true;
			}
    	},

	init: function () {
        if (!SBMSOL.FormUtil.cssLoaded) {
            SBMSOL.Util.loadCss(SBMSOL.FormUtil.cssPath);
            SBMSOL.FormUtil.cssLoaded = true;
        }
    }, 
		
	affixPanel: function (sectionControl, location, panelHeight ) {
                  jQuerySBM("body").append(jQuerySBM('#'+sectionControl));
                  if(location == "Top-Left") {
	        		 jQuerySBM('#'+sectionControl).css({'border-bottom-style': 'solid','border-bottom-width': '0px','border-bottom-color': 'gray', 'position': 'fixed', 'top': '8px', 'left': '0px', 'height': panelHeight});
	        }
	        else if(location == "Bottom-Left") {
	         	 jQuerySBM('#'+sectionControl).css({'border-bottom-style': 'solid','border-bottom-width': '0px','border-bottom-color': 'gray', 'position': 'fixed', 'bottom': '0px', 'left': '0px', 'height':panelHeight});
	        }
	        else if(location == "Top-Center") {
	        		 jQuerySBM('#'+sectionControl).css({'border-bottom-style': 'solid','border-bottom-width': '0px','border-bottom-color': 'gray', 'position': 'fixed', 'top': '8px', 'margin': 'auto 0px', 'height': panelHeight});
	        }
	        else if(location == "Bottom-Center") {
	          	jQuerySBM('#'+sectionControl).css({'border-bottom-style': 'solid','border-bottom-width': '0px','border-bottom-color': 'gray', 'position': 'fixed', 'bottom': '0px', 'margin': 'auto 0px', 'height':panelHeight});
	        }
	        else {
	          	return false;
	        }
    	},

		setFakeButton: function (imageControl) {
			var img = jQuerySBM('#'+imageControl);
			img.addClass('fakebutton');	
        },

		formatStateForm: function (alignment) {
			var mainTable = jQuerySBM("#StateHeaderPanel").parent().closest("table");
			if(alignment == "center") {
				mainTable.addClass("stateTableCenter");
			} 
			else if(alignment == "right") {
				mainTable.addClass("stateTableRight");
			}
			else {
				mainTable.addClass("stateTableLeft");
			}
			jQuerySBM(".dtFormat").each(function (index) {
				var theElement = jQuerySBM(this);
				theElement.addClass("dtFormatFixed");
				theElement.parent("td").attr("style","font-size: 0px ! important");
			});
			// show view in workcenter button in transition form if viewing in new tab
			 try {
			 if (top.location.href.indexOf('viewwrapper') > -1 ){
			jQuerySBM(top.document.body).find('#viewWrapperHeader').show() 
			 }
		 }
		 catch (err) {}
		},

		formatTransitionForm: function(alignment) {
			var mainTable = jQuerySBM("#ContentPanel").parent().closest("table");
			if(alignment == "center") {
				mainTable.addClass("transitionTableCenter");
			}
			else if(alignment == "right") {
				mainTable.addClass("transitionTableRight");
			}
			else {
				mainTable.addClass("transitionTableLeft");
			}
			jQuerySBM(".frmTxa").css({"resize":"vertical"});
			jQuerySBM("#PlannedStartLabel").addClass("boldLabelStyle");
			jQuerySBM("#PlannedEndLabel").addClass("boldLabelStyle");
			
				//jQuerySBM('body').css({"background": SBMSOL.FormUtil.BackgroundImage + " " + SBMSOL.FormUtil.BackgroundColor, "overflow-y":"overlay"});
			
			// prepends error message to the ContentPanel to allow the error message to scroll out of view
			jQuerySBM("#CustomErrorMsg").addClass("customErrorMsg").prependTo("#ContentPanel");
			jQuerySBM("#ErrorMsg").addClass("errorMsg").prependTo("#ContentPanel");
			
			// hide view in workcenter button in transition form if viewing in new tab
		 try {
			 if (top.location.href.indexOf('viewwrapper') > -1 ){
			jQuerySBM(top.document.body).find('#viewWrapperHeader').hide() 
			 }
		 }
		 catch (err) {}
        },

        affixToolbarToTop: function (panel, subButton, canButton) {
			jQuerySBM("#"+panel).addClass("transitionHeaderPanel");
        },

	// insert the following two lines below for a global modification of the expanders
	// 	.sectionLabelFirst {border: none !important;}\
	//	.contentSectionCustom {border: none !important;}\

	/*
            updateCSS: function() { 
            	var div = jQuerySBM("<div />", {
					html: '&shy;<style>#IdentificationPanel {border: 1px solid #c6c7c6;}\
					.moreActionsPop{border: 1px solid #D7D7D7; position: absolute;  background-color: white; display: none;  padding: 10px 15px;  z-index: 1000;}\
					.moreActionsPop a{white-space: nowrap;  display: block;}\
					.moreActionsPop a:hover {  text-decoration: underline;}\
					#contentwrapper {top: 0;bottom: 0;position: fixed;}\
					.SubheadingStyle hr{margin-bottom: 2px; margin-top:2px;color:lightgrey}\
					.SubheadingStyle {margin-top: 10px;}\
					</style>'
				}).appendTo("body");
				//add horizontal rule to SubheadingStyle
				jQuerySBM(".SubheadingStyle").append("<hr style=\"height:1px; background-color:#C6C7C6\">");
            },
	*/

	   setButtonColor: function (item, color) {
		/*"Any customer can have a car painted any colour that he wants so long as it is black." -Henry Ford*/
		if (color == "blue") {
			jQuerySBM("#"+item).addClass("blueButton");
		}
	   },

            isInShell: function (shellName) {
       		var shellNameStr = new String(shellName).toLowerCase();
		return SBMSOL.Util.getQueryParameterByName("shell") == shellNameStr;
    	  },

	   notInShell: function (shellArray) {
		return (jQuerySBM.inArray(SBMSOL.Util.getQueryParameterByName("shell"),shellArray)==-1);
	   },

   	  isInSrp: function () { return this.isInShell("srp"); },
    	  isInSdc: function () { return this.isInShell("sdc"); },
          isInSwc: function () { return this.isInShell("swc"); },

	//DO WE NEED THIS?
	isZoomedFrame: function () {
		return parent.InSBMFrameset && parent.zoomedFrame;
	},
	
	isInList: function (name, currUser) {
        var fieldValues = GetMultiListValues(name, false, true);
        if (fieldValues != false) {
            for (var i = 0; i < fieldValues.length; i++) {
                if (fieldValues[i] == currUser)
                { return true }
            }
        }
        return false;
    },
	
	addRemoveUsers: function (name, param, currUser, useDisplayNames) {
        if (useDisplayNames == true) {
            var fieldValues = GetMultiListValues(name, false, false);
        }
        else { 
			var fieldValues = GetMultiListValues(name, false, true); 
		}
        //Add user to list with names
        if (param && fieldValues != false) { 
			fieldValues[fieldValues.length] = currUser;
		}
        //Add user to empty list
        else if (param && fieldValues == false) { 
			fieldValues[0] = currUser;
		}
        //remove user from list with single user
        else if (param == false && fieldValues.length == 1) { 
			fieldValues[0] = "" ;
		}
        //remove user from list with multiple users
        else if (param == false && fieldValues.length > 1) {
            for (var i = 0; i < fieldValues.length; i++) {
                if (fieldValues[i] == currUser) { 
					fieldValues.splice(i, 1); 
				}
            }
        }
		
        if (useDisplayNames == true) {
            SetMultiListValues(name, fieldValues, false, false);
        }
        else { 
			SetMultiListValues(name, fieldValues, false, true);
		}
    },
	
	compareDateTimes: function (date1, date2, operator) {
		SBMSOL.FormUtil.formatDateTime(date1);
		SBMSOL.FormUtil.formatDateTime(date2);
		var date1Value = GetFieldValue(date1);
		var date2Value = GetFieldValue(date2);
		var subType = LookupFieldSubType( date1 );
		if (date1Value == null || date1Value == "" || date1Value == undefined) { return true }
		if (date2Value == null || date2Value == "" || date2Value == undefined) { return true }
		if (subType == "date"){
			date1Value.setHours(0,0,0,0);
			date2Value.setHours(0,0,0,0);
		}
		if (date1Value > date2Value) { return true; }
		else if (date1Value >= date2Value && operator == "equalorgreater") { return true; }
		else if (date1Value.valueOf() == 0) { return true; }
		else { return false; }
    },

    formatDateTime: function (name) {
        var dateValueInt = jQuerySBM(GetFieldByName(name)).val();
        if (IsFieldEmpty(name) && dateValueInt != "") {
            var parsedDateInt = parseDate(dateValueInt);
        }
        if (parsedDateInt != null) { 
			SetFieldValue(name, parsedDateInt, false);
		}
    },
	
	openTransitionFromActionControl: function (actionControl, sizeOption, closeFunction) {
        var tranId = window["get" + actionControl + "TransitionID"]();
        var tranData = SBMSOL.Item.Current.getTransitionById(tranId);

        SBMSOL.Dialog.openTransition(sRecordId, sTableId, GetInternalFieldValue("ProjectId", null), tranId, tranData.name, sizeOption, closeFunction);
    },
	
	getCurrentTemplate: function () {
        var template = SBMSOL.Util.getQueryParameterByName("template");
        return (template == null) ? "" : template.toLowerCase();
    },
 
    /*    - Submit form: newbody
          - Transition form: formbody
          - State form: view, quickview
    */
    getFormType: function () {
        var template = this.getCurrentTemplate();

        if (template === "newbody") {
            return "SUBMIT";
        }
        else if (template === "formbody") {
            return "TRANSITION";
        }
        else {
            return "STATE";
        }
    },
	
	setFormAlignment: function (alignment) {
		var formType = SBMSOL.FormUtil.getFormType();
		
		if (formType == "STATE") {
			SBMSOL.FormUtil.formatStateForm(alignment);
		}
		else {
			SBMSOL.FormUtil.formatTransitionForm(alignment);
		}
	},
    setFormWidth: function(formWidth) {
        SBMSOL.FormUtil.DefaultFormWidth = formWidth;
        var formType = SBMSOL.FormUtil.getFormType();
        if (formType =="STATE"){
            if (jQuerySBM("#StateHeaderPanel").parent().closest("table").hasClass("restricted1200")){
                jQuerySBM("#StateHeaderPanel").parent().closest("table").removeClass("restricted1200");
            }
            if (jQuerySBM("#StateHeaderPanel").parent().closest("table").hasClass("restricted800")){
                jQuerySBM("#StateHeaderPanel").parent().closest("table").removeClass("restricted800");
            }
            if (jQuerySBM("#StateHeaderPanel").parent().closest("table").hasClass("restricted100")){
                jQuerySBM("#StateHeaderPanel").parent().closest("table").removeClass("restricted100");
            }
            jQuerySBM("#StateHeaderPanel").parent().closest("table").addClass("restricted"+formWidth);
        }
        else {
            if (jQuerySBM("#ContentPanel").parent().closest("table").hasClass("restricted1200")){
                jQuerySBM("#ContentPanel").parent().closest("table").removeClass("restricted1200");
            }
            if (jQuerySBM("#ContentPanel").parent().closest("table").hasClass("restricted800")){
                jQuerySBM("#ContentPanel").parent().closest("table").removeClass("restricted800");
            }
            if (jQuerySBM("#ContentPanel").parent().closest("table").hasClass("restricted100")){
                jQuerySBM("#ContentPanel").parent().closest("table").removeClass("restricted100");
            }
            if (jQuerySBM("#TransitionHeaderPanel").hasClass("restricted1200")){
                jQuerySBM("#TransitionHeaderPanel").removeClass("restricted1200");
            }
            if (jQuerySBM("#TransitionHeaderPanel").hasClass("restricted800")){
                jQuerySBM("#TransitionHeaderPanel").removeClass("restricted800");
            }
            if (jQuerySBM("#TransitionHeaderPanel").hasClass("restricted100")){
                jQuerySBM("#TransitionHeaderPanel").removeClass("restricted100");
            }
            jQuerySBM("#ContentPanel").parent().closest("table").addClass("restricted"+formWidth);
            jQuerySBM("#TransitionHeaderPanel").addClass("restricted"+formWidth);
        }
        var width = parseInt(formWidth);
        jQuerySBM("#StateHeaderPanel").parent().closest("table").find("[src='images/t1x1.gif']").each(function(index, item){
            var element = jQuerySBM(item);
            if(parseInt(element.width()) > width){
                element.width(width - 1);
            }
        });
        jQuerySBM(".RteInnerImg").css("max-width", (formWidth - 200) + "px");
    },

	reportNavigation:function(){
		var toggle = document.getElementById("reportToggle");
		var table = document.createElement("table");
		var tbody = document.createElement("tbody");

		try {
			var cell = document.getElementById("backFromDD").parentNode;
			tbody.appendChild(cell);
		} 
		catch (__e) { }

		try {
			table.appendChild(tbody);
			toggle.appendChild(table);
		} 
		catch (__e) { }
	},
	
	stylizeExpander: function(sectionControl) {
		
		var section = SBMSOL.Item.Current.getPageSection(sectionControl);
		var sectionUUID = section.fid;
		var sectionString = "#Section" + sectionUUID;
		
		var sectionHeader = jQuerySBM(sectionString+"_header > div:first-child");
		sectionHeader.attr("style", "padding: 0px 4px; background-color: rgba(255, 255, 255, 0); border-radius: 0px; border-top: medium none ! important; border-left: medium none ! important; border-right: medium none ! important; border-bottom: 1px solid rgb(190, 190, 190) ! important;");
		
				
		/* not working right now...
		 * sectionHeader.removeAttr("style");
		 * sectionHeader.addClass("expanderHeaderNoBoarder");
		 */
		
		var sectionContainer = jQuerySBM(sectionString+"_container");
		sectionContainer.attr("style", "border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; background-color: rgba(255, 255, 255, 0); padding: 0px; border: medium none ! important;");		
		
		/* not working right now...
		 * sectionContainer.removeAttr("style");
		 * sectionContainer.addClass("expanderContainerNoBoarder");
		 */
	},	
	
	doAllCustomFormatting: function(actionControl, imageControl) {
		SBMSOL.FormUtil.init();
		
		var alignment = "center";
		if (SBMSOL.FormUtil.notInShell(["swc","srp"])) {
			alignment = "left";
		}
		else {
			alignment="center";
		}
		
		var formType = SBMSOL.FormUtil.getFormType();
		if (formType == "STATE") {
			SBMSOL.FormUtil.formatStateForm(alignment);
			if(actionControl) {
				SBMSOL.FormUtil.MoreActions.setupMoreActions(actionControl);
			}
			if(imageControl) {
				SBMSOL.FormUtil.setFakeButton(imageControl);
				jQuerySBM('#'+imageControl).attr("href","javascript:ReloadItem();")
			}
			SBMSOL.FormUtil.reportNavigation();
            SBMSOL.FormUtil.setFormWidth(SBMSOL.FormUtil.DefaultFormWidth);
		}
		else if (formType == "TRANSITION") {
			SBMSOL.FormUtil.formatTransitionForm(alignment);
			SBMSOL.FormUtil.affixToolbarToTop("TransitionHeaderPanel", "SubmitButton", "CancelButton");
			SBMSOL.FormUtil.setButtonColor("SubmitButton","blue");
            SBMSOL.FormUtil.setFormWidth(SBMSOL.FormUtil.DefaultFormWidth);
		}
		else {
			//SUBMIT
			SBMSOL.FormUtil.formatTransitionForm(alignment);
			SBMSOL.FormUtil.affixToolbarToTop("TransitionHeaderPanel", "SubmitButton", "CancelButton");
			jQuerySBM("#SubmitButton").html("Submit");
			SBMSOL.FormUtil.setButtonColor("SubmitButton","blue");
            SBMSOL.FormUtil.setFormWidth(SBMSOL.FormUtil.DefaultFormWidth);
		}
    }
};

var SBMSOL_UTIL_1_1_LOADED = true;