

/*  -----     scene_elements.js     -----  */

// The contents of this file lay down the foundations of any scene, what it means to be a Point, Edge or Face.



class P {
	
	// The Point (P) is one of the two most fundamental elements, alongside the Face (F)
	
	// A Point in 3D space is more than just a 3D vector
	// Of course it has a postion, but also a size, design, and if its design is defined to 'fade' then also a trail parameter
	
	constructor (pos3,s,design,trailParameter){
		
		// The location of the point in three dimensions
		this.p3 = new Vector3(pos3.x,pos3.y,pos3.z);
		
		// If no size is defined, let it default to 10
		if (!s){ this.sizeScale = 10; } else { this.sizeScale = s;}
		
		// If no size is defined, let it default to 'plain'
		if (!design){ this.design = 'plain'; } else {this.design = design;}
		
		// If it is a special 'fade' point, then set up the extra attributes opacity and T
		if (this.design==='fade'){
			this.opacity = 0;
			this.T = trailParameter;
		}
	}
	
	// Map the point P from three dimensions into two dimensions using the map3To2() from camera.js
	pmap (){
		this.p2 = map3To2(cameras[camera],this.p3,this.sizeScale);
	}
	
	// Plot the 2D point on the screen according to the design attribute
	pplot (p){
		if (this.p2 && p){
			this.w = this.sizeScale*cameras[camera].zoom*cameras[camera].S/distance3(cameras[camera].P,this.p3);
			strokeWeight(this.w);
			if (this.design === 'plain'){
				stroke(255,255,255);
				this.p2.plotVector2();
			} else if (this.design === 'light'){
				stroke(255,255,255);
				this.p2.plotVector2();
				stroke(255,255,255,130);
				this.w *= 1.7;
				strokeWeight(this.w);
				this.p2.plotVector2();
				this.w *= 1.5;
				strokeWeight(this.w);
				this.p2.plotVector2();
				this.w *= 1.5;
				strokeWeight(this.w);
				this.p2.plotVector2();
				this.w *= 1.2;
				strokeWeight(this.w);
				this.p2.plotVector2();
			}  else if (this.design === 'asteroid'){
				stroke(255,255,255);
// 				strokeWeight(this.p2.w);
				point(this.p2.x-3*this.p2.w/15,this.p2.y+3*this.p2.w/15);
				point(this.p2.x+5*this.p2.w/15,this.p2.y+1*this.p2.w/15);
				point(this.p2.x-1*this.p2.w/15,this.p2.y-4*this.p2.w/15);
			}
			else if (this.design === 'fade'){
				stroke(255,255,255,this.opacity);
// 				strokeWeight(this.p2.w);
				point(this.p2.x,this.p2.y);
			}
		}
	}
	
	// Return the distance from the 3D point to the camera, see linear_algebra.js
	findDistToCamera(){
		return distance3(this.p3,cameras[camera].P);
	}
	
	// Return the square of the distance from the 3D point to the camera, see linear_algebra.js
	findDistToCameraSQ(){
		return distanceSQ3(this.p3,cameras[camera].P);
	}
	
	
	// If the design of the point is 'fade', then update its opacity according to how far through the trail is (this.T), and the location of the light (t)
	trailOpacityUpdate(t){
		if (this.T < t && this.T > t-40){
			this.opacity = 255*(40-t+this.T)/40;
		} else if (t<40 && this.T>320 &&  t+(360-this.T) < 40){
			this.opacity = 255*(40-(t+(360-this.T)))/40;
		} else {
			this.opacity = 0;
		}
	}
}

class MP extends P {
	
	// A special type of Point which Moves, hence it extends P
	
	// NB: Since typically Moving Points have close up interactions with the scene, they are sorted by proximity to the camera alongside the faces of the scene
	//     So they are always drawn in the right order. This enhances the three dimensional feel of the scene, however takes more compute power.
	//     In contrast, ordinary Points are not sorted and are instead always drawn behind everything else in the scene by default, no proximity comparisons are made.
	
	constructor (initpos3,vel3,s,design,path,trailParameter){
		super(initpos3,s,design,trailParameter);
		// The initial position of the Moving Point.
		this.initp3 = new Vector3(initpos3.x,initpos3.y,initpos3.z);
		// There are two sorts of moving points, the standard moving point where it travels in a straight line, or one which follows a path
		if (vel3){
			// This is a standard MP which has a linear velocity and can collide with objects in the scene (so long as they are not rotating)
			this.custompath = false;
			this.v3 = new Vector3(vel3.x,vel3.y,vel3.z);
			this.speed = this.v3.magn();
			this.collideDirection = 0;
			this.collideObjectRot = false;
			this.collideT = 0;
			this.scalarNV = 0;
			// this.t is how many steps of size this.v3 have been taken since the initial position to reach the current position of the point.
			this.t = 0;
		} else {
			// In this case, the MP has no specific linear velocity, and instead follows a custom predefined path
			this.custompath = true;
			this.path = path;
			this.t = 0;
		}
	}
	
