/* 
* Serena Orchestrated Ops v5.3 Common Utils
* Author & Copyright (c) 2017 Serena Software, Inc.
*
* Requires SBM 11.2 (jQuerySBM)
*
* NOTE: When updating SOO to a new version make sure to update the AssetRoot path
*/

var SOO = SOO || {};

// General Purpose Utilities
SOO.Util = {
    AssetRoot: "./sdd/",
    // This function Loads content into specified target(placeholder)
    Navigate: function (url, target, options) {
        var self = this;
        if (!target)
            target = "_new";
        if (target == "_top") {
            top.location.assign(url);

        } else if (target == "_blank" || target == "_new") {
            var win = window.open(url, target);
            return win;

        } else if (target == "_popup" || target == "popup") {
            var wsize = SOO.Util.getWindowSize(
                (options && options.window)
                    ? options.window
                    : window);
            var win = window.open(url, "popup", "menubar=1,toolbar=yes,resizable=1,width=" + wsize.width + ",height=" + wsize.height);
            return win;
        } else if (target == "replace") {

            document.location.replace(url);

        } else if (target) {
            var container = $(target);
            container.attr('src', url);
            return container;

        } else {
            document.location.assign(url);
        }
    },
    jsonscriptEncodeHtml: function (str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    getWindowSize: function (w) {
        if (!w)
            w = window;
        var winW = 630,
            winH = 460;
        if (w.document.body && w.document.body.offsetWidth) {
            winW = w.document.body.offsetWidth;
            winH = w.document.body.offsetHeight;
        }
        if (w.document.compatMode == 'CSS1Compat' && w.document.documentElement && w.document.documentElement.offsetWidth) {
            winW = w.document.documentElement.offsetWidth;
            winH = w.document.documentElement.offsetHeight;
        }
        if (w.window.innerWidth && w.window.innerHeight) {
            winW = w.window.innerWidth;
            winH = w.window.innerHeight;
        }
        return { width: winW, height: winH };
    },
    getDll: function () {
        var shell = SOO.Util.getQueryParameterByName("shell");
        var dll = "tmtrack.dll?";

        if (shell.length > 0) {
            dll += "shell=" + shell + "&";
        }
        return dll;
    },
  
    getQueryParameterByName: function (name) {
        name = name.toLowerCase();
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search.toLowerCase());

        if (results == null) {
            return "";
        } else {
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    },

    getTransitionButtonIds: function () {
        var list = new Array();

        jQuerySBM(":button, a").each(function () {
            if (this.id == null || this.id == undefined) { return; }
            var name = SOO.Util.lookupNameByFID(this.id);
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
        if (aFieldLookup == null || aFieldLookup.Fields == null) return fid;

        // Look up by fid
        for (var i = 0; i < aFieldLookup.Fields.length; i++) {
            if (aFieldLookup.Fields[i].fid == fid) {
                return aFieldLookup.Fields[i].name;
            }
        }

        return fid;
    },

    performAction: function (url) {
        if (url.indexOf("button:") == 0) {
            var button = document.getElementById(url.substring(7));
            if (button) {
                button.click(); 
            }
        } else if (url.indexOf('addToFolder') !== -1) {
            var data = url.split(':');
            if (data.length === 3) {
                var tableID = data[1];
                var recordID = data[2];
                SOO.Util.openAddToFolderPopup(tableID, recordID);
            }
        } else {
            attEdit(url, window);
        }
    },

    openAddToFolderPopup: function(tableID, recordID) {
        var view = {
            id: recordID,
            tableId: tableID,
            name: jQuerySBM('#itemID').text() + jQuerySBM('#itemDisplayName').text()
        };
        try {
            top.Serena.View.allViews.renderAddToFoldersMenu(view, top.Serena.Favorites.AddToFolders.Params.any('item'));
        } catch (e) {
            sbmlog.error('Exception occurred while trying to add item [tableID: ' + tableID +
                ', recordID: ' + recordID + '] to folder. Error: ' + e.messsage, 'openAddToFolderPopup');
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
        jQuerySBM("head").append("<link>");
        css = jQuerySBM("head").children(":last");
        css.attr({
            rel: "stylesheet",
            type: "text/css",
            href: cssUri
        });
    },

    loadCssAsset: function (fileName) {
        SOO.Util.loadCss(SOO.Util.AssetRoot + "css/" + fileName);
    },

    loadJavaScript: function (scriptUri) {
        jQuerySBM.ajax({
            url: scriptUri,
            dataType: "script",
            async: false
        });
    },

    loadJavaScriptAsset: function (scriptName) {
        SOO.Util.loadJavaScript(SOO.Util.AssetRoot + "js/" + scriptName);
    },

    sooToken: null,
    getSOOToken: function () {
        if (SOO.Util.sooToken != null && SOO.Util.sooToken != "") {
            jQuerySBM.ajax({
                url: "tmtrack.dll?JSONPage&Command=getssotoken",
                dataType: 'json',
                async: false,
                success: function (json) {
                    SOO.Util.sooToken = json.result.token;
                }
            });
        }

        return SOO.Util.sooToken;
    },

    getItemData: function (recordId, tableId, projectId, includeMetadata, callback) {
        var projectId = (jQuerySBM.isNumeric(projectId)) ? projectId : 0;
        var metadata = (includeMetadata === true) ? 1 : 0;
        var request = "tmtrack.dll?JSONPage&Command=viewitem&projectid=" + projectId + "&recordid=" + recordId + "&tableid=" + tableId + "&metadata=" + metadata + "&avatars=0";
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

    formatString: function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }

        return s;
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
    },


    // reportParams must be an array of {name: "paramName", value: "paramValue"}
    getReportJson: function (reportRef, reportParams, rowsOnly, callback) {
        var result = null;
        var hasCallback = jQuerySBM.isFunction(callback);
        rowsOnly = (rowsOnly === true) ? true : false;
        reportParams = (jQuerySBM.isArray(reportParams)) ? reportParams : [];
        var hasParams = (reportParams.length > 0) ? "1" : "0";
        var paramStr = "";

        for (var i = 0; i < reportParams.length; i++) {
            paramStr += "&" + reportParams[i].name + "=" + reportParams[i].value;
        }

        var request = "tmtrack.dll?ReportPage&template=reports%2Fjsonlist&ReportRef=" + reportRef + "&HasRuntimeParams=" + hasParams + paramStr;

        jQuerySBM.ajax({
            url: request,
            dataType: 'json',
            async: hasCallback,
            success: function (json) {
                if (rowsOnly) {
                    result = SOO.Util.getRowsFromJsonList(json);
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


    createViewItemLink: function (itemId, tableId, linkStr, target) {
        target = (target == null || target == undefined || target == "") ? "_blank" : target;

        return "<a href='tmtrack.dll?IssuePage&RecordId=" + itemId + "&Template=view&TableId=" + tableId + "' target='" + target + "'>" + linkStr + "</a>";
    }

};


SOO.Plugins = {
    RelationalGrid: {
        load: function() {
            //SOO.Util.loadCssAsset("soo.relationalGrid.css");
            SOO.Util.loadJavaScriptAsset("soo.relationalGrid.js");
        }
    },

    CITypeChooser: {
        load: function() {
            SOO.Util.loadJavaScriptAsset("soo.citypeChooser.js");
        }
    },
	
	ImpactAnalysis: {
        load: function () {
           // SOO.Util.loadCss("styles/shell/srp/theme/jquery-ui-1.8.24.custom.min.css");
           // SOO.Util.loadJavaScript("javascript/shell/common/jquery-ui-1.8.24.min.js");
			SOO.Util.loadCssAsset("soo.impactAnalysis.css");
            SOO.Util.loadJavaScriptAsset("soo.impactAnalysis.js");
        }
    },
	
    ImagePicker: {
        load: function () {
            SOO.Util.loadCss("styles/shell/srp/theme/jquery-ui-1.8.24.custom.min.css");
            SOO.Util.loadJavaScript("javascript/shell/common/jquery-ui-1.8.24.min.js");
            SOO.Util.loadJavaScriptAsset("imagepicker.js");
            SOO.Util.loadJavaScriptAsset("sbmmenu.js");
            SOO.Util.loadJavaScriptAsset("categoryimages.js");
        }
    }
};

// Shell Formatting & Manipulation Functions
SOO.ShellFormatting = {
    formType_Submit: "SUBMIT",
    formType_Transition: "TRANSITION",
    formType_State: "STATE",
    defaultHeaderSection: "MyHeader",
    defaultSidebarSection: "MySideBar",
    greyBorderColor: "#A5A5A5",
    greyBackgroundColor: "#F5F5F5",
    BackgroundImage: "none",
    BackgroundColor: "rgba(255, 255, 255, 1)",
    FormPadding: "0 10px 10px 10px",
    rootImagePath: SOO.Util.AssetRoot + "images/",
    cssPath: SOO.Util.AssetRoot + "css/sbmAppStyle.css",
    cssLoaded: false,

    init: function () {
        if (!SOO.ShellFormatting.cssLoaded) {
            //SOO.Util.loadCss(SOO.ShellFormatting.cssPath);
            SOO.ShellFormatting.cssLoaded = true;
        }
    },

    isInShell: function (shellName) {
        var shellNameStr = new String(shellName).toLowerCase();

        return SOO.Util.getQueryParameterByName("shell") == shellNameStr;
    },
    isInSrp: function () { return this.isInShell("srp"); },
    isInSdc: function () { return this.isInShell("sdc"); },
	   isInSwc: function () { return this.isInShell("swc"); },

    formatSOOForm: function () {
        SOO.ShellFormatting.init();

        var ft = this.getFormType();


        // Do standard formatting (all form types)
        // -------------------------------------------------------------
		
		//Update copyright info
		//jQuerySBM("#footerText, #copyrightText").text(SOO.ShellFormatting.copyrightText);

        // Remove the top spacing
        jQuerySBM("#contentTablex td:first, #SectionWrapper").css("font-size", "0px");

        //Set the shadow panels to the height of the form content
        //var fh = this.getFormHeight();

        //jQuerySBM('#ShadowPanel').parent().css("height", "" + fh);
        //jQuerySBM('#ShadowPanel_FormEdge').parent().css("height", "" + fh); //"100");

        jQuerySBM("[id$='GreyBorderStyle']").css("border", "1px solid " + this.greyBorderColor);


        //Style groupbox
        jQuerySBM("table[id$='GroupBox'] img[src$='tab_transparent_content_NE.gif']").attr("src", SOO.ShellFormatting.rootImagePath + "tab_transparent_content_NE.gif");
        jQuerySBM("table[id$='GroupBox'] img[src$='tab_transparent_content_NW.gif']").attr("src", SOO.ShellFormatting.rootImagePath + "tab_transparent_content_NW.gif");
        jQuerySBM("table[id$='GroupBox'] img[src$='tab_transparent_content_SE.gif']").attr("src", SOO.ShellFormatting.rootImagePath + "tab_transparent_content_SE.gif");
        jQuerySBM("table[id$='GroupBox'] img[src$='tab_transparent_content_SW.gif']").attr("src", SOO.ShellFormatting.rootImagePath + "tab_transparent_content_SW.gif");


        jQuerySBM('.multiselectborder td[nowrap]').attr("colspan", 3);
        jQuerySBM('.multiselectborder').attr("style", "width: 262px");
        jQuerySBM('.multiselectborder').css('background-color', this.greyBackgroundColor);
        //added to size UIP panel the same as multi-select items above
        jQuerySBM('#UIPpanel_GreyBorderStyle table').attr("style", "width: 262px");


        //jQuerySBM('#UIPPanel').css('border', '1px solid #C6C6C2');


        var buttonInt = jQuerySBM("a.SooButtonText")
        buttonInt.css("display", "block");
        buttonInt.css("width", "100%");
        buttonInt.css("line-height", buttonInt.parent('td').attr('height') + 'px');


        // DO type specific formatting
        // -------------------------------------------------------------

        if (ft === this.formType_Submit) { this.formatSOOSubmitForm(); }
        else if (ft === this.formType_Transition) { this.formatSOOTransitionForm(); }
        else if (ft === this.formType_State) { this.formatSOOStateForm(); }
        else {
            // Invalid form type
            throw new Error("Invalid form type detected: " + ft);
        }


        //Do the height formatting after a delay
        setTimeout(function () {
		 
            if (ft === SOO.ShellFormatting.formType_State) {
                var sfh = parseInt(jQuerySBM("#contentwrapper").height()) - 20;

                if (!SOO.ShellFormatting.isQuickView()) {
                    jQuerySBM("#" + SOO.ShellFormatting.defaultSidebarSection).css("height", sfh - parseInt(jQuerySBM("#StatePanel").height()));

                    
                    // This code caused very bad spacing issues when the tabs changed.
                    // If you insist on having the shadow on the edge you can put it back but
                    // I do not recommend it - Ryan 
                    //jQuerySBM('#ShadowPanel_FormEdge').parent().css("height", "" + sfh);

                    // Fix: DEF248398
                    var shadowPanel = jQuerySBM('#ShadowPanel_FormEdge');

                    //Remove the shadow
                    jQuerySBM("DIV", shadowPanel).css("background", "none");

                    //Add border
                    shadowPanel.parent().css("border-left", "solid 1px " + SOO.ShellFormatting.greyBorderColor);
                    
                    //End Fix
                     
                     // fix for big height in chrome 
					//	jQuerySBM('#contentTablex').css('overflow','hidden');
					// end fix
                    // double toggle fixes a sidebar alignment issue in IE
                    if (jQuerySBM.browser.msie) {
                        SOO.ShellFormatting.Sidebar.toggleSidebar();
                        SOO.ShellFormatting.Sidebar.toggleSidebar();
                    }
					if(this.resize){resize()}
                }
                else {
                    jQuerySBM('#ShadowPanel_FormEdge').hide();
                    jQuerySBM(".moreActionsBtn").hide();
					if(this.resize){resize()}
                }

                SOO.ShellFormatting.formatStatePanel();
            }
            else {
                /*
                // This code caused very bad spacing issues when the tabs changed.
                // If you insist on having the shadow on the edge you can put it back but
                // I do not recommend it - Ryan 
                var sw = document.getElementById("SectionWrapper");
                sw.style.height = "100%";

                var tfh = jQuerySBM(sw).height();
                jQuerySBM('#ShadowPanel_FormEdge').parent().css("height", "" + tfh);
                */

                //Fix: DEF248398
                var shadowPanel = jQuerySBM('#ShadowPanel_FormEdge');

                //Remove the shadow
                jQuerySBM("DIV", shadowPanel).css("background", "none");

                //Add border
                shadowPanel.parent().css("border-left", "solid 1px " + SOO.ShellFormatting.greyBorderColor);

                //End Fix
            }

        }, 1000);

    },

    formatSOOStateForm: function () {
        SOO.ShellFormatting.init();
		
		if(this.isInSwc() || this.isInSrp() || this.isInSdc()) {
			jQuerySBM("#contentTablex").addClass("centerFormStyle");
		}

        if (SOO.ShellFormatting.isQuickView()) {
            SOO.ShellFormatting.Sidebar.collapse(false, false);
            jQuerySBM("#SOO_formIconsNoZoom").hide();
            jQuerySBM("#SOO_formIconsWithZoom").hide();
        }
        else {
            SOO.ShellFormatting.Sidebar.setToDefaultState();

            //Hide/show correct zoom panel
            if (this.isZoomedFrame()) {
                jQuerySBM("#SOO_formIconsNoZoom").hide();
                jQuerySBM("#SOO_formIconsWithZoom").show();
            }
            else {
                jQuerySBM("#SOO_formIconsWithZoom").hide();
                jQuerySBM("#SOO_formIconsNoZoom").show();
            }
        }


        jQuerySBM("#myzoom").attr("href", "javascript:parent.zoomReport(" + name + ");");

        //hide the standard transition buttons, actions dropdown and report navigation
        
        //following no longer works with 10.1.2 
        // HideField("buttonsHeaderSection")
        jQuerySBM("#buttonsHeaderSection").hide();
        //Updating old line HideField("expandTop"), not sure if needed
         jQuerySBM("#expandTop").hide();



        // Size the state panel height
        SOO.ShellFormatting.formatStatePanel();

        // Add sidebar border
        jQuerySBM("#" + this.defaultSidebarSection).css({
            //"border-top": "solid 1px " + this.greyBorderColor,
            "border-right": "solid 1px " + this.greyBorderColor
        });


        var toggle = document.getElementById("reportToggle");
        var table = document.createElement("table");
        var tbody = document.createElement("tbody");

        try {
            var cell = document.getElementById("backFromDD").parentNode;
            tbody.appendChild(cell);
        } catch (__e) { }

        try {
            table.appendChild(tbody);
            toggle.appendChild(table);
        } catch (__e) { }


        //Set the pointer curser on the sidebar collapse/expand icons
        jQuerySBM("#Collapse_Icon, #Expand_Icon").css("cursor", "pointer");
    },

    formatStatePanel: function () {
        var statePanel = jQuerySBM("#StatePanel");
        statePanel.height(statePanel.parent().outerHeight());

        jQuerySBM("#" + SOO.ShellFormatting.Sidebar.expandedPanelName).width(jQuerySBM("#StatePanel").innerWidth() - 2);
        jQuerySBM("#StatePanel").width(jQuerySBM("#" + SOO.ShellFormatting.Sidebar.expandedPanelName).width() + 2);

    },

    formatSOOSubmitForm: function () {
        this.formatSOOTransitionForm(true);
    },

    formatSOOTransitionForm: function (isSubmit) {
        SOO.ShellFormatting.init();

        isSubmit = (isSubmit === true) ? true : false;
		
		if (this.isInSwc() || this.isInSrp() || this.isInSdc()) {
			var CME = jQuerySBM("#CustomErrorMsg");
			if(CME.next().is("table")) {
				CME.next().addClass("centerFormStyle");
			}
		}

        // Hide the header in srp because it the information is displayed in the src dialog
        if (this.isInSrp() || this.isInSdc()) {
            HideSection(this.defaultHeaderSection);
        }

        // Remove spell check icons
        jQuerySBM("img[src='images/spell.gif']").remove();

        // Hide the transition buttons frame
        // TODO: remove excess padding on the top of the frame
        var topFrameset = parent.document.getElementsByTagName("frameset");
        if(topFrameset.length > 0){
            if (isSubmit) { topFrameset[0].rows = "0,*"; }
            else { topFrameset[0].rows = "0,0,*"; }
        }

        // add padding to control styles (readonly fields)
        jQuerySBM("span.ControlStyle.rofld").css("padding-left", "5px");
    },

    getFormHeight: function () {
        // TODO: fix this function!!!
        return jQuerySBM("#contentwrapper").height() - 20; // jQuerySBM(document).height();
    },

    getCurrentTemplate: function () {
        var template = SOO.Util.getQueryParameterByName("template");
        return (template == null) ? "" : template.toLowerCase();
    },

    // Finds and returns the type of form that is currently loaded.
    //  - Uses the template to determin the form type, the templates are:
    //      - Submit form: newbody
    //      - Transition form: formbody
    //      - State form: view, quickview
    getFormType: function () {
        var template = this.getCurrentTemplate();

        if (template === "newbody") {
            return this.formType_Submit;
        }
        else if (template === "formbody") {
            return this.formType_Transition;
        }
        else {
            return this.formType_State;
        }
    },

    isQuickView: function () {
        return this.getCurrentTemplate() === "quickview";
    },

    isZoomedFrame: function () {
        return parentInSBMFrameset && parent.zoomedFrame;
    },

    Sidebar: {
        expandedPanelName: "Sidebar_Expanded",
        collapsedPanelName: "Sidebar_Collapsed",
        animationSpeed: 350,
        collapsedStateValue: "collapsed",
        expandedStateValue: "expanded",
        stateCookieName: "SOO_sidebarState",
        stateSaveDays: 1,

        getDefaultState: function () {
            var cookieVal = SOO.Util.readCookie(SOO.ShellFormatting.Sidebar.stateCookieName);

            //Default tp expanded
            return (cookieVal == SOO.ShellFormatting.Sidebar.collapsedStateValue) ? SOO.ShellFormatting.Sidebar.collapsedStateValue : SOO.ShellFormatting.Sidebar.expandedStateValue;
        },

        setToDefaultState: function () {
            if (SOO.ShellFormatting.Sidebar.getDefaultState() == SOO.ShellFormatting.Sidebar.collapsedStateValue) {
                SOO.ShellFormatting.Sidebar.collapse(false, false);
            }
            else {
                SOO.ShellFormatting.Sidebar.expand(false, false);
            }
        },

        toggleSidebar: function (blnAnimate, blnSaveState) {
            var blnAnimate = (blnAnimate === true) ? true : false;
            var blnSaveState = (blnSaveState === false) ? false : true;

            if (this.isExpanded()) {
                this.collapse(blnAnimate, blnSaveState);
            }
            else {
                this.expand(blnAnimate, blnSaveState);
            }

        },

        collapse: function (blnAnimate, blnSaveState) {
            var blnAnimate = (blnAnimate == true) ? true : false;
            var blnSaveState = (blnSaveState === false) ? false : true;

            if (blnAnimate) {
                jQuerySBM("#" + SOO.ShellFormatting.Sidebar.expandedPanelName).hide("slide", {}, SOO.ShellFormatting.Sidebar.animationSpeed);
                jQuerySBM("#" + SOO.ShellFormatting.Sidebar.collapsedPanelName).show("slide", {}, SOO.ShellFormatting.Sidebar.animationSpeed);
            }
            else {
                jQuerySBM("#" + SOO.ShellFormatting.Sidebar.expandedPanelName).hide(0, SOO.ShellFormatting.formatStatePanel);
                jQuerySBM("#" + SOO.ShellFormatting.Sidebar.collapsedPanelName).show(0, SOO.ShellFormatting.formatStatePanel);
            }

            if (blnSaveState) {
                SOO.Util.createCookie(SOO.ShellFormatting.Sidebar.stateCookieName, SOO.ShellFormatting.Sidebar.collapsedStateValue, SOO.ShellFormatting.Sidebar.stateSaveDays);
            }
        },

        expand: function (blnAnimate, blnSaveState) {
            var blnAnimate = (blnAnimate == true) ? true : false;
            var blnSaveState = (blnSaveState === false) ? false : true;

            if (blnAnimate) {
                jQuerySBM("#" + SOO.ShellFormatting.Sidebar.collapsedPanelName).hide();
                jQuerySBM("#" + SOO.ShellFormatting.Sidebar.expandedPanelName).show("slide", {}, SOO.ShellFormatting.Sidebar.animationSpeed);
                //jQuerySBM("#" + SOO.ShellFormatting.Sidebar.collapsedPanelName).hide("slide", {}, SOO.ShellFormatting.Sidebar.animationSpeed);
            }
            else {
                jQuerySBM("#" + SOO.ShellFormatting.Sidebar.expandedPanelName).show(0, SOO.ShellFormatting.formatStatePanel);
                jQuerySBM("#" + SOO.ShellFormatting.Sidebar.collapsedPanelName).hide(0, SOO.ShellFormatting.formatStatePanel);
            }

            if (blnSaveState) {
                SOO.Util.createCookie(SOO.ShellFormatting.Sidebar.stateCookieName, SOO.ShellFormatting.Sidebar.expandedStateValue, SOO.ShellFormatting.Sidebar.stateSaveDays);
            }
        },

        isExpanded: function () {
            return jQuerySBM("#" + this.expandedPanelName).is(":visible");
        }
    },
 MoreActions: {
          moreActionsInitialized: false,
          setupMoreActions: function (name) {
              SOO.ShellFormatting.init();

              var fid = LookupFieldId(name);
              var $link = jQuerySBM("#" + fid)
              var $contentwrapper = jQuerySBM("#contentwrapper");
              var className = $link.attr('class');
              $link.addClass("moreActionsBtn");

              $link.mouseenter(function () {
                  if (!SOO.ShellFormatting.MoreActions.moreActionsInitialized) { SOO.ShellFormatting.MoreActions.initMoreActions(name, className); }
                  var $pop = jQuerySBM("#moreActionsPop");
                  var pos = $link.position();
                  var width = $link.width();
                  var scrollY = $contentwrapper.scrollTop();
                  var scrollX = $contentwrapper.scrollLeft();
                  $pop.css({ "left": (pos.left + width + scrollX - 1) + "px", "top": (pos.top + scrollY) + "px" }).stop(true, true).show();
              });
              $link.mouseleave(function () {
                  SOO.ShellFormatting.MoreActions.hideMoreAction();
              })
          },

          showMoreAction: function () {
              var $pop = jQuerySBM("#moreActionsPop");
              $pop.stop(true, true).show();
          },

          hideMoreAction: function () {
              var $pop = jQuerySBM("#moreActionsPop");
              if ($pop.is(":visible")) {
                  $pop.stop(true, true).fadeOut(1000);
              }
          },

          initMoreActions: function (name, className) {
              var fid = LookupFieldId(name);
              var $link = jQuerySBM("#" + fid);
              var $pop = jQuerySBM("<div id='moreActionsPop' class='moreActionsPop'></div>").appendTo($link.parent());
              var usedTids = SOO.Util.getTransitionButtonIds();
              var usedActions = []; //[ "attfile", "atturl", "attlink" ];

              var fragment = document.createDocumentFragment();

              // add transitions
              var actionCount = 0;
              if (aTransitionLookup) {
                  jQuerySBM.each(aTransitionLookup.Transitions, function () {
                      if (this.name == null) return;
                      var tid = this.tid;
                      if (jQuerySBM.inArray(tid, usedTids) != -1) return;
                      var item = jQuerySBM('<a href="javascript:PerformTransition(\'TransitionId.' + tid + '\')">' + this.name + '</a>')
        .addClass(className)
                      //	  var item = jQuerySBM('<a href="#">' + this.name + '</a>')
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
                  //if (index == 0) return; // skip first option
                  if (jQuerySBM(this).css('display') == 'none') return; // DEF238597
                  var value = jQuerySBM(this).val();
  				if(value === "---" || value === "") { return; } //DEF245778
                  var findValue = "";
                  var find = value.search(/&template=/i);
                  if (find != -1) {
                      var find2 = value.indexOf("&", find + 1);
                      findValue = value.substring(find + 10, find2);
                  }
                  var foundValue = jQuerySBM.grep(usedActions, function (n) {
                      return n == findValue;
                  });
                  if (foundValue.length > 0) return;
                  var item = jQuerySBM('<a href="javascript:SOO.Util.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>')
      .addClass(className)
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

  				//if (index == 0) return; // skip first option
                  var value = jQuerySBM(this).val();
  				if(value === "---" || value === "") { return; }

                  var findValue = "";
                  var find = value.search(/&template=/i);
                  if (find != -1) {
                      var find2 = value.indexOf("&", find + 1);
                      findValue = value.substring(find + 10, find2);
                  }
                  var foundValue = jQuerySBM.grep(usedActions, function (n) {
                      return n == findValue;
                  });
                  if (foundValue.length > 0) return;
                  var item = jQuerySBM('<a href="javascript:SBMSOL.Item.Current.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>')
      .addClass(className)
                  actionCount++;
                  fragment.appendChild(item[0]);
              });}
  			catch (err){}

              // add even more actions
              if (actionCount > 0) {
                  var separator = jQuerySBM('<hr/>');
                  fragment.appendChild(separator[0]);
              }

           // Removed Show Workflow link code & added to following action count --- ENH239841


              actionCount = 0;
             jQuerySBM("a#refresh_view img, a#printable img,a#emaillink img,a img#copyurl, a#display_associated_workflow img, a#display_help img").each(function (index) {
                  //if (index == 0) return; // skip first option
                  var anchor = jQuerySBM(this).parent();
                  if (anchor.css('display') == 'none') return; // DEF238597
                  var text = anchor.attr("title");
                  if (text == null || text.length == 0) {
                      text = jQuerySBM(this).attr("title");
                  }
                  var href = anchor.attr("href");
                  var item = jQuerySBM('<a href="' + href + '">' + text + '</a>')
      .addClass(className)
                  //.click(function() {
                  //  alert('do action: ' + href);
                  //  return false;
                  //})
                  actionCount++;
                  fragment.appendChild(item[0]);
              });

              $pop[0].appendChild(fragment);

              $pop.click(function () {
                  $pop.hide(); // immediate
              });

              $pop.mouseenter(function () {
                  SOO.ShellFormatting.MoreActions.showMoreAction(); // show
              });

              $pop.mouseleave(function () {
                  SOO.ShellFormatting.MoreActions.hideMoreAction(); // fade
              });

              SOO.ShellFormatting.MoreActions.moreActionsInitialized = true;
          }

      }, //MoreActions

  MoreActionsE: {
    moreActionsInitialized: false,
    setupMoreActions: function (name) {
      SOO.ShellFormatting.init();

      var fid = LookupFieldId(name);
      var $link = jQuerySBM("#" + fid)
      var $contentwrapper = jQuerySBM("#contentwrapper");
      var className = $link.attr('class');
      $link.addClass("moreActionsBtn");
      
      $link.mouseenter(function() {
          if (!SOO.ShellFormatting.MoreActions.moreActionsInitialized) { SOO.ShellFormatting.MoreActions.initMoreActions(name, className); }
          var $pop = jQuerySBM("#moreActionsPop");
          var pos = $link.position();
          var width = $link.width();
          var scrollY = $contentwrapper.scrollTop();
          var scrollX = $contentwrapper.scrollLeft();
          $pop.css({ "left": (pos.left + width + scrollX + 18) + "px", "top": (pos.top + scrollY) + "px" }).stop(true, true).show();
      }); 
/**
      $link.mouseenter(function () {
        if (!SOO.ShellFormatting.MoreActions.moreActionsInitialized) {
          SOO.ShellFormatting.MoreActions.initMoreActions(name, className);
        }
        var $pop = jQuerySBM("#moreActionsPop");
        var pos = $link.position();
        var width = $link.width();
        var scrollY = $contentwrapper.scrollTop();
        var scrollX = $contentwrapper.scrollLeft();

        var rightedge = document.body.clientWidth - event.clientX;
        var bottomedge = document.body.clientHeight - event.clientY;
        var menuobj = document.getElementById("moreActionsPop");
        //Find out how close the mouse is to the corner of the window
        var left =
          document.body.scrollLeft + event.clientX - menuobj.contentwidth;
        if (rightedge < menuobj.contentwidth) {
          left = document.body.scrollLeft + event.clientX;
        }
        var top =
          document.body.scrollTop + event.clientX - menuobj.contentheight;
        if (bottomedge < menuobj.contentheight) {
          top = document.body.scrollTop + event.clientY;
        }
        $pop
          .css({
            left: left,
            top: top
          })
          .stop(true, true)
          .show();
      });
**/
      $link.mouseleave(function () {
        SOO.ShellFormatting.MoreActions.hideMoreAction();
      })
    },

    showMoreAction: function () {
      var $pop = jQuerySBM("#moreActionsPop");
      $pop.stop(true, true).show();
    },

    hideMoreAction: function () {
      var $pop = jQuerySBM("#moreActionsPop");
      if ($pop.is(":visible")) {
        $pop.stop(true, true).fadeOut(1000);
      }
    },

    initMoreActions: function (name, className) {
      var fid = LookupFieldId(name);
      var $link = jQuerySBM("#" + fid);
      var $pop = jQuerySBM("<div id='moreActionsPop' class='moreActionsPop'></div>").appendTo($link.parent());
      var usedTids = SOO.Util.getTransitionButtonIds();
      var usedActions = []; //[ "attfile", "atturl", "attlink" ];

      var fragment = document.createDocumentFragment();

      // add transitions
      var actionCount = 0;
      if (aTransitionLookup) {
        jQuerySBM.each(aTransitionLookup.Transitions, function () {
          if (this.name == null) return;
          var tid = this.tid;
          if (jQuerySBM.inArray(tid, usedTids) != -1) return;
          var item = jQuerySBM('<a href="javascript:PerformTransition(\'TransitionId.' + tid + '\')">' + this.name + '</a>')
            .addClass(className)
          //	  var item = jQuerySBM('<a href="#">' + this.name + '</a>')
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
        //if (index == 0) return; // skip first option
        if (jQuerySBM(this).css('display') == 'none') return; // DEF238597
        var value = jQuerySBM(this).val();
        if (value === "---" || value === "") {
          return;
        } //DEF245778
        var findValue = "";
        var find = value.search(/&template=/i);
        if (find != -1) {
          var find2 = value.indexOf("&", find + 1);
          findValue = value.substring(find + 10, find2);
        }
        var foundValue = jQuerySBM.grep(usedActions, function (n) {
          return n == findValue;
        });
        if (foundValue.length > 0) return;
        var item = jQuerySBM('<a href="javascript:SOO.Util.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>')
          .addClass(className)
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

          //if (index == 0) return; // skip first option
          var value = jQuerySBM(this).val();
          if (value === "---" || value === "") {
            return;
          }

          var findValue = "";
          var find = value.search(/&template=/i);
          if (find != -1) {
            var find2 = value.indexOf("&", find + 1);
            findValue = value.substring(find + 10, find2);
          }
          var foundValue = jQuerySBM.grep(usedActions, function (n) {
            return n == findValue;
          });
          if (foundValue.length > 0) return;
          var item = jQuerySBM('<a href="javascript:SBMSOL.Item.Current.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>')
            .addClass(className)
          actionCount++;
          fragment.appendChild(item[0]);
        });
      } catch (err) {}

      // add even more actions
      if (actionCount > 0) {
        var separator = jQuerySBM('<hr/>');
        fragment.appendChild(separator[0]);
      }

      // Removed Show Workflow link code & added to following action count --- ENH239841 


      actionCount = 0;
      jQuerySBM("a#refresh_view img, a#printable img,a#emaillink img,a img#copyurl, a#display_associated_workflow img, a#display_help img").each(function (index) {
        //if (index == 0) return; // skip first option
        var anchor = jQuerySBM(this).parent();
        if (anchor.css('display') == 'none') return; // DEF238597
        var text = anchor.attr("title");
        if (text == null || text.length == 0) {
          text = jQuerySBM(this).attr("title");
        }
        var href = anchor.attr("href");
        var item = jQuerySBM('<a href="' + href + '">' + text + '</a>')
          .addClass(className)
        //.click(function() {
        //  alert('do action: ' + href);
        //  return false;
        //})
        actionCount++;
        fragment.appendChild(item[0]);
      });

      $pop[0].appendChild(fragment);

      $pop.click(function () {
        $pop.hide(); // immediate
      });

      $pop.mouseenter(function () {
        SOO.ShellFormatting.MoreActions.showMoreAction(); // show
      });

      $pop.mouseleave(function () {
        SOO.ShellFormatting.MoreActions.hideMoreAction(); // fade
      });

      SOO.ShellFormatting.MoreActions.moreActionsInitialized = true;
    }

  }, //MoreActions


ZMoreActions: {
moreActionsInitialized: false,
setupMoreActions: function (name) {
SOO.ShellFormatting.init();
var fid = LookupFieldId(name);
var $link = jQuerySBM("#" + fid)
var $contentwrapper = jQuerySBM("#contentwrapper");
var className = $link.attr('class');
$link.addClass("moreActionsBtn");
$link.mouseenter(function () {
if (!SOO.ShellFormatting.MoreActions.moreActionsInitialized) { SOO.ShellFormatting.MoreActions.initMoreActions(name, className); }
var $pop = jQuerySBM("#moreActionsPop");
var pos = $link.position();
var width = $link.width();
var scrollY = $contentwrapper.scrollTop();
var scrollX = $contentwrapper.scrollLeft();
$pop.css({ "left": ((pos.left + scrollX + width) - $pop.width() + 17) + "px", "top": (pos.top + scrollY + 31) + "px" }).stop(true, true).show();
});
$link.mouseleave(function () {
SOO.ShellFormatting.MoreActions.hideMoreAction();
})
},
showMoreAction: function () {
var $pop = jQuerySBM("#moreActionsPop");
$pop.stop(true, true).show();
},
hideMoreAction: function () {
var $pop = jQuerySBM("#moreActionsPop");
if ($pop.is(":visible")) {
$pop.stop(true, true).fadeOut(1000);
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
                var _closeFunc = function(result) {
                        if(result === true) {
                            ReloadItem();
                        }
                    };
jQuerySBM.each(aTransitionLookup.Transitions, function () {
if (this.name == null) return;
var tid = this.tid;
                    var theName = this.name;
if (jQuerySBM.inArray(tid, usedTids) != -1) return;
//var item = jQuerySBM('<a href="javascript:PerformTransition(\'TransitionId.' + tid + '\')">' + this.name + '</a>').addClass(className);


                    //var item = jQuerySBM('<a href="#">' + this.name + '</a>').addClass(className);
                    //item.click(function() {
                    //  SBMSOL.Dialog.openTransition(sRecordId, sTableId, GetInternalFieldValue("ProjectId", null), tid, theName, SBMSOL.Dialog.Size.Medium, _closeFunc);
                    //});
     var item = jQuerySBM('<a href="#">' + this.name + '</a>')
.click(function() {
PerformTransition("TransitionId."+tid);
return false;
});
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
if (index == 0) return; // skip first option
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
if (foundValue.length > 0) return;
var item = jQuerySBM('<a href="javascript:SBMSOL.Item.Current.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>')
.addClass(className)
//var item = jQuerySBM('<a href="#">' + jQuerySBM(this).text() + '</a>')
//.click(function() {
// PerformAction(value);
// return false;
//})
actionCount++;
fragment.appendChild(item[0]);
});
// add even more actions
if (actionCount > 0) {
var separator = jQuerySBM('<hr/>');
fragment.appendChild(separator[0]);
}
            /*
            // show form reload
            launchActionControl('refresh_view');
// add Show Workflow link
var projectIdInt = GetInternalFieldValue("ProjectId", null)
if (projectIdInt != null && projectIdInt != undefined && projectIdInt != 1) {
var titleWorkflow = "Show Workflow";
var item = jQuerySBM('<a href="#" onclick="launchActionControl(\'display_associated_workflow\')">' + titleWorkflow + '</a>')
.addClass(className)
fragment.appendChild(item[0]);
}
            */

actionCount = 0;
jQuerySBM("a#refresh_view img, a#printable img,a#emaillink img,a img#copyurl, a#display_associated_workflow img, a#display_help img").each(function (index) {
//if (index == 0) return; // skip first option
var anchor = jQuerySBM(this).parent();
var text = anchor.attr("title");
if (text == null || text.length == 0) {
text = jQuerySBM(this).attr("title");
}
var href = anchor.attr("href");
var item = jQuerySBM('<a href="' + href + '">' + text + '</a>')
.addClass(className)
//.click(function() {
// alert('do action: ' + href);
// return false;
//})
actionCount++;
fragment.appendChild(item[0]);
});
$pop[0].appendChild(fragment);
$pop.click(function () {
$pop.hide(); // immediate
});
$pop.mouseenter(function () {
SOO.ShellFormatting.MoreActions.showMoreAction(); // show
});
$pop.mouseleave(function () {
SOO.ShellFormatting.MoreActions.hideMoreAction(); // fade
});
SOO.ShellFormatting.MoreActions.moreActionsInitialized = true;
}
}, //MoreActions

  MoreActions2: {
    moreActionsInitialized: false,
    setupMoreActions: function(name) {
      SOO.ShellFormatting.init();
      var fid = LookupFieldId(name);
      var $link = jQuerySBM("#" + fid);
      var $contentwrapper = jQuerySBM("#contentwrapper");
      var className = $link.attr('class');
      $link.addClass("moreActionsBtn"); //for clicking to work

      $link.click(function() {
        if (!SOO.ShellFormatting.MoreActions.moreActionsInitialized) {
          SOO.ShellFormatting.MoreActions.initMoreActions(name, className);
        }
        var $pop = jQuerySBM("#moreActionsPop");
        if ($pop.is(":visible")) {
          SOO.ShellFormatting.MoreActions.hideMoreAction();
        } else {
          $pop.stop(true, true).show();
        }
      });
    },

    showMoreAction: function() {
      var $pop = jQuerySBM("#moreActionsPop");
      $pop.stop(true, true).show();
    },

    hideMoreAction: function() {
      var $pop = jQuerySBM("#moreActionsPop");
      if ($pop.is(":visible")) {
        $pop.stop(true, true).hide();
      }
    },

    initMoreActions: function(name, className) {
      var fid = LookupFieldId(name);
      var $link = jQuerySBM("#" + fid);
      var $pop = jQuerySBM("<div id='moreActionsPop' class='moreActionsPop'></div>").appendTo($link.parent());
      var usedTids = SOO.Util.getTransitionButtonIds();
      var usedActions = []; //[ "attfile", "atturl", "attlink" ];

      var fragment = document.createDocumentFragment();
      // add transitions
      var actionCount = 0;
      if (aTransitionLookup) {
        jQuerySBM.each(aTransitionLookup.Transitions, function() {
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
      jQuerySBM("#AttAction option").each(function(index) {
        if (jQuerySBM(this).css('display') == 'none') {
          return;
        } // DEF238597
        var value = jQuerySBM(this).val();
        if (value == "---") {
          return;
        } //DEF245778
        var findValue = "";
        var find = value.search(/&template=/i);
        if (find != -1) {
          var find2 = value.indexOf("&", find + 1);
          findValue = value.substring(find + 10, find2);
        }
        var foundValue = jQuerySBM.grep(usedActions, function(n) {
          return n == findValue;
        });
        if (foundValue.length > 0) {
          return;
        }
        var item = jQuerySBM('<a href="javascript:SOO.Util.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>').addClass(className);
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
        $hiddenOpts.each(function(index) {
          if (index === 0) {
            return;
          } // skip first option
          var value = jQuerySBM(this).val();
          if (value == "---") {
            return;
          }

          var findValue = "";
          var find = value.search(/&template=/i);
          if (find != -1) {
            var find2 = value.indexOf("&", find + 1);
            findValue = value.substring(find + 10, find2);
          }
          var foundValue = jQuerySBM.grep(usedActions, function(n) {
            return n == findValue;
          });
          if (foundValue.length > 0) {
            return;
          }
          var item = jQuerySBM('<a href="javascript:SOO.Item.Current.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>').addClass(className);
          actionCount++;
          fragment.appendChild(item[0]);
        });
      } catch (err) {}

      // add even more actions
      if (actionCount > 0) {
        var separator = jQuerySBM('<hr />');
        fragment.appendChild(separator[0]);
      }

      // Removed Show Workflow link code & added to following action count --- ENH239841
      actionCount = 0;
      jQuerySBM("a#refresh_view img, a#printable img,a#emaillink img,a img#copyurl, a#display_associated_workflow img, a#display_help img").each(function(index) {
        //if (index == 0) { return; } // skip first option
        var anchor = jQuerySBM(this).parent();
        if (anchor.css('display') == 'none') {
          return;
        } // DEF238597
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

      $pop.click(function() {
        $pop.hide(); // immediate
      });

      $pop.mouseleave(function() {
        jQuerySBM(document).mouseup(function(e) {
          if (!$pop.is(e.target) // if the target of the click isn't the container...
            &&
            $pop.has(e.target).length === 0 // ... nor a descendant of the container
            &&
            !jQuerySBM('.moreActionsBtn').is(e.target)) //nor the button
          {
            $pop.hide(); // immediate
          }
        });
      });
      SOO.ShellFormatting.MoreActions.moreActionsInitialized = true;
    }
  },
    MoreActions1: {
        moreActionsInitialized: false,
        setupMoreActions: function (name) {
            SOO.ShellFormatting.init();

            var fid = LookupFieldId(name);
            var $link = jQuerySBM("#" + fid)
            var $contentwrapper = jQuerySBM("#contentwrapper");
            var className = $link.attr('class');
            $link.addClass("moreActionsBtn");

            $link.mouseenter(function () {
                if (!SOO.ShellFormatting.MoreActions.moreActionsInitialized) { SOO.ShellFormatting.MoreActions.initMoreActions(name, className); }
                var $pop = jQuerySBM("#moreActionsPop");
                var pos = $link.position();
                var width = $link.width();
                var scrollY = $contentwrapper.scrollTop();
                var scrollX = $contentwrapper.scrollLeft();
                $pop.css({ "left": (pos.left + width + scrollX - 1) + "px", "top": (pos.top + scrollY) + "px" }).stop(true, true).show();
            });
            $link.mouseleave(function () {
                SOO.ShellFormatting.MoreActions.hideMoreAction();
            })
        },

        showMoreAction: function () {
            var $pop = jQuerySBM("#moreActionsPop");
            $pop.stop(true, true).show();
        },

        hideMoreAction: function () {
            var $pop = jQuerySBM("#moreActionsPop");
            if ($pop.is(":visible")) {
                $pop.stop(true, true).fadeOut(1000);
            }
        },

        initMoreActions: function (name, className) {
            var fid = LookupFieldId(name);
            var $link = jQuerySBM("#" + fid);
            var $pop = jQuerySBM("<div id='moreActionsPop' class='moreActionsPop'></div>").appendTo($link.parent());
            var usedTids = SOO.Util.getTransitionButtonIds();
            var usedActions = []; //[ "attfile", "atturl", "attlink" ];

            var fragment = document.createDocumentFragment();

            // add transitions
            var actionCount = 0;
            if (aTransitionLookup) {
                jQuerySBM.each(aTransitionLookup.Transitions, function () {
                    if (this.name == null) return;
                    var tid = this.tid;
                    if (jQuerySBM.inArray(tid, usedTids) != -1) return;
                    var item = jQuerySBM('<a href="javascript:PerformTransition(\'TransitionId.' + tid + '\')">' + this.name + '</a>')
      .addClass(className)
                    //	  var item = jQuerySBM('<a href="#">' + this.name + '</a>')
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
                //if (index == 0) return; // skip first option
                if (jQuerySBM(this).css('display') == 'none') return; // DEF238597
                var value = jQuerySBM(this).val();
				if(value === "---" || value === "") { return; } //DEF245778
                var findValue = "";
                var find = value.search(/&template=/i);
                if (find != -1) {
                    var find2 = value.indexOf("&", find + 1);
                    findValue = value.substring(find + 10, find2);
                }
                var foundValue = jQuerySBM.grep(usedActions, function (n) {
                    return n == findValue;
                });
                if (foundValue.length > 0) return;
                var item = jQuerySBM('<a href="javascript:SOO.Util.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>')
    .addClass(className)
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
                
				//if (index == 0) return; // skip first option
                var value = jQuerySBM(this).val();
				if(value === "---" || value === "") { return; }
				
                var findValue = "";
                var find = value.search(/&template=/i);
                if (find != -1) {
                    var find2 = value.indexOf("&", find + 1);
                    findValue = value.substring(find + 10, find2);
                }
                var foundValue = jQuerySBM.grep(usedActions, function (n) {
                    return n == findValue;
                });
                if (foundValue.length > 0) return;
                var item = jQuerySBM('<a href="javascript:SBMSOL.Item.Current.performAction(\'' + value + '\')">' + jQuerySBM(this).text() + '</a>')
    .addClass(className)
                actionCount++;
                fragment.appendChild(item[0]);
            });}
			catch (err){}

            // add even more actions
            if (actionCount > 0) {
                var separator = jQuerySBM('<hr/>');
                fragment.appendChild(separator[0]);
            }
           
         // Removed Show Workflow link code & added to following action count --- ENH239841 
          

            actionCount = 0;
           jQuerySBM("a#refresh_view img, a#printable img,a#emaillink img,a img#copyurl, a#display_associated_workflow img, a#display_help img").each(function (index) {
                //if (index == 0) return; // skip first option
                var anchor = jQuerySBM(this).parent();
                if (anchor.css('display') == 'none') return; // DEF238597
                var text = anchor.attr("title");
                if (text == null || text.length == 0) {
                    text = jQuerySBM(this).attr("title");
                }
                var href = anchor.attr("href");
                var item = jQuerySBM('<a href="' + href + '">' + text + '</a>')
    .addClass(className)
                //.click(function() {
                //  alert('do action: ' + href);
                //  return false;
                //})
                actionCount++;
                fragment.appendChild(item[0]);
            });

            $pop[0].appendChild(fragment);

            $pop.click(function () {
                $pop.hide(); // immediate
            });

            $pop.mouseenter(function () {
                SOO.ShellFormatting.MoreActions.showMoreAction(); // show
            });

            $pop.mouseleave(function () {
                SOO.ShellFormatting.MoreActions.hideMoreAction(); // fade
            });

            SOO.ShellFormatting.MoreActions.moreActionsInitialized = true;
        }

    }, //MoreActions

    Tabs: {
        applyNewTabStyle: function (name) {
            SOO.ShellFormatting.init();

		  var $tab = jQuerySBM("#" + name)
            $tab.addClass("newTabs");
            $tab.find(".tabCell4Spacer:last").css("display","table-cell"); //css("display","block");
            var $tbody = $tab.find(">tbody");
			//fix the displayed corners
          $tbody.children("tr").eq(1).children('td').hide();
            $tbody.find(">tr:last").children('td').hide();
            $tbody.find(">tr >td.genericTabContent").css("border", "none");
            var $tabrow = $tbody.find(">tr:first");
            $tabrow.find(">td:first").hide();
			//add extra column span for blank space on tabs
			$tabrow.children().eq(1).attr('colspan', 3);
            $tabrow.find(">td:last").hide();
            //var list = $tab.children("tbody >tr");
            //alert(list.length);
            //list.each(function(index, el) {
            //  var test = index;
            //  if (index == 1 || index == list.length) { jQuerySBM(el).css("display","block") }
            //});

            $tab.find(".tabCell4Spacer:last").removeClass('tabCell4Spacer').addClass('tabCell4InActiveLeft');
            $tab.find(".tabCell4Spacer:first").removeClass('tabCell4Spacer').addClass('tabCell4InActiveRight').html(' ');
        },
        // start wizard
        applyNewWizardStyle: function (name, tabname) {
            SOO.ShellFormatting.init();

            var $tab = jQuerySBM("#" + name)
            $tab.addClass("wizard");
            //changed the following because it was not working in Firefox, spacer was still hidden
            $tab.find(".tabCell4Spacer:last").removeClass('tabCell4Spacer'); 
			$tab.find(".tabCell4Spacer:first").closest('table').addClass('wizardTabTable'); 
            var $tbody = $tab.find(">tbody");
            //fix the displayed corners
            $tbody.children("tr").eq(1).children('td').hide();
			 $tbody.find(">tr:last").children('td').hide();
            $tbody.find(">tr:last").hide();
            $tbody.find(">tr >td.genericTabContent").css("border", "none");
            var $tabrow = $tbody.find(">tr:first");
            $tabrow.find(">td:first").hide();
            $tabrow.find(">td:last").hide();
            var $tabbody = $tabrow.find(">td:nth-child(2) >table >tbody >tr:first");
            var tdcount = $tabbody.find(">td").length;
            $tabbody.find(">td:nth-child(2)").addClass("tabFirst").next().css("padding-left", "11px");
            $tabbody.find(">td:nth-child(" + (tdcount - 1) + ")").addClass("tabLast").prev().css("padding-right", "11px");

            // use tabname to find groupid
            var groupid = -1;
            var id = LookupFieldId(tabname);
            if (id) {
                var parts = id.split(".");
                if (parts && parts.length == 2) {
                    groupid = parts[0];
                }
            }

            if (groupid != -1) {
                TabGroups[groupid].callback = this.wizardSelectionChanged;
            }
        },

        wizardSelectionChanged: function (sectionid, groupid, formInfoObj, newTab, oldTab) {
            if (newTab) {
                var test = jQuerySBM(newTab).nextAll(".tabCell4InActiveLeft,.tabCell4ActiveLeft");
                var $next = null;
                test.each(function (index, el) {
                    if ($next != null) { return; }
                    if (jQuerySBM(el).next().css("display") == "none") { return; }
                    $next = jQuerySBM(el);
                });
                if ($next) { $next.hide() };
            }
            if (oldTab) {
                var test = jQuerySBM(oldTab).nextAll(".tabCell4InActiveLeft,.tabCell4ActiveLeft");
                var $next = null;
                test.each(function (index, el) {
                    if ($next != null) { return; }
                    if (jQuerySBM(el).next().css("display") == "none") { return; }
                    $next = jQuerySBM(el);
                });
                if ($next) { $next.show() };
            }
        },

        updateWizardStyle: function (name) {
            var $tab = jQuerySBM("#" + name);
            var $tbody = $tab.find(">tbody");
            var $tabrow = $tbody.find(">tr:first");
            var $tabbody = $tabrow.find(">td:nth-child(2) >table >tbody >tr:first");
            var test = $tabbody.find(".tabCell4InActive");
            test.each(function (index, el) {
                var $el = jQuerySBM(el);
                if ($el.is(':hidden')) { return; }
                if ($el.prev().hasClass('tabFirst')) { return; }
                $el.prev().show();
            });

            
           // Commented out because it was causing issues when displaying a hidden tab
	   // hide first left after active tab           
	   // var $activeTab = $tabbody.find(".tabCell4Active");
           // test = $activeTab.nextAll(".tabCell4InActiveLeft,.tabCell4ActiveLeft");
           // test.each(function (index, el) {
           //    if (jQuerySBM(el).next().css("display") == "none") { return; }
           //     jQuerySBM(el).hide();
           //     return false;
           // });
        } // end wizard section      
    }, // end tabs
    
        affixToolbarToTop: function (panel, subButton, canButton) {
            jQuerySBM("#" + panel).addClass("transitionHeaderPanel");
        },

        // insert the following two lines below for a global modification of the expanders
        // 	.sectionLabelFirst {border: none !important;}
        //.contentSectionCustom {
        //    border: none!important;
        //}

        updateCSS: function () {
            var div = jQuerySBM("<div />", {
                html: '&shy;<style>#IdentificationPanel {border: 1px solid #c6c7c6;}\
    					.moreActionsPop{border: 1px solid #D7D7D7; position: absolute;  background-color: white; display: none;  padding: 10px 15px;  z-index: 1000;}\
    					.moreActionsPop a{white-space: nowrap;  display: block;}\
    					.moreActionsPop a:hover {  text-decoration: underline;}\
    					#contentwrapper {top: 0;bottom: 0;position: fixed;}\
    					.SubheadingStyle hr{margin-bottom: 2px; margin-top:2px;color:lightgrey}\
    					.SubheadingStyle {margin-top: 10px;}\
    					</style>'}).appendTo("body");
            //add horizontal rule to SubheadingStyle
            jQuerySBM(".SubheadingStyle").append("<hr style=\"height:1px; background-color:#C6C7C6\">");
        },

        setButtonColor: function (item, color) {
            /* "Any customer can have a car painted any colour that he wants so long as it is black." -Henry Ford */
            if (color == "blue") {
                jQuerySBM("#" + item).addClass("blueButton");
            }
        },
        formatStateForm: function (alignment) {
            var mainTable = jQuerySBM("#StateHeaderPanel").parent().closest("table");
            if (alignment == "center") {
                mainTable.addClass("stateTableCenter");
            } else if (alignment == "right") {
                mainTable.addClass("stateTableRight");
            } else {
                mainTable.addClass("stateTableLeft");
            }
            jQuerySBM(".dtFormat").each(function (index) {
                var theElement = jQuerySBM(this);
                theElement.addClass("dtFormatFixed");
                theElement.parent("td").attr("style", "font-size: 0px ! important");
            });
            // show view in workcenter button in transition form if viewing in new tab
            try {
                if (top.location.href.indexOf('viewwrapper') > -1) {
                    jQuerySBM(top.document.body).find('#viewWrapperHeader').show()
                }
            } catch (err) { }
        },

        formatTransitionForm: function (alignment) {

            jQuerySBM("[data-name$='GreyBorderStyle']").css("border", "1px solid " + "#A5A5A5");

            var mainTable = jQuerySBM("[data-name='TransitionTopPanel']").parent().closest("table");
            if (alignment == "center") {
                mainTable.addClass("transitionTableCenter");
            } else if (alignment == "right") {
                mainTable.addClass("transitionTableRight");
            } else {
                mainTable.addClass("transitionTableLeft");
            }
            jQuerySBM(".frmTxa").css({ "resize": "vertical" });
            jQuerySBM("#PlannedStartLabel").addClass("boldLabelStyle");
            jQuerySBM("#PlannedEndLabel").addClass("boldLabelStyle");

            //jQuerySBM('body').css({"background": SOO.FormUtil.BackgroundImage + " " + SOO.FormUtil.BackgroundColor, "overflow-y":"overlay"});

            // prepends error message to the ContentPanel to allow the error message to scroll out of view
            jQuerySBM("#CustomErrorMsg").addClass("customErrorMsg").prependTo("#"+LookupFieldId("TransitionTopPanel"));
            jQuerySBM("#ErrorMsg").addClass("errorMsg").prependTo("#" + LookupFieldId("TransitionTopPanel"));

            // hide view in workcenter button in transition form if viewing in new tab
            try {
                if (top.location.href.indexOf('viewwrapper') > -1) {
                    jQuerySBM(top.document.body).find('#viewWrapperHeader').hide()
                }
            } catch (err) { }
        },
        setFakeButton: function (imageControl) {
            var img = jQuerySBM('#' + imageControl);
            img.addClass('fakebutton');
        },
        stylizeExpander: function (sectionControl) {

            var section = SOO.Item.Current.getPageSection(sectionControl);
            var sectionUUID = section.fid;
            var sectionString = "#Section" + sectionUUID;

            var sectionHeader = jQuerySBM(sectionString + "_header > div:first-child");
            sectionHeader.attr("style", "padding: 0px 4px; background-color: rgba(255, 255, 255, 0); border-radius: 0px; border-top: medium none ! important; border-left: medium none ! important; border-right: medium none ! important; border-bottom: 1px solid rgb(190, 190, 190) ! important;");

            /* not working right now...
       * sectionHeader.removeAttr("style");
       * sectionHeader.addClass("expanderHeaderNoBoarder");
       */

            var sectionContainer = jQuerySBM(sectionString + "_container");
            sectionContainer.attr("style", "border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; background-color: rgba(255, 255, 255, 0); padding: 0px; border: medium none ! important;");

            /* not working right now...
       * sectionContainer.removeAttr("style");
       * sectionContainer.addClass("expanderContainerNoBoarder");
       */
        },
};

/* SOO.Item --------------------------------------------------------------- Static object to hold utilities for manipulating SBM items -------------------------------------------------------------- */
SOO.Item = {
    get: function (recordId, tableId, projectId, includeMetadata, callback) {
        projectId = (jQuerySBM.isNumeric(projectId))
            ? projectId
            : 0;
        var metadata = (includeMetadata === true)
            ? 1
            : 0;
        var request = SOO.Util.getDll() + "JSONPage&Command=viewitem&projectid=" + projectId + "&recordid=" + recordId + "&tableid=" + tableId + "&metadata=" + metadata + "&avatars=0";
        var result = null;
        var hasCallback = jQuerySBM.isFunction(callback);

        jQuerySBM.ajax({
            url: request,
            dataType: 'json',
            async: hasCallback,
            success: function (json) {
                if (hasCallback) {
                    callback(json);
                } else {
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
        target = (target == null || target == undefined || target == "")
            ? "_blank"
            : target;
        return "<a href='" + SOO.Util.getDll() + "IssuePage&RecordId=" + itemId + "&Template=view&TableId=" + tableId + "' target='" + target + "'>" + linkStr + "</a>";
    },

    getTransitions: function (itemId, tableId, projectId, callback) {
        projectId = (jQuerySBM.isNumeric(projectId))
            ? projectId
            : 0;
        var hasCallback = jQuerySBM.isFunction(callback);
        var result = null;
        var request = SOO.Util.getDll() + "JSONPage&command=gettransitions&projectid=" + projectId + "&recordid=" + itemId + "&tableid=" + tableId;
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

    submitCheckout: function (itemId, tableId, transitionId, projectId, includeMetadata, callback) {
        projectId = (jQuerySBM.isNumeric(projectId))
            ? projectId
            : 0;
        var metadata = (includeMetadata === true)
            ? 1
            : 0;
        //TODO: support transitionid or null
        var request = SOO.Util.getDll() + "JSONPage&Command=checkoutsubmit&flex=1&projectid=" + projectId + "&recordid=" + itemId + "&tableid=" + tableId + "&metadata=" + metadata + "&breaklock=0"; //&transid=" + transitionId;
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
        projectId = (jQuerySBM.isNumeric(projectId))
            ? projectId
            : 0;
        var hasCallback = jQuerySBM.isFunction(callback);
        var result = null;
        var checkinFunc = function (itemData) {
            var checkinData = SOO.Item.createCheckinStructure(itemData);
            for (var name in itemData) {
                checkinData.items[0][name] = itemData[name];
            }
            SOO.Item.checkin(itemData, callback);
        };
        var item = SOO.Item.checkout(
            itemid, tableId, transitionId, projectId, 0, hasCallback
                ? checkinFunc
                : null);
        if (!hasCallback) {
            result = checkinFunc(item);
        }
        return result;
    },

    checkout: function (itemId, tableId, transitionId, projectId, includeMetadata, callback) {
        projectId = (jQuerySBM.isNumeric(projectId))
            ? projectId
            : 0;
        var metadata = (includeMetadata === true)
            ? 1
            : 0;
        var request = SOO.Util.getDll() + "JSONPage&Command=checkoutitem&flex=1&projectid=" + projectId + "&recordid=" + itemId + "&tableid=" + tableId + "&metadata=" + metadata + "&breaklock=1&transid=" + transitionId;
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
        isSubmit = (isSubmit === true)
            ? true
            : false;
        var items = {
            "items": [
                {
                    "tableId": checkoutItemData.request.tableId,
                    "recordId": checkoutItemData.result.item.recordId,
                    "recLockId": checkoutItemData.result.item.recLockId,
                    "isSubmit": isSubmit,
                    "transId": (isSubmit)
                        ? 0
                        : checkoutItemData.result.item.transId
                }
            ]
        };
        if (checkoutItemData.PROJECTID) {
            items[0].projectId = checkoutItemData.PROJECTID.id;
        }
        return items;
    },

    checkin: function (itemData, callback) {
        var request = SOO.Util.getDll() + "JSONPage&Command=checkinitem&flex=1";
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
                SOO.Item.unlock(itemData);
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
        var request = SOO.Util.getDll() + "JSONPage&Command=unlockitem&flex=1";
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
/* SOO.Item.Current --------------------------------------------------------------- Static object to hold utilities for working with a currently open SBM item -------------------------------------------------------------- */
SOO.Item.Current = {

    getTransitionButtonIds: function () {
        var list = new Array();
        jQuerySBM(":button, a").each(function () {
            if (this.id === null || this.id === undefined) {
                return;
            }
            var name = SOO.Item.Current.lookupNameByFID(this.id);
            var test = "get" + name + "TransitionID";
            try {
                var testFn = eval(test);
                if (jQuerySBM.isFunction(testFn)) {
                    list[list.length] = testFn();
                }
            } catch (ex) { }
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
        } else {
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

    _pageSectionTypes: [
        "tab", "section"
    ],
    _pageSections: null,

    getPageSections: function () {
      var self= this;
        if (self._pageSections == null) {
            self._pageSections = [];
            for (var i = 0; i < aFieldLookup.Fields.length; i++) {
                var fldType = aFieldLookup.Fields[i].type;
                for (var j = 0; j < self._pageSectionTypes.length; j++) {
                    if (fldType == self._pageSectionTypes[j]) {
                        self._pageSections.push(aFieldLookup.Fields[i]);
                        break;
                    }
                }
            }
        }
        return self._pageSections;
    },

    getPageSection: function (sectionName) {
        sectionName = sectionName.toLowerCase();
        var sections = SOO.Item.Current.getPageSections();
        for (var i = 0; i < sections.length; i++) {
            var thisName = sections[i].name.toLowerCase();
            if (thisName == sectionName) {
                return sections[i];
            }
        }
        return null;
    },

    hasStateChanged: function () {
        var currState = GetFieldValue("STATE");
        var itemData = SOO.Item.get(sRecordId, sTableId, GetFieldValue("PROJECTID"), false, null);
        if (currState == itemData.result.item.STATE) {
            return false;
        } else {
            return true;
        }
    }
};
// UI helper functions including field manipulation
SOO.UI = {
	filterSingleRelWithReport: function(fldName, reportRefName) {
		var fldID = LookupFieldId(fldName);
		var url = 'tmtrack.dll?ReportPage&template=reports%2Fjsonlist&ReportRef=' + reportRefName + '&embedded';
		
		jQuerySBM.getJSON(url, {}, function(data) {})
        .success(function(data) {
                //clear any existing items in the field
                jQuerySBM('#' + fldID).find('option').remove();
				
                var results = data.results;
                for (var i = 0; i < results.length; i++ ) {
                         var rows = results[i].rows;
                         for (var j = 0; j < rows.length; j++){
                                 // add the record to the field/dropdown
                                 jQuerySBM("#" + fldID).append('<option value="' + rows[j].id + '">' + rows[j].TITLE + '</option>');                          
                         }
                }
        });
	} //end filterSingleRelWithReport
};

// SOO Form actions
SOO.CustomFormActions = {
addRemoveUsers: function (name, param, currUser, useDisplayNames) {

          if (useDisplayNames == true) {
			  var fieldValues = GetMultiListValues(name, false, false);
		  }
		  else { var fieldValues = GetMultiListValues(name, false, true);}

          //Add user to list with names
          if(param && fieldValues != false){fieldValues[fieldValues.length] = currUser;}

          //Add user to empty list
          else if(param && fieldValues == false){fieldValues[0] = currUser;}

          //remove user from list with single user
	  else if(param == false && fieldValues.length == 1) {fieldValues[0]= ""}

          //remove user from list with multiple users
	  else if(param == false && fieldValues.length > 1) 
                { for (var i=0;i<fieldValues.length;i++)
                    { if(fieldValues[i] == currUser)
                         
			 {fieldValues.splice(i,1);}
                    }
                }
         
		  if (useDisplayNames == true) {
			  SetMultiListValues(name, fieldValues, false, false);
		  }
		  else {  SetMultiListValues(name, fieldValues, false, true);}
      },
    
isInList: function (name, currUser) {
            var fieldValues = GetMultiListValues(name, false, true);                             
            if(fieldValues != false) 
                { for (var i=0;i<fieldValues.length;i++)
                    { if(fieldValues[i] == currUser)
                          {return true}
                    }
                }                 
            return false;
      },
      compareDateTimes: function (date1, date2, operator) {
        SOO.CustomFormActions.formatDateTime(date1);
        SOO.CustomFormActions.formatDateTime(date2);
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
      formatDateTime: function(name){
      var dateValueInt = jQuerySBM(GetFieldByName(name)).val();
      if (IsFieldEmpty(name) &&  dateValueInt != "") {
                      var parsedDateInt = parseDate(dateValueInt);
                       }
      if (parsedDateInt != null){SetFieldValue(name, parsedDateInt, false);}
      }
};


var SOO_UTIL_45_LOADED = true;



//@ sourceURL=soo-util.js