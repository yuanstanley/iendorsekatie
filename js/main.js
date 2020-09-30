// globals!

var name;
var quotation;
var avatarImageSrc;

var imgs=[];
var imagesOK=0;
var statePath = '';
var candidatePath = '';

// Load multiple images and draw when totally finished loading
// https://stackoverflow.com/questions/33596638/loading-multiple-png-images-in-html5-canvas#answer-33601666

// put the paths to your images in imageURLs[]
var imageURLs=[];

const AVATAR = 0
const SHORT_LOGO = 1
const LONG_LOGO = 2
const MARKERS = 3
const GRADIENT = 4
const EXAMPLE = 5


// Colors
const LIGHT_GRAY = "#b3b3b3"
const DARK_BLUE = "#164e7d"
const ORANGE = "#ff830b"
const LIGHT_BLUE = "#63b5cc"

// https://stackoverflow.com/a/53636623/25560
const prepareFontLoad = (fontList) => Promise.all(fontList.map(font => document.fonts.load(font)));

/* exported startGeneratingImage */

async function startGeneratingImage() {

	const fontList = ['800 60px Raleway', '400 60px Raleway', '700 60px Raleway', '300 30px Caveat', '100 30px Caveat'];
	await prepareFontLoad(fontList);

	// the loaded images will be placed in imgs[]
	imgs=[];

	imageURLs=[];
	imageURLs.push(avatarImageSrc ? avatarImageSrc : "/img/avatar.png");
	imageURLs.push("img/KP-short-logo.png");
	imageURLs.push("img/KP-long-logo.png");
	imageURLs.push("img/marker.png");
	imageURLs.push("img/gradient.png");
	imageURLs.push("img/example.png");

	imagesOK=0;
	startLoadingAllImages(imagesAreNowLoaded);
}

// Create a new Image() for each item in imageURLs[]
// When all images are loaded, run the callback (==imagesAreNowLoaded)
function startLoadingAllImages(callback){

	// iterate through the imageURLs array and create new images for each
	for (var i=0; i<imageURLs.length; i++) {
		// create a new image an push it into the imgs[] array
		var img = new Image();
		// Important! By pushing (saving) this img into imgs[],
		//     we make sure the img variable is free to
		//     take on the next value in the loop.
		imgs.push(img);
		// when this image loads, call this img.onload
		img.onload = function(){
			// this img loaded, increment the image counter
			imagesOK++;
			// if we've loaded all images, call the callback
			if (imagesOK>=imageURLs.length ) {
				callback();
			}
		};
		// notify if there's an error
		img.onerror=function(){
			alert("image load failed: " + imageURLs[i]);
		}
		// set img properties
		img.src = imageURLs[i];
	}
}

