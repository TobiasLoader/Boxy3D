


/*  -----     scene_draw.js     -----  */

// Here is where we decide how to draw all of the information collected so far onto a screen





// This updates the light source, whether its direction ('Far') or its position ('Close') 
function movelight(){
	if (lightType === 'Far'){
		lightDir = lightPath(millis()/20);
	} else if (lightType === 'Close'){
		lightPos = mp[0].p3;
	}
}


// This function maps the scene from 3D to 2D
function mapScene(){
	if ((rotobjectio || dynamicrot) && rotobjectid.length){
		// if some objects are rotating, update faces and/or find new collisions
		if (dynamicrot){
			rotObjs();
			initFaces();
		}
		mapMovePoindFindCollisions(rotobjectid);
	}
	// map all the faces (F)
	for (var i=0; i<f.length; i+=1){
		f[i].fmap();
	}
	// map all the points (P)
	for (var i=0; i<p.length; i+=1){
		p[i].pmap();
	}
	// map all the moving points (MP), and move them, so long as they are not stationary or they follow a custom path
	for (var i=0; i<mp.length; i+=1){
		if (mp[i].speed || mp[i].custompath){
			mp[i].mpmove();
		}
		mp[i].pmap();
	}
}

// Plot all the points (P)
function drawPoints(){
	for (var i=0; i<p.length; i+=1){
		p[i].pplot(1);
	}
}

// Find the collisions between moving points (MP) and any objects in the object list which is passed as a parameter
function mapMovePoindFindCollisions(objectlist){
	for (var i=0; i<mp.length; i+=1){
		if (mp[i].speed){
			// Check the moving is not stationary before checking for collisions
			mp[i].mpcollidefind(objectlist);
		}
	}
}

// For every object in the rotobjectid list, rotate those objects, then rebuild them
function rotObjs(){
	for (var o=0; o<rotobjectid.length; o+=1){
		objects[rotobjectid[o]].rotate(objects[rotobjectid[o]].dynarot);
		objects[rotobjectid[o]].build(objects[rotobjectid[o]].dynarot);
	}
}

// Move all the faces from the 'faceObject' to 'f'  --> (see the initElementArrays function in scene_design.js for descriptions)
function initFaces(){
	f = [];
	for (var o=0; o<faceObject.length; o+=1){
		for (var i=0; i<faceObject[o].length; i+=1){
			f.push(faceObject[o][i]);
		}
	}
}

