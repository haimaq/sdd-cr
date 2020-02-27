var sbmAppUtil = sbmAppUtil || {};

sbmAppUtil.Util = {
    getBaseURL: function (url) {
        var iIndex = url.indexOf("?");
        if (iIndex > 0) {
            return url.substring(0, iIndex);
        }
        return url;
    },
    getDll: function () {
        var shell = sbmAppUtil.Util.getQueryParameterByName("shell");
        var dll = "tmtrack.dll?";

        if (shell.length > 0) {
            dll += "shell=" + shell + "&";
        }
        return dll;
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
    getQueryParameterByName: function (name) {
        name = name.toLowerCase();
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search.toLowerCase());

        if (results === null) {
            return "";
        } else {
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    },
    replaceQueryString: function (url, param, value) {
        var re = new RegExp("([?|&])" + param + "=.*?(&|$)", "i");

        if (url.match(re)) {
            return url.replace(re, '$1' + param + "=" + value + '$2');
        } else {
            return url + '&' + param + "=" + value;
        }
    },
    isUuid = function (uuid) {
        if (!uuid) return false;
        uuid = uuid.toString().toLowerCase();
        return /[0-9a-f]{8}\-?[0-9a-f]{4}\-?4[0-9a-f]{3}\-?[89ab][0-9a-f]{3}\-?[0-9a-f]{12}/.test(uuid)
    },
    getJson: function (url, reportParams, rowsOnly, callback, includeAll) {
        // reportParams must be an array of {name: "paramName", value: "paramValue"}
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
            reportParams.push({
                name: "recno",
                value: "-1"
            });
        }

        var paramStr = "";
        for (var i = 0; i < reportParams.length; i++) {
            paramStr += "&" + reportParams[i].name + "=" + reportParams[i].value;
        }
        url = url + "&HasRuntimeParams=" + hasParams + paramStr;

        jQuerySBM.ajax({
            url: url,
            dataType: 'json',
            async: hasCallback,
            success: function (json) {
                if (rowsOnly) {
                    result = sbmAppUtil.Util.getRowsFromJsonList(json);
                } else {
                    result = json;
                }
                if (hasCallback) {
                    callback(result);
                }
            }
        });
        return result;
    }
};

sbmAppUtil.changeSelector = {
    initializeList: function (fieldName, dropDownName, noneString, queryFld, appParams) {
        var hasSelection = false;
        var isSelectionValid = false;
        var dropdownId = LookupFieldId(dropDownName);
        var dropdownList = $('#' + dropdownId);
        $(dropdownList).find('option').remove();

        var reportParams = [];
        var CheckFilter = function (a) {
            if (a.name && a.value) {
                var namePrefixed = /^F_TS_.+/i.test(a.name);
                if (!namePrefixed) {
                    var nameTemp = "F_TS_" + a.name;
                    a.name = nameTemp;
                }
                reportParams.push(a);
            }
        };

        CheckFilter({
            name: queryFld,
            value: GetFieldValue(queryFld)
        });

        //var reportRef = report
        var request = sbmAppUtil.Util.getDll() + "ReportPage&template=reports%2Fjsonlist";
        if (sbmAppUtil.Util.isUuid(appParams.reportRef)) {
            request = request + "&ReportUUID=" + appParams.reportRef + "&AppRptProjId=" + appParams.appRptProjId;
        } else {
            request = request + "&ReportRef=" + appParams.reportRef;
        }

        var results = sbmAppUtil.Util.getJson(request, reportParams, true, "nocallback");

        //set to currently selected item, if any, else add none and select it. 
        var currentSelectionValue = jQuerySBM(GetFieldByName(fieldName)).val();
        if (currentSelectionValue != 0 && currentSelectionValue != null && currentSelectionValue != noneString) {
            hasSelection = true;
            jQuerySBM(dropdownList).prepend("<option value=0>None</option>");
        } else {
            jQuerySBM(dropdownList).prepend("<option value=0>None</option>").select();
            //.select not working in FF. Set it manually a second time.  
            jQuerySBM(dropdownList).val(0);
        }

        jQuerySBM(results).each(function (intNameIndex) {
            var jSelection = jQuerySBM("<option></option>");
            // Set the selection text.
            jSelection.text(this.TITLE);
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
            sbmAppUtil.changeSelector.updateField(fieldName, 0, noneString);
        }


        jQuerySBM(dropdownList).change(function () {
            var dropdownValue = jQuerySBM('#' + dropdownId + ' option:selected').attr('value');
            var dropdownText = jQuerySBM('#' + dropdownId + ' option:selected').text();
            var dpTableId = jQuerySBM('#' + dropdownId + ' option:selected').attr('tableid');
            sbmAppUtil.changeSelector.updateField(fieldName, dropdownValue, dropdownText);
            if (dropdownValue != 0) {
                // ShowField("loadingDPText");
                // ShowField("loadingDPText");
                //Number($(GetFieldByName("TemplateSelector")).val()) === 0;

            } else {
                MakeFieldInvalid(fieldName);
            }
        });



    },
    updateField: function (fieldName, val, displayName) {
        var enFldId = LookupFieldId(fieldName);
        jQuerySBM("#" + enFldId).find("option").remove().end()
            .append(jQuerySBM("<option></option>")
                .attr("value", val)
                .text(displayName))
            .val(val)
            .change();
        SetFieldValue(fieldName, displayName);
    }
};