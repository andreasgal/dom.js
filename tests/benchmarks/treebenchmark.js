// This microbenchmark tests DOM tree building time, using 
// createElement, setAttribute, appendChild and parentNode.
// On 2011-09-19, it takes 12.6s with domjs and spidermonkey
// and takes 2s in Aurora.  So Gecko is about 6x faster than dom.js
// Actually, using -m on the command line reduces the time to 11s.
// (but -n and -a both make the timings worse)
//
// If I alter buildtree() (see buildtree2.js) so that it just creates
// a tree in a <div> of the main document, then aurora takes just over 1s and
// dom.js takes just under 8s.
//    
if (!this.console) {
    var console = { log: print };
}

// Warm up
for(var i = 0; i < 100; i++) buildtree();

// Real benchmark
var start = Date.now();
for(var i = 0; i < 10000; i++) buildtree();
var end = Date.now();

console.log("Built 10000 trees in: ", (end-start)/1000, " seconds.");

