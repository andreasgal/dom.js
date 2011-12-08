var worker = new Worker('servo-worker.js');

worker.addEventListener("message", function(event) {
    var cmd = event.data[0];
    var data = event.data[1];

    switch(cmd) {
    case "log":
        console.log("WORKER", data);
        break;
    case "warn":
        console.warn("WORKER", data);
        break;
    case "error":
        console.error("WORKER", data);
        break;
    }
});

window.onload = function() {
    new TreeRenderer(worker, document.getElementById("n1"));
    new IFrameRenderer(worker, document.getElementById("renderer"));

    var form = document.getElementById("url");
    form.onsubmit = function(e) {
        document.getElementById('n1').innerHTML = '';
        var url = form.url.value;
        worker.postMessage(["load", url]);
        e.preventDefault();
    }
};

