head.load("sdd/css/jquery.tagit.css");
head.load("sdd/css/tagit.ui-zendesk.css");

$(document).ready(function() {

 SetFieldValue("TagsEditBox", GetFieldValue("KEYWORDS"));

  $("#"+ LookupFieldId("TagsEditBox")).tagit({
    singleField: true,
    singleFieldNode: $("#"+LookupFieldId("TagsEditBox")),
    allowSpaces: true,
    minLength: 2,
    removeConfirmation: true,
    tagSource: function(request, response) {
      $.ajax({
        url: "tmtrack.dll?ScriptPage&ScriptName=lib.json",
        data: { find: request.term },
        dataType: "json",
        success: function(data) {
          response(
            $.map(data.tags, function(item) {
              return {
                label: item.title,
                value: item.title
              };
            })
          );
        }
      });
    }
  });
});