// Decide how to sort all the faces in order of proximity to the camera
function orderFaces(){
	elementorder = [];
	
	// If faceOrderMethod is 1, this is the more reliable method but may take a little longer as less optimisation
	if (faceOrderMethod===1){
		
		// For every face (F) in the scene, find its square distance to the camera, label its index and indicate that it is a face
		for (var i=0; i<f.length; i+=1){
			elementorder.push([f[i].findDistToCameraSQ(),i,'f']);
		}
		
		// For every moving point (MP) in the scene, find its square distance to the camera, label its index and indicate that it is a moving point
		// The only condition is that it either isn't a 'fade' design, or if it is then opacity is not zero
		for (var i=0; i<mp.length; i+=1){
			if (mp[i].design !=='fade' || mp[i].opacity>0){
				elementorder.push([mp[i].findDistToCameraSQ(),i,'mp']);
			}
		}
		
		// Bubble sort like algorithm at the moment to travel through the array and sort, such that by the first pass, the closest face is at the end of the array etc...
		// If any two items are in the wrong order, switch them.
		var temp;
		for (var i=0; i<elementorder.length-1; i+=1){
			for (var j=0; j<elementorder.length-i-1; j+=1){
				if (elementorder[j][0] < elementorder[j+1][0]){
					temp = elementorder[j];
					elementorder[j] = elementorder[j+1];
					elementorder[j+1] = temp;
				}
			}
		}
	}
	
	// If faceOrderMethod is 2, this is the less reliable method as takes shortcuts so may be a little faster as more optimisation
	else if (faceOrderMethod===2){
		// My idea behind this method is determine which objects are closest to the camera by their centres
		// Then sort each object individually so its own faces are all in the right order
		// Then add these clusters of faces to the main list according to the order determined by their centres
		
		// Use the same bubble sort method as was used for all faces in method 1, this time to sort only the centres of the objects (see faceOrderMethod===1 above)
		objectordercentre = [];
		var temp;
		for (var i=0; i<cp.length; i+=1){
			objectordercentre.push([cp[i].findDistToCameraSQ(),i]);
		}
		for (var i=0; i<objectordercentre.length-1; i+=1){
			for (var j=0; j<objectordercentre.length-i-1; j+=1){
				if (objectordercentre[j][0] < objectordercentre[j+1][0]){
					temp = objectordercentre[j];
					objectordercentre[j] = objectordercentre[j+1];
					objectordercentre[j+1] = temp;
				}
			}
		}
		
		// Then for each object, order the faces (again see method 1, this is the same just for individual objects, so a face from one object is not compared with a face from another)
		var tempobjectorder = [];
		for (var i=0; i<objects.length; i+=1){
			var objectorder = [];
			for (var j=0; j<faceObject[i].length; j+=1){
				objectorder.push([faceObject[i][j].findDistToCameraSQ(),j]);
			}
			for (var j=0; j<objectorder.length-1; j+=1){
				for (var k=0; k<objectorder.length-j-1; k+=1){
					if (objectorder[k][0] < objectorder[k+1][0]){
						temp = objectorder[k];
						objectorder[k] = objectorder[k+1];
						objectorder[k+1] = temp;
					}
				}
			}
			tempobjectorder.push(objectorder);
		}
		
		// Now add these ordered faces for each object to elementorder in the order of the objects centres
		for (var i=0; i<objectordercentre.length; i+=1){
			for (var j=0; j<tempobjectorder[objectordercentre[i][1]].length; j+=1){
				temp = tempobjectorder[objectordercentre[i][1]][j];
				if (objectordercentre[i][1]){
					// To get the correct id we need to add the faces' individual id within its own object, and the parent objects' location through the array f using faceIDByObject
					elementorder.push([temp[0],temp[1] + faceIDByObject[objectordercentre[i][1]-1],'f']);
				} else {
					elementorder.push([temp[0],temp[1],'f']);
				}
			}
		}
		
		// The moving points (MP) are now inserted into the elementorder array at the right location
		var mpeleorder;
		var found = false;
		for (var i=0; i<mp.length; i+=1){
			found = false;
			mpeleorder = [mp[i].findDistToCameraSQ(),i,'mp'];
			// step throught the elementorder array until the moving point is behind any other element in the scene
			for (var j=0; j<elementorder.length-1; j+=1){
				if (elementorder[j][0]<mpeleorder[0]){
					elementorder.splice(j+1,0,mpeleorder);
					found = true;
					break;
				}
			}
			// if this is never the case, then add it to the front
			if (!found){
				elementorder.push(mpeleorder);
			}
		}
	}
}

// Draw all of the elements (primarily faces) in scene
function drawFaces(){
	// first order the faces (see above to orderFaces())
	orderFaces();
	// The step throught the elementorder array, plot each element in turn from the furtherst away element, to the closest one
	for (var i=0; i<elementorder.length; i+=1){
		if (elementorder[i][2]==='f'){
			f[elementorder[i][1]].fplot(drawfaceedges,drawfacepoints);
		} else if (elementorder[i][2]==='mp'){
			mp[elementorder[i][1]].pplot(1);
		}
	}
}


// draw the whole scene
function drawScene() {
	// change the cursor to 'pointer'
	cursor("pointer");
	background(cS[0]);
	translate(W/2,H/2);
	scale(1,-1);
	
	// map then draw all elements of the scene
	mapScene();
	drawPoints();
	drawFaces();
	
	// This is a compilation of custom functions defined in scene_design.js designed specifically for this scene
	drawExtras();
}