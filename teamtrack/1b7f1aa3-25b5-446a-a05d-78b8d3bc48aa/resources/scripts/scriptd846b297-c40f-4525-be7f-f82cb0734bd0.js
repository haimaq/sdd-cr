function setFieldValuesOnPost (fields) {
var paramFields = {fixedFields: false, includeNotes: true, fields: []};
if (!fields) { var fields = ["SEVERITY", "IMPACT", "PRIORITY", "ISSUETYPE", "REQUEST_TYPE", "DEPARTMENT"] }
jQuerySBM.each(fields, function( index, value ) {
                                           paramFields.fields.push({"dbname":value})
								});
var rIdLoc =  jQuerySBM('input[name="CopyRecordId"]').val();
if (rIdLoc > 0 ) {
var tIdLoc = jQuerySBM('input[name="TableId"]').val();


jQuerySBM.ajax({                url: '/jsonapi/GetItem/'+tIdLoc+'/'+rIdLoc,
                                type: "POST",
                                contentType: "application/json",
                               dataType: "json",
                                data: jQuerySBM.toJSON(paramFields),
                                headers: {
                                    "alfssoauthntoken": top.ssoToken
									},
							success: function (response) {
								jQuerySBM.each(response.item.fields, function( key, value ) {
                                                 SetFieldValue(key, value.name);
								});
					}
			});
}

}
(function(jQuerySBM){jQuerySBM.toJSON=function(o)
{if(typeof(JSON)=='object'&&JSON.stringify)
return JSON.stringify(o);var type=typeof(o);if(o===null)
return"null";if(type=="undefined")
return undefined;if(type=="number"||type=="boolean")
return o+"";if(type=="string")
return jQuerySBM.quoteString(o);if(type=='object')
{if(typeof o.toJSON=="function")
return jQuerySBM.toJSON(o.toJSON());if(o.constructor===Date)
{var month=o.getUTCMonth()+1;if(month<10)month='0'+month;var day=o.getUTCDate();if(day<10)day='0'+day;var year=o.getUTCFullYear();var hours=o.getUTCHours();if(hours<10)hours='0'+hours;var minutes=o.getUTCMinutes();if(minutes<10)minutes='0'+minutes;var seconds=o.getUTCSeconds();if(seconds<10)seconds='0'+seconds;var milli=o.getUTCMilliseconds();if(milli<100)milli='0'+milli;if(milli<10)milli='0'+milli;return'"'+year+'-'+month+'-'+day+'T'+
hours+':'+minutes+':'+seconds+'.'+milli+'Z"';}
if(o.constructor===Array)
{var ret=[];for(var i=0;i<o.length;i++)
ret.push(jQuerySBM.toJSON(o[i])||"null");return"["+ret.join(",")+"]";}
var pairs=[];for(var k in o){var name;var type=typeof k;if(type=="number")
name='"'+k+'"';else if(type=="string")
name=jQuerySBM.quoteString(k);else
continue;if(typeof o[k]=="function")
continue;var val=jQuerySBM.toJSON(o[k]);pairs.push(name+":"+val);}
return"{"+pairs.join(", ")+"}";}};jQuerySBM.evalJSON=function(src)
{if(typeof(JSON)=='object'&&JSON.parse)
return JSON.parse(src);return eval("("+src+")");};jQuerySBM.secureEvalJSON=function(src)
{if(typeof(JSON)=='object'&&JSON.parse)
return JSON.parse(src);var filtered=src;filtered=filtered.replace(/\\["\\\/bfnrtu]/g,'@');filtered=filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']');filtered=filtered.replace(/(?:^|:|,)(?:\s*\[)+/g,'');if(/^[\],:{}\s]*$/.test(filtered))
return eval("("+src+")");else
throw new SyntaxError("Error parsing JSON, source is not valid.");};jQuerySBM.quoteString=function(string)
{if(string.match(_escapeable))
{return'"'+string.replace(_escapeable,function(a)
{var c=_meta[a];if(typeof c==='string')return c;c=a.charCodeAt();return'\\u00'+Math.floor(c/16).toString(16)+(c%16).toString(16);})+'"';}
return'"'+string+'"';};var _escapeable=/["\\\x00-\x1f\x7f-\x9f]/g;var _meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};})(jQuerySBM);