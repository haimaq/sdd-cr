function createRelationalLink(relationalFieldName, newLinkLocation) {
  var linkName = GetFieldValue(relationalFieldName);

  var wrapper = GetFieldWidgetByName(relationalFieldName);
  if (wrapper == null) return;
  var elements = wrapper.getElementsByTagName("a");
  
  if (elements.length != 1)
    return;
  var linkUrl = elements[0].href;
  
  var targetField = GetFieldByName(newLinkLocation);
  targetField.href = linkUrl;
  targetField.innerHTML = linkName;
}

function addStateFormRelationalLinks() {
  createRelationalLink("PARENT_CHANGE_REQUEST", "HyperLinkParentChangeRequest");
}

AddLoadCallback(addStateFormRelationalLinks);