// All the images are now loaded
function imagesAreNowLoaded(){

	// DRAW SOME TEXT
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var w = canvas.width;
	var h = canvas.height;

	// Background Color

	var exampleImage = imgs[EXAMPLE];
	ctx.drawImage(exampleImage, 0,0,w,h);

	ctx.fillStyle = 'rgb(255, 255, 255)';
	ctx.fillRect(0, 0, w, h);

	ctx.globalAlpha = 1.0;

	// ----------------------------------------------------- Whiteboard

	var strokeWidth = 50;
	ctx.lineWidth = strokeWidth;
	ctx.strokeStyle = LIGHT_GRAY;
	var whiteboardWidth = 0.55 * w;
	ctx.strokeRect(0.45 * w, 0, whiteboardWidth, h);

	// ----------------------------------------------------- Avatar

	var centerX = w * 0.775;
	var centerY = h * 0.275;
	var radius = w * 0.19;

	// Save the state, so we can undo the clipping
	ctx.save();


	// Create a square
	ctx.beginPath();

	var avatarWidth = 0.45 * w;
	var avatarHeight = 0.95 * h;
	ctx.rect(0, 0, avatarWidth, avatarHeight);

	// Clip to the current path
	ctx.clip();

	var image = imgs[AVATAR];
	var imageWidth = image.naturalWidth;
	var imageHeight = image.naturalHeight;
	var aspect = imageWidth / imageHeight;
	var scaleRatio;

	if (aspect < 0.67) {
		var scaleRatio = avatarWidth / imageWidth;
	}
	else {
		var scaleRatio = avatarHeight / imageHeight;
	}
	// always crop from top left
	ctx.drawImage(image, 0, 0, imageWidth * scaleRatio, imageHeight * scaleRatio);

	// Undo the clipping
	ctx.restore();

	// ----------------------------------------------------- blue gradient

	var gradientImage = imgs[GRADIENT];

	var gradientHeight = 0.2 * h;
	var gradientWidth = avatarWidth;

	ctx.drawImage(gradientImage, 0, h - gradientHeight, gradientWidth, gradientHeight);

	// ----------------------------------------------------- Name

	var xOffset = 75

	var fontSize = 55 * w/1000;
	ctx.font = "800 " + String(fontSize) + "px Raleway";

	var textWidth = ctx.measureText(name).width;
	var textHeight = ctx.measureText(name).actualBoundingBoxDescent + ctx.measureText(name).actualBoundingBoxAscent;

	// Make sure user's name fits
	var nameWidth = whiteboardWidth - (xOffset * 2);

	if (textWidth > nameWidth) {
		fontSize *= nameWidth / textWidth;
		ctx.font = "800 " + String(fontSize) + "px Raleway";
		textWidth = ctx.measureText(name).width;
		textHeight = ctx.measureText(name).actualBoundingBoxDescent + ctx.measureText(name).actualBoundingBoxAscent;
	}

	var y = h * 0.18;
	textXCenter =  avatarWidth + (whiteboardWidth / 2);

	ctx.fillStyle = DARK_BLUE;
	ctx.fillText(name, textXCenter-textWidth/2, y, textWidth);

	// ----------------------------------------------------- Endorses


	y = h * 0.245;
	fontSize = 40 * w/1000;

	var endorses = "endorses";

	ctx.font = "400 " + String(fontSize) + "px Raleway";

	textWidth = ctx.measureText(endorses).width;
	ctx.fillStyle = ORANGE;
	ctx.fillText(endorses, textXCenter-textWidth/2, y, textWidth);

	// ----------------------------------------------------- Katie Porter (logo)

	var longLogoImg = imgs[LONG_LOGO];

	var scaleRatio = (whiteboardWidth - 2 * xOffset) / longLogoImg.naturalWidth;
	ctx.drawImage(longLogoImg, avatarWidth + xOffset, h * 0.30,
				  longLogoImg.naturalWidth * scaleRatio, longLogoImg.naturalHeight * scaleRatio);

	// ----------------------------------------------------- markers

	var markersImg = imgs[MARKERS];
	var scaleRatio = (whiteboardWidth / 2) / markersImg.naturalWidth;
	ctx.drawImage(markersImg, avatarWidth + (whiteboardWidth / 2) - (strokeWidth / 2), h - (markersImg.naturalHeight * scaleRatio) - (strokeWidth / 2),
							  markersImg.naturalWidth * scaleRatio, markersImg.naturalHeight * scaleRatio);

	// ----------------------------------------------------- Paragraph Text
	var setting = {
			maxSpaceSize : 1,
			minSpaceSize : 0.5,
			lineSpacing : 1.15,
			compact : false
	}

	ctx.textAlign = "left";
	ctx.fillStyle = "transparent";

	var endquote = "";
	var wid = whiteboardWidth - (xOffset * 3);
	var left = avatarWidth + (strokeWidth / 2) + xOffset;
	var origY = h * 0.52;
	var size;

	for (size = 200 ; size > 15 ; size -= 1) {

		y = origY;
		ctx.font = "300 " + String(size * h/1000) + "px Caveat";

		// Draw paragraph
		var line = ctx.fillParaText(quotation+endquote, left, y, wid, setting);  // settings is remembered

		y = line.nextLine;

		if (y < h * 0.95) {
			break;  // it fits, so really draw now.
		}
	}

	ctx.fillStyle = "black";
	y = origY;
	ctx.font = "100 " + String(size * h/1000) + "px Caveat";
	line = ctx.fillParaText(quotation+endquote, left, y, wid, setting);  // settings is remembered


	// ----------------------------------------------------- KP SHORT LOGO

	var shortLogoImg = imgs[SHORT_LOGO];
	var shortLogoHeight = 0.055 * h;

	var scaleRatio = shortLogoHeight / shortLogoImg.naturalHeight;
	ctx.drawImage(shortLogoImg, 50, h - shortLogoHeight - 40,
							  shortLogoImg.naturalWidth * scaleRatio, shortLogoImg.naturalHeight * scaleRatio);

	var shortLogoWidth = shortLogoImg.naturalWidth * scaleRatio;

	// ----------------------------------------------------- BOTTOM STUFF

	var GENERATED_HASHTAG = "I am a #PorterSupporter";
	var GENERATED_TEXT = "generated at IEndorseKatie.com"

	ctx.font = "700 " + String(30 * h/1000) + "px Raleway";
	ctx.fillStyle = LIGHT_BLUE;
	ctx.fillText(GENERATED_HASHTAG, 75 + shortLogoWidth,  h - shortLogoHeight - 10, w*0.9);

	ctx.fillStyle = 'white';
	ctx.font = "300 " + String(20 * h/1000) + "px Raleway";
	ctx.fillText(GENERATED_TEXT, 75 + shortLogoWidth,  h - shortLogoHeight + 20, w*0.9);

	var saveContainer = document.getElementById('saveContainer');
	saveContainer.style.display = 'block';		// reveal all!

	var canvas = document.getElementById('canvas');
	canvas.style.display = 'block';		// reveal all!

	var canvasImg = document.getElementById('canvasImg');
	canvasImg.style.display = 'none';		// hide sample image
}
