var changeSelector = {
    initializeList: function (fieldName, dropDownName, noneString, queryFld, fieldsArray) {
        //SOO.templateSelector.initializeList("TASK_PARENT","TemplateSelector", "($STRING(TT_JS,IDS_STR_NONE))");
        var hasSelection = false;
        var isSelectionValid = false;
        var dropdownId = LookupFieldId(dropDownName);
        var dropdownList = $('#' + dropdownId);
        $(dropdownList).find('option').remove();

        var searchValue = GetFieldValue(queryFld);
        var url = "./tmtrack.dll?ScriptPage&scriptName=cots_ws_getgpc&gpcid=" + searchValue;

        $.getJSON(
            url,
            function (data) {
                data.sort(changeSelector.compare);
                //set to currently selected item, if any, else add none and select it. 
                var currentSelectionValue = $(GetFieldByName(fieldName)).val();
                if (currentSelectionValue != 0 && currentSelectionValue != null && currentSelectionValue != noneString) {
                    hasSelection = true;
                    $(dropdownList).prepend("<option value=0>None</option>");
                } else {
                    $(dropdownList).prepend("<option value=0>None</option>").select();
                    //.select not working in FF. Set it manually a second time.  
                    $(dropdownList).val(0);
                }

                $(data).each(function (intNameIndex) {
                    var jSelection = $("<option></option>");
                    // Set the selection text.
                    jSelection.attr('value', this.id);
                    // jSelection.text( this.name);
                    jSelection.text("GPC-" + this.gpc_number + ": " + this.license_name);

                    $(dropdownList).append(jSelection);
                    if (hasSelection && this.id == currentSelectionValue) {
                        $(dropdownList).val(this.id);
                        isSelectionValid = true;
                    }
                });

                if (!isSelectionValid) {
                    //add code clear invalid selection
                    $(dropdownList).val(0);
                    if ($(dropdownList).val() != 0) {
                        //.select not working in FF. Set it manually a second time.  
                        $(dropdownList).val(0);
                    }
                    changeSelector.updateField(fieldName, 0, noneString);
                    changeSelector.setFieldValuesOnPost(fieldName, fieldsArray);

                }

                $(dropdownList).change(function () {
                    var dropdownValue = $('#' + dropdownId + ' option:selected').attr('value');
                    var dropdownText = $('#' + dropdownId + ' option:selected').text();
                    var dpTableId = $('#' + dropdownId + ' option:selected').attr('tableid');
                    changeSelector.updateField(fieldName, dropdownValue, dropdownText);
                    changeSelector.setFieldValuesOnPost(fieldName, fieldsArray);

                    if (dropdownValue != 0) {
                        // ShowField("loadingDPText");
                        //Number($(GetFieldByName("TemplateSelector")).val()) === 0;

                    } else {
                        MakeFieldInvalid(fieldName);
                        performSetFieldValue("GPC_NUMBER", "", true);
                        performSetFieldValue("CUSTOMER_ACCOUNT_ID", "", true);
                        performSetFieldValue("LICENSE_NAME", "", true);
                        performSetFieldValue("POP_END_DATE", "", true);
                    }
                });
            }
        );
    },
    compare: function (a, b) {
        return a.gpc_number < b.gpc_number ? -1 : a.gpc_number > b.gpc_number ? 1 : 0;
    },
    setFieldValuesOnPost: function (fieldName, fields) {
        var paramFields = {
            fixedFields: false,
            includeNotes: true,
            fields: []
        };
        if (!fields) {
            var fields = ["TITLE", "POP_END_DATE", "LICENSE_NAME", "CUSTOMER_ACCOUNT_ID", "ACTIVEINACTIVE", "GCPNMBR_ITEM_COUNT"];
        }
        $.each(fields, function (index, value) {
            paramFields.fields.push({
                "dbname": value
            });
        });
        //var rIdLoc =  $('input[name="CopyRecordId"]').val();
        var rIdLoc = $(GetFieldByName(fieldName)).val();
        var currentSelectionValue = $(GetFieldByName(fieldName)).val();

        if (currentSelectionValue > 0) {
            //var tIdLoc = $('input[name="TableId"]').val();

            $.ajax({
                url: '/jsonapi/GetItem/USR_SDD_COTS_SW_GPC_NUMBERS/' + currentSelectionValue,
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: $.toJSON(paramFields),
                headers: {
                    "alfssoauthntoken": top.ssoToken
                },
                success: function (response) {

                    $.each(response.item.fields, function (key, value) {

                        if (key == "TITLE") {
                            SetFieldValue("GPC_NUMBER", value.value, true);
                        } else if (key == "POP_END_DATE") {
                            SetFieldValue("POP_END_DATE", value.svalue, true);
                        } else if (key == "CUSTOMER_ACCOUNT_ID") {
                            SetFieldValue("CUSTOMER_ACCOUNT_ID", value.value, true);
                        } else if (key == "LICENSE_NAME") {
                            SetFieldValue("LICENSE_NAME", value.value, true);
                        }
                        //    SetFieldValue(key, value.name);
                    });
                }
            });
        } else {
            performSetFieldValue("GPC_NUMBER", "", true);
            performSetFieldValue("CUSTOMER_ACCOUNT_ID", "", true);
            performSetFieldValue("LICENSE_NAME", "", true);
            performSetFieldValue("POP_END_DATE", "", true);
        }
    },
    updateField: function (fieldName, val, displayName) {
        var enFldId = LookupFieldId(fieldName);
        $("#" + enFldId).find("option").remove().end()
            .append($("<option></option>")
                .attr("value", val)
                .text(displayName))
            .val(val)
            .change();
        SetFieldValue(fieldName, displayName);
    }
};


