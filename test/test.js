require.config({
    baseUrl: "js",
    paths: {
        lib: '../lib',
        jquery: '../lib/jquery',
        alasql: '../lib/alasql',
        bootstrap: '../lib/bootstrap'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'bootstrap'
        }
    }
});
define("test", ['jquery', "utils"], function($, u, chart){
    var tree = new NamedTree();
    var test_node = [];
    tree.create(0, 0);
    for(var i = 1; i < 200000; i++){
        tree.create(i, i, Math.floor((i - 1) / 2));
    }
    var out_ul = $('#output');
    var count = 0;
    var times = 20;
    for(var i = 0; i < times; i++){
        var start = new Date();
        tree.traverse(function(name, value, idx, layer){

        }, 'pre');
        var end = new Date();
        count += (end - start);
    }
    console.log(count / times);
});