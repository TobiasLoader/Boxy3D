
// Many global variables below

var f;    /// faces
var p;
var mp;   /// moving points (changes each frame)
var cp;   /// centre points (of objects)
var objects;
var elementorder;
var faceObject;
var faceIDByObject;
var faceOrderMethod;
var movingdist;
var cameras; // array of cameras (can be multiple cameras)
var camera; // index of current camera in use
var keys;  // which keys are being pressed
var action; // whether we need to redraw the scene as some action has taken place
var lightType; // Choose between direction and position (far away or close up)
var lightDir; // direction of light source which illuminates the scene  (FAR AWAY)
var lightPos; // position of light source which illuminates the scene  (CLOSE UP)
var mobilelight; // is the light moving ?
var dynamicrot;
var rotobjectio;
var rotobjectid;
var origin; // the origin of space (ie: 0,0,0)
var colourScheme; // the colours used within the scene
var coefficientOfRestitution;
var partialTiling;
var drawfacepoints;
var drawfaceedges;
var shadeColour;
var lightPathSpeed;
var objectordercentre;
var changeColours;
var colourDoubles;
var renderAllFront;
var objectNum; // Number of unique objects in the scene

// initial setup
function setup() {
	frameRate(30);
	angleMode(DEGREES);
	W = window.innerWidth;
	H = window.innerHeight;
	canvas = createCanvas(W, H);
	i = new Vector3(1,0,0);
  	j = new Vector3(0,1,0);
  	k = new Vector3(0,0,1);
  	origin = {x:0,y:0,z:0};
  	textFont("Quicksand");
   	initScene();
  	drawScene();
  	keys = {left:0,right:0,up:0,down:0,inwards:0,outwards:0,zoom:0};
}


// draw function
function draw(){

	if (mobilelight){
		// if the light is moving, move the light
		movelight();
	}
	
	if (action || mobilelight || (frameCount%50 === 0)){
		// if something in the scene has changed, map the scene and redraw it
		mapScene();
		drawScene();
	}
	
	// check if the camera has moved (see io.js)
	controlCamera(cameras[camera],20);
}