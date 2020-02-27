//head.feature("solutionForm", true);
//head.feature("b4sbm", true);
//   head.load("sdd/js/jquery-3.3.1.min.js","sdd/bootstrap/js/bootstrap.bundle.min.js", function() {
// Call a function when done
//console.log("Done loading jQuery");
//});
// Load up some CSS
//head.load("sdd/bootstrap/css/bootstrap-sbm.min.css");
//head.load("sdd/font-awesome/css/font-awesome.min.css");
head
	//.load("sdd/bootstrap/css/bootstrap-sbm.min.css")
	.load("ComposerExtensions/a65e4989-ee65-4854-a518-395e91a5e4b8/sddcfext/css/sbmAppStyle.css");


head.ready(function () {
    var readyfunc = function () {
    $('body').addClass("solutionForm").addClass("b4sbm");
      AddLoadCallback(function()
      {
        hideActionControl('AttAction', 'atturl');
        hideActionControl('AttAction', 'attlink');
        hideActionControl('AttAction', 'itemnotification');
        hideActionControl('AttAction', 'vcmanage');
        hideActionControl('AttAction', 'linksubtask-1');
        hideActionControl('AttAction', 'linksubtask-2');
        hideActionControl('AttAction', 'unlinkprincipal');
         hideActionControl('manage_ext_users');
     });
//  var bootstrapButton = $.fn.button.noConflict(); // return $.fn.button to previously assigned value
//  $.fn.bootstrapBtn = bootstrapButton; // give $().bootstrapBtn the Bootstrap functionality

    };

    if (document.readyState === 'complete') {
        readyfunc();
    } else {
        $(document).ready(function () {
            readyfunc();
        });
    }
});
