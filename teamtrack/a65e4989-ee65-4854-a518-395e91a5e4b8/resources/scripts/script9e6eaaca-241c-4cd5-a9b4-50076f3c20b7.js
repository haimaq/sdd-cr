head.feature("solutionForm", true);
head.feature("bootstrap-sbm", true);
//shead.load("sdd/css/bootstrap-sbm.css");
head.load("sdd/font-awesome/css/font-awesome.min.css");
head.load("sdd/css/sbmAppStyle.css");
head.load("sdd/css/jquery.tagit.css");
head.load("sdd/css/tagit.ui-zendesk.css");
$(document).ready(function() {
  jQuerySBM("#formbtns_cancel").addClass("CancelButton");
  jQuerySBM("#formbtns_ok").addClass("SubmitButton");

  var bootstrapButton = $.fn.button.noConflict(); // return $.fn.button to previously assigned value
  $.fn.bootstrapBtn = bootstrapButton; // give $().bootstrapBtn the Bootstrap functionality

});