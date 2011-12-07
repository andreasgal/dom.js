window.onload = function() {
    document.getElementsByTagName("h1")[0].innerHTML += ": <b>onload1</b>"
}

window.addEventListener("load", function() {
    document.getElementsByTagName("h1")[0].innerHTML += ": <b>onload2</b>"
}, false);

setTimeout(function() {
    document.getElementsByTagName("h1")[0].innerHTML += ": <b>timers</b>";
}, 1000);

foo();