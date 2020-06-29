


/*  -----     scene_design.js     -----  */

// Here is where the user can fully describe, design and create any scene with the tools that have been created






/* ------ SCENE OPTIONS ------- */

// Here are some of the features of my project which you can access and customise easily.
function initSceneOptions(){
	
	
	/*
	
			Very Important -- Quality --> if the scene is not running smoothly decrease the variable quality, if it is running smoothly, try increasing it
	
	*/
	 	
  	
  	//
  	//
  	//
  	
  	  	
  					quality = 0.5; // a scale between 0 and 1, where 0 is very low quality (but fast) and 1 is very high quality (but slow)
  	
  	
  	//
  	//
  	//
	
	
	// What is the greatest distance Moving Points (MP) can be from the camera (after this distance stop them from moving and hence also from checking for collisions etc...)
	movingdist = 5000;
	
	// After a collision occurs, what fraction of the Moving Points (MP) initial speed should it now be have (coefficient of restitution).
  	coefficientOfRestitution = 0.8;
  	
  	// If this is set equal to true, then some objects in the scene will only have half of their tiles (less computation and a cool effect)
  	partialTiling = false;
  	
  	// If this is set to true, all the vertices of each face are drawn on the screen.
  	drawfacepoints = false;
  	
  	// If this is set to true, all the edges of each face are drawn on the screen.
  	drawfaceedges = false;
  	
  	// If this is set to true, all objects in the scene will dynamically rotate by the amount set in their definition (see below initSceneObjects() and scene_objects.js).
  	dynamicrot = true;
  	
  	// If this is set to true, when dragging the mouse instead of rotating the camera, it will rotate the objects in the scene.
  	rotobjectio = false;
  	
  	// Can be either (1 or 2)
  	// This determines how to sort all the faces of the scene in increasing proximity to the camera, to decide in which order they should be drawn onto the screen.
  	// Option 1 is a more reliable method however will likely take longer to process
  	// Option 2 is a less reliable method however will likely be quicker to process
  	faceOrderMethod = 2;
  	
  	// If set to true, the colours of the objects in the scene fade into their corresponding colour doubles
  	changeColours = true;
  	
  	// If true, all points in front of the camera are rendered, even if off screen (as may be part of a face), if not, points beyond a certain range are no longer rendered
  	renderAllFront = false;
}





/* ------ CAMERA ------- */

// This is where the camera used in the scene is defined (see camera.js)
function initCamera(){
	
	// The camera has 4 attributes:
	//  	- Its inital position
	// 		- Its direction (where it is pointing)
	// 		- The camera to surface distance (see camera.js)  -->  in this case I have it changing with the width and height of the window to make it responsive
	// 		- The maximum velocity when moving
	
	// array of cameras
	cameras = [];
	cameras.push(new Camera(
	    new Vector3(0,0,0),
	    new Vector3(0,1,0),
	    (22*sqrt(width*height/1000)),
	    50
	),new Camera(
	    new Vector3(0,0,0),
	    new Vector3(0,1,0),
	    (22*sqrt(width*height/1000)),
	    50
	));
	
	// index of current camera
	camera = 0;
}






/* ------ ELEMENT ARRAYS ------- */

// This is where the arrays of elements are stored --> these store all the information about the scene in a way that is easily accessible
function initElementArrays(){
	// This stores all the faces in a single array. When faces are stored in this array they are no longer considered to belong to any given object,
	// they are all treated the same.
	f = [];
	// This stores all the points (P) of the scene
	p = [];
	// This stores all the points that are centres of an object
	cp = [];
	// This stores all the moving points (MP)
	mp = [];
	// This array stores the sorted array about to be used to draw the scene.
	// This includes faces (F) and moving points (MP). Points (P) are not sorted, instead always drawn at the back
	elementorder = [];
	// This stores the ids of where objects start and end (cumulative index of 'f' array)
	faceIDByObject = [];
	// This stores all the faces of the scene compartmentalised for each object.
	// When an object is 'built', there faces first are added to this array
	faceObject = [];
	// The order in which the centres of 3D objects are by proximity to the camera
	objectordercentre = [];
}





/* ------ LIGHT ------- */

