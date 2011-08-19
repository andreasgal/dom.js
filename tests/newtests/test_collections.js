

var img = document.createElement('img');
img.setAttribute('src', 'foo');
var img2 = document.createElement('img');
img2.setAttribute('src', 'bar');

document.body.appendChild(img);
document.body.appendChild(img2);

//assert(document.images.length === 2);

//assert(document.images.item(0) === img);
//assert(document.images.item(1) === img2);

var img3 = document.createElement('img');
img3.setAttribute('src', 'baz');