	mpcollidefind(objectlist){
		// If this is the standard type of Moving Point (ie: not following a predefined path), then check for collisions in all objects in the objectlist
		if (!this.custompath){
			// If the moving point is on course to collide with a rotating object, then ignore (as I haven't finished developing this yet)
			if (this.collideObjectRot){
				this.collideDirection = 0;
				this.collideT = 0;
			} else {
				if (rotobjectid.length !== objects.length){
					var collisionData;
					// Each object in objectlist
					for (var j=0; j<objectlist.length; j+=1){
						// Each face in each of those objects
						for (var k=0; k<faceObject[objectlist[j]].length; k+=1){
							// If there is a potential collision, then collisionData will exist, otherwise it will return false
							collisionData = raySurfaceBouce(this,faceObject[objectlist[j]][k]);
							// If collisonData exists, it has format: [ bouceRayDir, scalarNV, t ]  (see collision.js)
							// If the moving point is on course to collide with a rotating object, then ignore (as I haven't finished developing this yet)
							if (collisionData){
								// if this collision is the closest one to the moving point (or there has been no previously recorded collision)
								if (collisionData[2]<this.collideT || !this.collideT){
									// assume the object that it might collide with is not rotating
									this.collideObjectRot = false;
									// check whether it is, if so, break the loop
									for (var l=0; l<rotobjectid.length; l+=1){				
										if (objectlist[j]==rotobjectid[l]){
											this.collideObjectRot = true;
											break;
										}
									}
									// if it isn't, update all the collision related attributes
									if (!this.collideObjectRot){
										this.collideT = collisionData[2];
										this.t = 0;
										this.collideDirection = collisionData[0];
										this.scalarNV = collisionData[1];
										this.initp3 = this.p3;
									}
								}
							}
						}
					}
				}
			}
		}
	}
	
	mpmove (){
		// Move the Moving Point
		// If it doesnt have a custom path, then...
		if (!this.custompath){
			// As long as the moving point is not too far away from the camera, then update its position
			if (this.findDistToCameraSQ() < movingdist*movingdist){
				// increase t by 1, this means we've taken another step in the direction of the velocity
				this.t += 1;
				// update the position
				this.p3 = addVector3(multScalarVector(this.t,this.v3),this.initp3);
				// if this now means that we have reached a collision, then update all attributes of the moving point
				if (this.collideT && this.t >= this.collideT -this.sizeScale/(2*this.scalarNV)){
					// new velocity and speed (see collision.js)
					this.v3 = this.collideDirection;
					this.speed = this.v3.magn();
					// new inital position, starting at where the collision occured
					this.initp3 = this.p3;
					this.t = 1;
					this.p3 = addVector3(this.v3,this.initp3);
					// initialise the collision attributes back to the default, ie: no collision found
					this.collideDirection = 0;
					this.collideT = 0;
					this.collideObjectRot = false;
					// look for the next collision
					this.mpcollidefind([...Array(objects.length).keys()]);
				}
			} else {
				// if the moving point is too far away from the camera, stop it from moving any further, save on computation
				this.v3 = new Vector3(0,0,0);
				this.speed = 0;
			}
		} else {
			// if a set path is defined, and the esc (escape) key is pressed, then reset the intial position of the MP to the start of the path
			if (keyIsDown(27)){
				this.t = 0;
			}
			// update the value of t (lightPathSpeed is in effect the new way to change the speed), if greater than 360, loop back around
			this.t += lightPathSpeed;
/*
			if (this.t>360){
				this.t = 0;
			}
*/
			// this.path is a function that calculates the next location along the path
			this.p3 = addVector3(this.initp3, this.path(this.t));
		}
	}
	
}


class E {
	// Edges consist of two Points (P), and plots a line between the two
	// It is both less important and less common when compared to either of the other two main elements, the Point (P) and the Face (F)
		
	constructor (p1, p2){
		this.p1 = p1;
		this.p2 = p2;
	}
	
	eplot (drawe, drawp){
		// draw the edge
		if (drawe){
			stroke(255,255,255,100);
			strokeWeight(1);
			line(this.p1.p2.x,this.p1.p2.y,this.p2.p2.x,this.p2.p2.y);
		}
		// draw the points on either side of the edge
		this.p1.pplot(drawp);
		this.p2.pplot(drawp);
	}
}