// This is where the source of light is chosen, and its type.
function initLight(){
	
	// Should the light source be 'Far' from the scene -- eg: very distant like the sun is to us here on Earth, where light rays are assumed to be parallel
	// Or should the light source be 'Close' to the scene -- eg: like a lamp illuminating objects. The light rays are not parallel, assumed to be uniformly radial
	
	lightType = 'Close';  // 'Far' or 'Close'
	
	
	if (lightType==='Far'){
		// This would be the direction that a ray of light would be travelling in when incident on scene
		lightDir = new Vector3(-0.3,-0.2,-0.5).unit();
	} else if (lightType==='Close') {
		// Here we have modelled the 'Close' light source as a moving point with a predetermined path, with design 'light'.
		// However here there is a lot of freedom, we could have modelled it as a standard moving point for example, just travelling in a straight line.
		// If that was the case it could collide with non-rotating objects, or it could even be of type moving point but it just doesn't travel (ie: have 0 speed).
		// Or it could not be a moving point at all and there be no 'source of light' drawn on the screen, again here it could follow a custom path, straight line or not move at all.
		mp.push(new MP({x:0,y:0,z:0},false,30,'light',lightPath));
		lightPos = mp[0].p3;
		lightPathSpeed = 0.4;
	}
	
	// Should the source of light be mobile (can it move) --> if this is true then the shading on every face of the scene will have to be recalculated, since the light could have moved
	mobilelight = true;
}






/* ------ LIGHT PATH ------- */

// This is where the path the light takes is described, assuming that mobilelight is true in the function initLight() above
function lightPath(T){
	// It takes a parameter T, this can be anything, but generally will represent some function of time
	// This takes into account the two different types of light (Close and Far)  -->  see initLight above for a description on this
	if (lightType==='Far'){
		// The new direction of the light which is incident upon the scene
		return new Vector3(sin(T),sin(2*T),cos(T)).unit();
	} else if (lightType==='Close') {
		// The new location of the light source
		return {x:1400*(2*sin((T+160)+57.3)*cos((T+160)+51.6)*cos((T+160)+51.6)*cos(2*(T+160)+22.9))+100,y:1000*(cos(342.8-(T+160))*sin(2*(T+160)-108.8)*sin(2*(T+160)-108.8))+2400,z:-800*cos((T+160)-50)};
	}
}






/* ------ COLOURS ------- */

function initColours(){
	
	// RGB colours for the objects in the scene to use, the first in the list is the background colour, and the list goes from darkest to lightest
	
	// Colour Scheme
	cS = [
		color(15, 26, 38),    /// blue
		color(85, 120, 157),
		color(113, 144, 177),
		color(150, 176, 203),
		color(186, 205, 225),
		color(215, 235, 241)
	];
	
	
	/// The colour doubles are when switching between colours
	
	// Colour Double
	cD = [[
		color(15, 26, 38),    /// green
		color(165, 193, 163),
		color(182, 204, 180),
		color(196, 213, 195),
		color(210, 222, 209),
		color(223, 230, 222)
	], [
		color(15, 26, 38),    /// yellow
		color(231, 209, 151),
		color(251, 233, 184),
		color(255, 241, 204),
		color(255, 245, 219),
		color(255, 249, 232)
	], [
		color(15, 26, 38),    /// red
		color(191, 150, 153),
		color(208, 173, 175),
		color(226, 197, 199),
		color(244, 223, 225),
		color(250, 236, 237)
	], [
		color(15, 26, 38),    /// purple
		color(150, 139, 158),
		color(162, 153, 168),
		color(177, 170, 181),
		color(193, 189, 197),
		color(210, 207, 212)
	]];
	
	// The colour of a tile when it is completely in shade, ie: it faces the complete opposite direction to the source of light
	shadeColour = color(20, 25, 30);
}




/* ------ SCENE OBJECTS ------- */