(function ($) {
    $.toJSON = function (o) {
        if (typeof (JSON) == 'object' && JSON.stringify)
            return JSON.stringify(o);
        var type = typeof (o);
        if (o === null)
            return "null";
        if (type == "undefined")
            return undefined;
        if (type == "number" || type == "boolean")
            return o + "";
        if (type == "string")
            return $.quoteString(o);
        if (type == 'object') {
            if (typeof o.toJSON == "function")
                return $.toJSON(o.toJSON());
            if (o.constructor === Date) {
                var month = o.getUTCMonth() + 1;
                if (month < 10) month = '0' + month;
                var day = o.getUTCDate();
                if (day < 10) day = '0' + day;
                var year = o.getUTCFullYear();
                var hours = o.getUTCHours();
                if (hours < 10) hours = '0' + hours;
                var minutes = o.getUTCMinutes();
                if (minutes < 10) minutes = '0' + minutes;
                var seconds = o.getUTCSeconds();
                if (seconds < 10) seconds = '0' + seconds;
                var milli = o.getUTCMilliseconds();
                if (milli < 100) milli = '0' + milli;
                if (milli < 10) milli = '0' + milli;
                return '"' + year + '-' + month + '-' + day + 'T' +
                    hours + ':' + minutes + ':' + seconds + '.' + milli + 'Z"';
            }
            if (o.constructor === Array) {
                var ret = [];
                for (var i = 0; i < o.length; i++)
                    ret.push($.toJSON(o[i]) || "null");
                return "[" + ret.join(",") + "]";
            }
            var pairs = [];
            for (var k in o) {
                var name;
                var type = typeof k;
                if (type == "number")
                    name = '"' + k + '"';
                else if (type == "string")
                    name = $.quoteString(k);
                else
                    continue;
                if (typeof o[k] == "function")
                    continue;
                var val = $.toJSON(o[k]);
                pairs.push(name + ":" + val);
            }
            return "{" + pairs.join(", ") + "}";
        }
    };
    $.evalJSON = function (src) {
        if (typeof (JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        return eval("(" + src + ")");
    };
    $.secureEvalJSON = function (src) {
        if (typeof (JSON) == 'object' && JSON.parse)
            return JSON.parse(src);
        var filtered = src;
        filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
        filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        if (/^[\],:{}\s]*$/.test(filtered))
            return eval("(" + src + ")");
        else
            throw new SyntaxError("Error parsing JSON, source is not valid.");
    };
    $.quoteString = function (string) {
        if (string.match(_escapeable)) {
            return '"' + string.replace(_escapeable, function (a) {
                var c = _meta[a];
                if (typeof c === 'string') return c;
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + string + '"';
    };
    var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
    var _meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };
})($);