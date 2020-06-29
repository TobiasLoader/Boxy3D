
/*  -----     collision.js     -----  */

// This file contains a single function which takes as parameters a single moving point (MP) and a face (F) (see scene_elements.js).
// It returns whether a collision could occur and if so, when will it happen and in which direction would the collided moving point now be travelling.
// NB: Reflection only occurs if the moving point has no set path, and if the face is stationary (ie: the object it belongs to is not rotating)



function raySurfaceBouce(mpoint,face){
		
    // Direction vectors along the surface of the face. Each one going from the point p1 to either one of p2 or p3
    // The points objects face.p1, face.p2 and face.p3 are all instances of the P (point) class.
    // These have the property .p3 which is the 3D vector describing the points position.
    // Don't get confused with the p3 attribute of a F (face) object (the face's third point), and the p3 attribute of a P (point) object (it's 3D vector)
    var D1 = new Vector3(face.p2.p3.x-face.p1.p3.x,face.p2.p3.y-face.p1.p3.y,face.p2.p3.z-face.p1.p3.z);
    var D2 = new Vector3(face.p3.p3.x-face.p1.p3.x,face.p3.p3.y-face.p1.p3.y,face.p3.p3.z-face.p1.p3.z);
    
    // Instead of the face with finite area, we will now consider the infinite plane which contains the face,
    // and has parametric equation: r = face.p1 + lambda * D1 + mu * D2
    
    // Difference between position vectors (initial position of the moving point and the face's p1 point).
    var PositionDiff = new Vector3(mpoint.initp3.x-face.p1.p3.x,mpoint.initp3.y-face.p1.p3.y,mpoint.initp3.z-face.p1.p3.z);
    
    // Matrix of coefficients from a 3-way system of linear simultaneous equation,
    // which I derived when trying to find a potential intercept between the moving point and the face.
    // mpoint.v3 is a three dimensional vector defined by the velocity of the moving point (direction and mpoint.v3.magn() is its speed)
    var CoeffMatrix = new Matrix3(D1.x,D2.x,mpoint.v3.x,D1.y,D2.y,mpoint.v3.y,D1.z,D2.z,mpoint.v3.z);
    // Inverse of coefficient matrix to solve for the scalars, lambda, mu and t.
    // Lambda and Mu uniquely determine where on the infinite plane the collision will occur
    // Lambda represents the scalar quantity moved along the vector D1 from face.p1 to reach the location of the collision
    // Mu represents the scalar quantity moved along the vector D2 from face.p1 to reach the location of the collision
    // t is the number of time steps required before the moving point collides with the face at the location determined by Lambda and Mu
    var CoeffMatrixInv = invMatrix(CoeffMatrix);
    // A vector containing the scalar quantities, lambda, mu and t.
    var scalars = matrixVectorProduct(CoeffMatrixInv,PositionDiff);
    var lambda = scalars.x;
    var mu = scalars.y;
    var t = -scalars.z;
    
    // The location of of the collision is equal to both (face.p1 + lambda * D1 + mu * D2) and (mpoint.initp3 + t * mpoint.v3)
    
    // Conditions for the collision to occur:
    //		-  the location of the collision must be on the face (ie: lambda>0 and mu>0 and lambda + mu < 1)
    //      -  when collisions occur, we must make sure each is a clean bounce, so prevent many occuring in very short succession (t>mpoint.speed/2)
    //		-  the collision must occur forwards in time, ie: it lies along the moving points forward direction (scalarProduct3(PositionDiff,mpoint.v3)<0)
    
    if (lambda>0 && mu>0 && lambda + mu < 1 && t>mpoint.speed/2 && scalarProduct3(PositionDiff,mpoint.v3)<0){
	    // Normal to face.
		var n = face.n;
	    // A scalar along the normal to the plane from t=0 to find a single reflected point on the other side
	    var alpha = -2*scalarProduct3(PositionDiff,n)/(n.magn()*n.magn());
	    // The parametric form of the moving point after it bounced off of the face
	    var newPosition = new Vector3(mpoint.initp3.x + t*mpoint.v3.x,mpoint.initp3.y + t*mpoint.v3.y,mpoint.initp3.z + t*mpoint.v3.z);
	    
	    // the speed of the moving point after the bounce will be less, scaled by the coefficient of restitution
	    var bouceRayDir = multScalarVector(-new Vector3(mpoint.v3.x,mpoint.v3.y,mpoint.v3.z).magn() * coefficientOfRestitution, new Vector3(alpha*n.x-t*mpoint.v3.x,alpha*n.y-t*mpoint.v3.y,alpha*n.z-t*mpoint.v3.z).unit());
	    
	    // A scalar between the direction of the normal to the face and the velocity of the moving point
	    var scalarNV = abs(scalarProduct3(n.unit(),mpoint.v3.unit()))*mpoint.speed;
	    
	    // The returned values
	    return [bouceRayDir,scalarNV,t];
    } else {
    	return false;
    }
}