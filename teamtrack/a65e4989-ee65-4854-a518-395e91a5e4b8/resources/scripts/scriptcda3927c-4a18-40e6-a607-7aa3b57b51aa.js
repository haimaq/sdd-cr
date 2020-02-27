head
	.load("sdd/bootstrap/css/bootstrap-sbm.min.css")
	.load("ComposerExtensions/a65e4989-ee65-4854-a518-395e91a5e4b8/sddcfext/css/sbmAppStyle.css");
head.ready(function () {
    var readyfunc = function () {
    $('body').addClass("solutionForm");
      AddLoadCallback(function()
      {

     });
  

    };

    if (document.readyState === 'complete') {
        readyfunc();
    } else {
        $(document).ready(function () {
            readyfunc();
        });
    }
});



//head.feature("solutionForm", true);
//head.feature("b4sbm", true);
//   head.load("sdd/js/jquery-3.3.1.min.js","sdd/bootstrap/js/bootstrap.bundle.min.js", function() {
// Call a function when done
//console.log("Done loading jQuery");
//});
// Load up some CSS
//head.load("sdd/bootstrap/css/bootstrap-sbm.min.css");
//head.load("sdd/font-awesome/css/font-awesome.min.css");
 
	//.load("sdd/bootstrap/css/bootstrap-sbm.min.css")
