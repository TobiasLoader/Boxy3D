


/*  -----    io.js     -----  */

// This file allows user input into the scene, for example to move the camera, rotate it, zoom etc...



// The function mouseMoved() determines what should occur when the mouse is moved (and dragged)
function mouseMoved(){
	// check the mouse is pressed
	if (mouseIsPressed){
		action = true;
	}
	if (mouseX-pmouseX || mouseY-pmouseY){
		// check the mouse has moved
		// if it has moved, then the scene will have changed in some way, so action should be true
		action = true;
		if (mouseIsPressed){
			// change the cursor type to 'move'
			cursor("move");
			if (rotobjectio){
				// if rotobjectio is true, then for every object in the list rotobjectid, rotate it and rebuild the object
				for (var o=0; o<rotobjectid.length; o+=1){
					objects[rotobjectid[o]].rotate({x:-(pmouseX-mouseX)/8,y:-(pmouseY-mouseY)/8,z:0});
					objects[rotobjectid[o]].build();
				}
				// initialise the faces again
				initFaces();
			} else {
				// otherwise just rotate the camera
				cameras[camera].rotate(-(pmouseX-mouseX)/10,-(pmouseY-mouseY)/10,0);
			}
		}
	}
}

// this function returns the 'amount' by which a key has been pressed -- this is used to accelerate the camera when one of WASDZX has been pressed (smooth transition)
function movingKey(k,codes,frameTime){
	// check if any of the valid keys have been pressed that triggers some action (eg: both W and the UP arrow key trigger the event of the camera moving 'forwards')
	var anyKeyDown = false;
	for (var i=0; i<codes.length; i+=1){
		if (keyIsDown(codes[i])){
			anyKeyDown = true;
		}
	}
	if (anyKeyDown){if (k>=frameTime){return frameTime;} else {return k+1;}} else {if (k>frameTime){return frameTime;} else if (k<0) {return 0;} else {return k-1;}}
}


// Which keys trigger which actions
function keyInput(glide){
	keys.left = movingKey(keys.left,[37,65],glide);
	keys.right = movingKey(keys.right,[39,68],glide);
	keys.up = movingKey(keys.up,[38,87],glide);
	keys.down = movingKey(keys.down,[40,83],glide);
	keys.inwards = movingKey(keys.inwards,[88],glide);
	keys.outwards = movingKey(keys.outwards,[90],glide);
	keys.zoom = movingKey(keys.zoom,[16],glide);
	for (var i = 49; i<58; i+=1){
		if (keyIsDown(i)){
			if (i-49 < cameras.length){
				camera = i-49;
			}
		}
	}
}


function controlCamera(cam,glide){
	
	// if there are any moving points in the scene (MP) which are actually moving (non zero speed) then action = true as the scene is changing
	action = false;
	if (mp.length){
		for (var i=0; i<mp.length; i+=1){
			if (mp[i].speed){
				action = true;
				break;
			}
		}
	}
	
	// if any objects in the scene are rotating
	if (dynamicrot && rotobjectid.length){
		action = true;
	}
	
	// check all the keys if they are pressed (see above)
	keyInput(glide);
	// update the camera's position according to the keys being pressed
	if (keys.left>1){cam.move(multScalarVector(-1,cam.r),keys.left,glide);action=true;}
	if (keys.right>1){cam.move(cam.r,keys.right,glide);action=true;}
	if (keys.up>1){cam.move(cam.D,keys.up,glide);action=true;}
	if (keys.down>1){cam.move(multScalarVector(-1,cam.D),keys.down,glide);action=true;}
	if (keys.inwards>1){cam.move(cam.u,keys.inwards,glide);action=true;}
	if (keys.outwards>1){cam.move(multScalarVector(-1,cam.u),keys.outwards,glide);action=true;}
	if (keys.zoom>1){cam.zoom=1+keys.zoom/10;action=true;}
		
	// check if the mouse has moved
	mouseMoved();
	
}


// if the user scrolls, then it rotates the camera around the 'forward' axis
function mouseWheel(event) {
	action = true;
	cameras[camera].rotate(0,0,event.delta/30);
}


// if the window is resized, resize the canvas, and readjust the camera to surface distance attribute to make it responsive (see camera.js)
function windowResized() {
	action = true;
	resizeCanvas(windowWidth, windowHeight);
	W = windowWidth;
	H = windowHeight;
	cameras[camera].S = (22*sqrt(width*height/1000));
	resizeCanvas(windowWidth, windowHeight);
};

