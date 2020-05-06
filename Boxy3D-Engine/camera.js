

/*  -----     camera.js     -----  */

// This file describes all the functions of a camera, how it should move and rotate in 3D space, and how to map a three dimensional point down onto two dimensions.



// This function calculates how fast the camera should be moving (translating: up/down/left/right/forwards/backwards)
// The longer the key is pressed, the faster it moves until it reaches the maximum speed defined by the camera
function moveSpeed(currentT,maxT,maxSpeed,type){
	if (currentT<maxT){
		return maxSpeed/(1 + pow(10,(-2/maxT)*(currentT - maxT/2)));
	} else {
		return maxSpeed;
	}
}

//  This function maps a 3D vector onto a 2D plane (ie: your screen)
function map3To2(C,V,sizeMult){
    var scalars = matrixVectorProduct(invMatrix(new Matrix3(V.x-C.P.x,-C.r.x,-C.u.x,V.y-C.P.y,-C.r.y,-C.u.y,V.z-C.P.z,-C.r.z,-C.u.z)),multScalarVector(C.S,C.D));
    // scalars.x: if this is negative, then the object is behind the camera, so it shouldn't be drawn on the screen
	if (scalars.x>0){
		if (!sizeMult){
			sizeMult = 1;
		}
		// scalars.y: the x-coordinate of the 2D point on the screen
		// scalars.z: the y-coordinate of the 2D point on the screen
		// C.zoom is the zoom factor determined by the camera, which scales everything up as C.zoom increases from 1
		// sizeMult the size (in 3D) of the point that's being mapped. 
	    // This is scaled according to its distance from the camera and the zoom factor to find the equivalent size of the 2D point
		return new Vector2(scalars.y*C.zoom,scalars.z*C.zoom);
	} else {
		return 0;
	}
}


class Camera {
	
	// The camera obviously plays a crucial role in the 3D engine.
	// Among its properties are
	// 		- its position vector, where it is in space
	//		- its direction vector, which way is it pointing (which way is forwards from the users perspective)
	// 		- the camera to surface distance is how far away from the centre of camera is the closest point of the plane upon which we map the 3D scene.
	//		  Think of the browser window as this plane on which we collapse the 3D scene, and the camera as your eyes.
	//		  This parameter determines the distance from your eyes to the closest point on the screen.
	//		  Really close up and everything looks fish eye (like a Go-Pro camera)
	//		  Really far away and everything looks very flat (loss of depth)
	//		- the maximum speed at which the camera can translate
	
	constructor(positionVector,directionVector,cameraSurfaceDist,maxSpeed) {
		this.P = positionVector; // Camera Position
		this.D = directionVector; // Camera Direction (ie: where 'forward' is)
		this.S = cameraSurfaceDist; // Camera Surface distance
		this.V = maxSpeed;
		// Initialising the directions of 'up' and 'right'  --->  NB: the (X-axis is RIGHT, Y-axis is FORWARDS, Z-axis is UP)
		this.u = k; // z-axis
        this.r = i; // x-axis
        this.rx = 0;
        this.uz = 0;
        this.zoom = 1;
	}
	
	move (vectorDirection,frameCurrent,frameTime){
		// Moving the camera along its (up/down/left/right/forwards/backwards)
		this.P = addVector3(this.P,multScalarVector(moveSpeed(frameCurrent,frameTime,this.V),vectorDirection));
	}
	