function initSceneObjects(){
	
	// This is the array which contains the actual definitions of the 3D objects in the scene (see scene_objects.js)
	objects = [];
	
	// This array records which objects are currently rotating.
	// NB: if both dynamicrot and rotobjectio are false, then this list will always be empty, regardless of the definitions below.
	rotobjectid = [];
	
	// SCENE OBJECTS BELOW  -->  see scene_objects.js
	
	objects.push( new Torus(true,{x:1000,y:3300,z:-500},85,430,cS[2],8+round(20*quality),5+round(15*quality),{x:-50,y:30,z:0},{x:lightPathSpeed,y:lightPathSpeed,z:0},false,[cD[0][2],cD[1][2],cD[2][2],cD[3][2]]));
	objects.push( new Cylinder(true,{x:550,y:2600,z:650},80,400,cS[4],2+round(6*quality),5+round(20*quality),{x:0,y:-5,z:-15},{x:3*lightPathSpeed,y:0,z:0},false,false,[cD[0][4],cD[1][4],cD[2][4],cD[3][4]]));
	objects.push( new Cuboid(true,{x:-550,y:2350,z:700},350,350,350,cS[3],3,{x:60,y:20,z:20},{x:-lightPathSpeed,y:0,z:-lightPathSpeed},false,1,[cD[0][3],cD[1][3],cD[2][3],cD[3][3]]) );	
	objects.push( new Cone(true,{x:-150,y:2050,z:-650},200,200,350,cS[5],4+round(30*quality),{x:120,y:20,z:30},{x:-2*lightPathSpeed,y:0,z:0},false,false,[cD[0][5],cD[1][5],cD[2][5],cD[3][5]] ));            	
	// For the pyramid, I have used a cone with 4 sides as more efficient. But equally I could have used the Pyramid object
	objects.push( new Cone(true,{x:-800,y:1900,z:-100},250,250,350,cS[1],4,{x:-120,y:20,z:20},{x:2*lightPathSpeed,y:0,z:0},false,false,[cD[0][1],cD[1][1],cD[2][1],cD[3][1]] ));                  				

}





/* ------ BUILD OBJECTS ------- */

function buildObjects(){
	// Building every object in the array objects (which should always be all of them)
	for (var o=0; o<objects.length; o+=1){
		objects[o].build();
	}
}





/* ------ BUILD OBJECTS ------- */

function initMovingPoints(){
	
	// EXAMPLE MOVING POINTS BELOW:
/*
	mp.push(new MP({x:-490,y:1000,z:-40},{x:5,y:10,z:-0.30},30,'asteroid'));
	mp.push(new MP({x:950,y:-100,z:-300},{x:-0.5,y:15,z:0},30,'asteroid'));
	mp.push(new MP({x:850,y:-100,z:-300},{x:-0.5,y:15,z:0},30,'asteroid'));
*/

	// Search for collisions with every moving point and every object --> (see scene_draw.js)
	mapMovePoindFindCollisions([...Array(objects.length).keys()]);
}




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  above are the standard functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  below are the custom functions


// These are all custom functions that I have specifically written for this scene, these will change when designing a different scene


// Creating all the stars in the background. 
// I have carefully designed the function such that a larger number of stars will be visible on load with less compute power
// Also the while loop states that while stars are too close to the origin, randomise new stars again, to prevent any stars being very close to the scene
function randomStars(){
	var X = 0;
	var Y = 0;
	var Z = 0;
	for (var i=0;i<600*quality;i+=1){
		X = random(-350000,350000);
		Y = random(-500000,500000);
		Z = random(-350000,350000);
		while (X*X +Y*Y + Z*Z < 10000000000){
			X = random(-350000,350000);
			Y = random(-500000,500000);
			Z = random(-350000,350000);
		}
		p.push(new P({x:X,y:Y,z:Z},random(700,1400),'plain'));
	}
}


// I created a trail to follow and highlight the light source  -->  this function initialises this effect, creating these moving points (MP) with design 'fade'
// Points with design 'fade' have a special opacity attribute which can be used in this situation

function initLightTrail(lightPath){
	for (var t=0; t<360; t+=1){
		if (t%3 === 0){
			mp.push(new MP(lightPath(t),{x:0,y:0,z:0},20,'fade',false, t));
		}
	}
}

// Here I update the light trail, (see scene_elements.js)

function updateLightTrail(){
	for (var i=0; i<mp.length; i+=1){
		if (mp[i].design==='fade'){
			mp[i].trailOpacityUpdate(mp[0].t%360);
		}
	}
}

