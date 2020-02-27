//head.feature("solutionForm", true);
//head.feature("bootstrap-sbm", true);


// Load up some JS
head
    .js("sdd/js/jquery-3.2.1.min.js")
  //  .js("sdd/js/bootstrap.min.js")
    .js("sdd/js/sbmsol-util-1.1.js")
    .js("sdd/js/soo-util.js");
// Load up some CSS
//head.load("sdd/css/bootstrap-sbm.css");

head.ready(document, function () {
    $('body').addClass('solutionForm');
    console.log("ready(docume");
    $('#toggle .separator').remove();
    $('#goback').prependTo('#iterate');

});
head.ready(function () {
    var readyfunc = function () {
        console.log("hfgghf");
    };

    if (document.readyState === 'complete') {
        readyfunc();
    } else {
        $(document).ready(function () {
            readyfunc();
        });
    }
});
head(function () {
    // Do anything
    console.log($('html').hasClass("solutionForm"));
    console.log("head");
});
AddLoadCallback(function () {
    console.log("AddLoadCallBack12");
    console.log($('html').hasClass("solutionForm"));

});
$(document).ready(function () {
    console.log("document");
});
head(function () {
    // Do anything
    console.log("head");
});

AddLoadCallback(function () {
    console.log("AddLoadCallBack1");

});