	rotate (ar,au,af){
		
		// THIS IS THE ONLY PART OF THE WHOLE PROJECT I DID SOME RESEARCH ON BEFORE REACHING A SOLUTION
		// I attempted this problem in many different ways before deciding to read up some mathematical theory behind three dimensional rotation.
		// Having learned some new maths I then was able to solve the problem.
				
		// ar: angle of rotation about the 'right' axis    -->   drag left/right
		// au: angle of rotation about the 'up' axis       -->   drag up/down
		// af: angle of rotation about the 'forward' axis  -->   scroll
		if (!af){
			af = 0;
		}
		// 3x3 matrix describing rotation along my 'up' axis (which is constantly changing as we rotate)
		var MalongUp = new Matrix3(
				cos(ar) + this.u.x*this.u.x*(1-cos(ar)),this.u.x*this.u.y*(1-cos(ar))-this.u.z*sin(ar),this.u.x*this.u.z*(1-cos(ar))+this.u.y*sin(ar),
				this.u.y*this.u.x*(1-cos(ar))+this.u.z*sin(ar),cos(ar) + this.u.y*this.u.y*(1-cos(ar)),this.u.y*this.u.z*(1-cos(ar))-this.u.x*sin(ar),
				this.u.z*this.u.x*(1-cos(ar))-this.u.y*sin(ar),this.u.y*this.u.z*(1-cos(ar))+this.u.x*sin(ar),cos(ar) + this.u.z*this.u.z*(1-cos(ar)));
		// 3x3 matrix describing rotation along my 'up' axis (which is constantly changing as we rotate)
		var MalongRight = new Matrix3(
				cos(au) + this.r.x*this.r.x*(1-cos(au)),this.r.x*this.r.y*(1-cos(au))-this.r.z*sin(au),this.r.x*this.r.z*(1-cos(au))+this.r.y*sin(au),
				this.r.y*this.r.x*(1-cos(au))+this.r.z*sin(au),cos(au) + this.r.y*this.r.y*(1-cos(au)),this.r.y*this.r.z*(1-cos(au))-this.r.x*sin(au),
				this.r.z*this.r.x*(1-cos(au))-this.r.y*sin(au),this.r.y*this.r.z*(1-cos(au))+this.r.x*sin(au),cos(au) + this.r.z*this.r.z*(1-cos(au)));
		
		// the new 'up' axis is the old one rotated along the 'right axis'
		this.u = matrixVectorProduct(MalongRight,this.u);
		// the new 'right' axis is the old one rotated along the 'up axis'
		this.r = matrixVectorProduct(MalongUp,this.r);
		
		// if we also have some rotation along the 'forwards axis'... do the same, and redefine the 'up' and 'right' axes
		if (af){
			var MalongForward = new Matrix3(
					cos(af) + this.D.x*this.D.x*(1-cos(af)),this.D.x*this.D.y*(1-cos(af))-this.D.z*sin(af),this.D.x*this.D.z*(1-cos(af))+this.D.y*sin(af),
					this.D.y*this.D.x*(1-cos(af))+this.D.z*sin(af),cos(af) + this.D.y*this.D.y*(1-cos(af)),this.D.y*this.D.z*(1-cos(af))-this.D.x*sin(af),
					this.D.z*this.D.x*(1-cos(af))-this.D.y*sin(af),this.D.y*this.D.z*(1-cos(af))+this.D.x*sin(af),cos(af) + this.D.z*this.r.z*(1-cos(af)));
			this.u = matrixVectorProduct(MalongForward,this.u);
			this.r = matrixVectorProduct(MalongForward,this.r);
		}
		// take the cross product between 'right' and 'up' to find the 'forward' direction of the camera
		this.D = multScalarVector(-1,crossProduct3(this.r,this.u)).unit();
		
		
		// error builds up over time when computing rotation about the axes
		// the 'up' and 'right' axes end up no longer being perpendicular
		// therefore I devised a simple test, if the error in angle is + or - 0.5 degrees from 90, then correct the axes
		if (abs(angleBetween(this.u,this.r)-90)>0.5){
			if (angleBetween(this.u,this.r)>0.5){
				var ac = 90-angleBetween(this.u,this.r);
			} else {
				var ac = angleBetween(this.u,this.r)-90;
			}
			// ac: the angle by which the 'right' axis must be corrected such that 'right' and 'up' are once again perpendicular
			var MalongForward = new Matrix3(
				cos(ac) + this.D.x*this.D.x*(1-cos(ac)),this.D.x*this.D.y*(1-cos(ac))-this.D.z*sin(ac),this.D.x*this.D.z*(1-cos(ac))+this.D.y*sin(ac),
				this.D.y*this.D.x*(1-cos(ac))+this.D.z*sin(ac),cos(ac) + this.D.y*this.D.y*(1-cos(ac)),this.D.y*this.D.z*(1-cos(ac))-this.D.x*sin(ac),
				this.D.z*this.D.x*(1-cos(ac))-this.D.y*sin(ac),this.D.y*this.D.z*(1-cos(ac))+this.D.x*sin(ac),cos(ac) + this.D.z*this.r.z*(1-cos(ac)));
			this.r = matrixVectorProduct(MalongForward,this.r);
			// Having applied this rotation on the 'right' axis, 'right' and 'up' are once again at right angles
		}
	}
}