// radio button for controlling the render quality
function radioButton(name,X,Y,q){
	// draw the button
	noFill();
	strokeWeight(1);
	stroke(255,255,255,100);
	ellipse(X,Y,8,8);
	stroke(255,255,255,150);
	fill(255,255,255,60);
	if (quality === q){
		// if the button is already selected, place a point in the middle and make it bold
		strokeWeight(3);
		stroke(255,255,255,100);
		point(X,Y);
		fill(255,255,255,90);
	} else if (mouseIsPressed && mouseX>W/2+X-5 && mouseX<W/2+X+20+textWidth(name) && mouseY>H/2+Y-10 && mouseY<H/2+Y+10){
		// if the button is clicked, then update the variable 'quality', and reinitialise many of the functions
		quality = q;
		initCamera();
		initElementArrays();
		initLight();
		initColours();
		initSceneObjects();
		buildObjects();
		initFaces();
		initMovingPoints();
		initCustom();
	}
	noStroke();
	textAlign(LEFT,CENTER);
	text(name,X+15,Y);
}


// Info to explain to whoever first clicks on this project how the controls work etc...
function info(){
	fill(255,255,255,70);
	noStroke();
	textSize(13);
	scale(1,-1);
	textAlign(LEFT,BOTTOM);
	text('Tobias Loader',35-W/2,H/2-25);
	textAlign(RIGHT,BOTTOM);
	text("Press 'C' key for Controls",W/2-35,H/2-25);
	textAlign(RIGHT,TOP);
	text("Render Quality:",W/2-40,35-H/2);
	radioButton('Low',W/2-120,65-H/2,0.1);
	radioButton('Medium',W/2-120,20+65-H/2,0.3);
	radioButton('High',W/2-120,40+65-H/2,0.5);
	radioButton('Very High',W/2-120,60+65-H/2,0.7);
	radioButton('Insane',W/2-120,80+65-H/2,1);
	textAlign(LEFT,TOP);
	textSize(20);
	strokeWeight(3);
// 	stroke(255,255,255,50);
	fill(255,255,255,130);
	text("Solid 3D:  Space",35-W/2,35-H/2);
	scale(1,-1);
	
	if (keyIsDown(67)){
		alert('Controls:\n\nWASD - Forwards / Left / Backwards / Right\nXZ - Up / Down\nShift - Zoom\nDrag Mouse - Rotate Camera\nScroll - Barrel Roll\nEsc - Restart');
	}
}


// Mathematical function I wrote to determine how much the main and double colours should be lerped
function colourChangeF(startT,endT){
	if (mp[0].t%360<startT){
		return 1;
	} else if (mp[0].t%360<endT){
		return sq(cos((90*(mp[0].t%360 - startT))/(endT-startT)));
	} else {
		return 0;
	}
}

// A function to fade between the objects colours for colour switching
function fadeColourChange(){
	action = true;
	var colourChange = colourChangeF(180,300);
	for (var o=0; o<objects.length; o+=1){
		if (objects[o].colourdouble){
			if (colourChange===1) {
				objects[o].colour = objects[o].colourdouble[floor(mp[0].t/360)%objects[o].colourdouble.length];
			} else if (colourChange===0) {
				objects[o].colour = objects[o].colourdouble[floor(mp[0].t/360 + 1)%objects[o].colourdouble.length];
			} else {
				objects[o].colour = lerpColor(objects[o].colourdouble[floor(mp[0].t/360 + 1)%objects[o].colourdouble.length], objects[o].colourdouble[floor(mp[0].t/360)%objects[o].colourdouble.length], colourChange);
			}
		}
	}
}



// This initCustom() function is only run in setup(), so is only executed once
function initCustom(){
	randomStars();
	initLightTrail(lightPath);
}


// This drawExtras() function is executed in the main drawScene function, so is run many times
function drawExtras(){
	info();
	updateLightTrail();
	fadeColourChange();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  initScene below


// Inside of initScene is where all of the above functions are executed
function initScene(){
	initSceneOptions();
	initCamera();
	initElementArrays();
	initLight();
	initColours();
	initSceneObjects();
	buildObjects();
	initFaces();
	initMovingPoints();
	initCustom();
}


