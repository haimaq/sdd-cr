head
	.load("sdd/bootstrap/css/bootstrap-sbm.min.css")
	.load("sdd/font-awesome/css/font-awesome.min.css")
	.load("sdd/css/sbmAppStyle.css");
	//.load("sdd/css/jquery.tagit.css")
	//.load("sdd/css/tagit.ui-zendesk.css");

head
    .js("javascript/a65e4989-ee65-4854-a518-395e91a5e4b8/6e756b30-fb9a-4fa2-9017-ec69e4c7b6d0.js")
    .js("javascript/a65e4989-ee65-4854-a518-395e91a5e4b8/8b8b4ff6-5df4-4cda-82e2-ea9c44a56c46.js") //bootstrap.min.js
    .js("javascript/a65e4989-ee65-4854-a518-395e91a5e4b8/96d32648-6c14-4d3a-a18e-afb9dad20df4.js") //sbmsol-util-1.1.js
    .js("javascript/a65e4989-ee65-4854-a518-395e91a5e4b8/b35ec051-fee4-4f43-a020-d18aaeb33dc1.js"); //soo-util.js
// Load up some CSS
head.ready(document, function () {
    $('body').addClass("solutionForm").addClass("b4sbm");
	
});

//$(document).ready(function() {

 // var bootstrapButton = $.fn.button.noConflict(); // return $.fn.button to previously assigned value
//  $.fn.bootstrapBtn = bootstrapButton; // give $().bootstrapBtn the Bootstrap functionalityzzzz

//});