class F {
	
	// Along with the Point (P), the Face (F) is the other most fundamental element of any scene.
	
	constructor (pos1,pos2,pos3,colour,inside){
		
		// A face always has a triangular shape (determined by the three Points (P) passed as parameters),
		// as well as a colour and an indication where the 'inside' of the object (of which it is a single face) is.
		
// 		this.id = f.length;       // Not including an id, as not currently using it
		this.colour = colour;
		this.p1 = pos1;
		this.p2 = pos2;
		this.p3 = pos3;
		
		// The centre of the face, calculated from the three points which define it
		
		this.centre = new Vector3((1/3)*(this.p1.p3.x+this.p2.p3.x+this.p3.p3.x),(1/3)*(this.p1.p3.y+this.p2.p3.y+this.p3.p3.y),(1/3)*(this.p1.p3.z+this.p2.p3.z+this.p3.p3.z));
		
		// If I were using edges, then here I would define them
/*
		this.e1 = new E(this.p1, this.p2);
		this.e2 = new E(this.p1, this.p3);
		this.e3 = new E(this.p2, this.p3);
*/
		
		// The normal to the face, found by taking the cross product (see linear_algebra.js), and the direction of the face (using inside)
		// Primarily used for collision detection (see collision.js) and shading (see below)
		this.n = crossProduct3(subVector3(this.p2.p3,this.p1.p3),subVector3(this.p3.p3,this.p1.p3)).unit();
		this.direction = scalarProduct3(this.n, subVector3(inside,this.centre));
		if (this.direction){ this.direction /= abs(this.direction);}
		this.n = multScalarVector(this.direction,this.n);
		
		
		// Calculating the initial shading percentage of the face depending on its orientation relative to the light source, calculated using scalar products
		// If the lightType is far away, direction lighting is being used, (think how the sun illuminates a scene on earth, the light rays are assumed to be parallel)
		// If the lightType is close, positional lighting is being used, (think how a torch illuminates objects up close, and light is more radial)
		if (lightType === 'Far'){this.shading = scalarProduct3(this.n, lightDir);}
		else if (lightType === 'Close'){this.shading = scalarProduct3(this.n, subVector3(this.centre,lightPos).unit());} //+(pow(1.07,-distance3(this.centre,lightPos))-0.5)
		// Now using this shading metric, calculate the actual colour of the face
		this.shadedcolour = lerpColor(shadeColour, this.colour, (this.shading+1)/2);
	}
	
	fplot(drawe,drawp){
		// if the light source is moving, then update the shading (see above)
		if (mobilelight){
			if (lightType === 'Far'){
				this.shading = scalarProduct3(this.n, lightDir);
			} else if (lightType === 'Close'){
				this.shading = scalarProduct3(this.n, subVector3(this.centre,lightPos).unit()); // +(pow(1.0007,-distance3(this.centre,lightPos))-0.5)
			}
			this.shadedcolour = lerpColor(shadeColour, this.colour, (this.shading+1)/2);
		}
		
		// draw the face
		fill(this.shadedcolour);
		stroke(this.shadedcolour);
		strokeWeight(1);
		beginShape();
		vertex(this.p1.p2.x,this.p1.p2.y);
		vertex(this.p2.p2.x,this.p2.p2.y);
		vertex(this.p3.p2.x,this.p3.p2.y);
		vertex(this.p1.p2.x,this.p1.p2.y);
		endShape();
		
		// if drawe is true, also draw the edges
		if (drawe){
			stroke(lerpColor(shadeColour, this.colour, 0.5));
			strokeWeight(1);
			line(this.p1.p2.x,this.p1.p2.y,this.p2.p2.x,this.p2.p2.y);
			line(this.p1.p2.x,this.p1.p2.y,this.p3.p2.x,this.p3.p2.y);
			line(this.p2.p2.x,this.p2.p2.y,this.p3.p2.x,this.p3.p2.y);
		}
/*
		this.e1.eplot(drawe, drawp);
		this.e2.eplot(drawe, drawp);
		this.e3.eplot(drawe, drawp);
*/
		// if drawp is true, also draw the points
		this.p1.pplot(drawp);
		this.p2.pplot(drawp);
		this.p3.pplot(drawp);
	}
	
	fmap(){
		// map the three points (P) of the face
		this.p1.pmap();
		this.p2.pmap();
		this.p3.pmap();
	}
	
	findDistToCamera(){
		// find the distance to the camera from the centre of the face
		return distance3(this.centre,cameras[camera].P);
	}
	
	findDistToCameraSQ(){
		// find the square of the distance to the camera from the centre of the face
		return distanceSQ3(this.centre,cameras[camera].P);
	}
}