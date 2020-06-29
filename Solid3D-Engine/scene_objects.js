

/*  -----     scene_objects.js     -----  */

// Here are the geometric objects which populate any given scene, these are constructed primarily to contain hundreds of points (P) and faces (F) --> (see scene_elements.js)



// This is the parent 3D object

class SceneObject {
	constructor (newObject,c,colour,rot,dynarot,rotcentre,colourdouble){
		// Every 3D object has its own place in the faceObject array, an array of {array of faces} --> (each array of faces corresponds to a new object)
		// Every face initialised by each object ends up in the faceObject array
// 		if (newObject){
// 			objectNum += 1;
			faceObject.push([]);
// 		}
		// Every 3D object has its id, corresponding, to its index position in the faceObject array
		this.id = faceObject.length-1;
		
		// Also every object has a centre..
		this.c = c;
		// ..which is added to the list of centres, cp (see scene_design.js)
		cp.push(new P(c));
		
		// And its own colour and intial rotation (colourdouble is something I added for a colour change every time the light source goes through the torus in this scene)
		this.colour = colour;
		if (colourdouble){
			this.colourdouble = [colour];
			for (var i=0; i<colourdouble.length; i+=1){
				this.colourdouble.push(colourdouble[i]);
			}
		} else {
			this.colourdouble = false;
		}
		this.rot = rot;
		
		// Check if it rotates
		if (dynarot && (dynarot.x || dynarot.y || dynarot.z) && (dynamicrot || rotobjectio)){
			this.dynarot = dynarot;
			rotobjectid.push(this.id);
		} else {
			this.dynarot = {x:0, y:0, z:0};
		}
		
		if (rotcentre){
			this.rotcentre = rotcentre;
		} else {
			this.rotcentre = this.c;
		}
		
		// The three rotation matrices for rotation of the object about each of the x,y and z axes
		this.rX = new Matrix3(1,0,0,0,cos(this.rot.z),-sin(this.rot.z),0,sin(this.rot.z),cos(this.rot.z));
		this.rY = new Matrix3(cos(this.rot.y),0,-sin(this.rot.y),0,1,0,sin(this.rot.y),0,cos(this.rot.y));
		this.rZ = new Matrix3(cos(this.rot.x),-sin(this.rot.x),0,sin(this.rot.x),cos(this.rot.x),0,0,0,1);
	}
	
	rotate (R){
		// Update the current rotation of the object
		this.rot = {x:this.rot.x+R.x,y:this.rot.y+R.y,z:this.rot.z+R.z};
		// Update the three rotation matrices for rotation of the object about each of the x,y and z axes
		this.rX = new Matrix3(1,0,0,0,cos(this.rot.z),-sin(this.rot.z),0,sin(this.rot.z),cos(this.rot.z));
		this.rY = new Matrix3(cos(this.rot.y),0,-sin(this.rot.y),0,1,0,sin(this.rot.y),0,cos(this.rot.y));
		this.rZ = new Matrix3(cos(this.rot.x),-sin(this.rot.x),0,sin(this.rot.x),cos(this.rot.x),0,0,0,1);
	}
}


///////////// 2D   --   Below are 2D objects that 3D objects are allowed to use in their construction 


// The Circle:
// 		- we can choose which plane it should be defined in ('XY','XZ','YZ')
//		- we can choose the 3D objects' centre (c1) --> this allows correct shading
//		- we can choose the circles own centre (c2)
// 		- we can choose two different radii, so it can be any form of ellipse (r1, r2)
// 		- we can choose its colour
// 		- we can choose its initial rotation
// 		- we can choose its id (same as parent object) --> (see above SceneObject id attribute)
//		- we can choose the amount by which we shift the angle (ie: to be able to line things up if necessary)

class Circle {
	constructor (plane, c1, c2, r1, r2, colour, tiles, rot, id, angleShift){
		
		// if angleShift is not defined then let it be 0
		if (!angleShift){angleShift = 0;}
		
		this.rot = rot;
		
		// the list of vectors vs is a list of all vectors in the circle
		var vs = [[origin]];
		
		// construct the list of all vectors (vs)
		// we are actually creating a polygon with 'tiles' number of sides
		vs.push([]);
		if (plane==='XY'){
			for (var i=0; i<=tiles; i+=1){
				vs[1].push(new Vector3(r1*sin(360*i/tiles + angleShift), r2*cos(360*i/tiles + angleShift), 0));
			}
		}else if (plane==='XZ'){
			for (var i=0; i<=tiles; i+=1){
				vs[1].push(new Vector3(r1*sin(360*i/tiles + angleShift), 0, r2*cos(360*i/tiles + angleShift)));
			}
		}else if (plane==='YZ'){
			for (var i=0; i<=tiles; i+=1){
				vs[1].push(new Vector3(0, r1*sin(360*i/tiles + angleShift), r2*cos(360*i/tiles + angleShift)));
			}
		} else {
			print('Not a valid Circle Definition')
		}
		
		// define the rotation matrices
		this.rX = new Matrix3(1,0,0,0,cos(this.rot.z),-sin(this.rot.z),0,sin(this.rot.z),cos(this.rot.z));
		this.rY = new Matrix3(cos(this.rot.y),0,-sin(this.rot.y),0,1,0,sin(this.rot.y),0,cos(this.rot.y));
		this.rZ = new Matrix3(cos(this.rot.x),-sin(this.rot.x),0,sin(this.rot.x),cos(this.rot.x),0,0,0,1);
		
		// apply the rotation to the list of vectors vs (see scene_funcs.js)
		vs[0] = new applyRotationToTileLists(multScalarVector(2,subVector3(c2,c1)),vs[0],0,c1,this.rX,this.rY,this.rZ); 
		vs[1] = new applyRotationToTileLists(multScalarVector(2,subVector3(c2,c1)),vs[1],tiles,c1,this.rX,this.rY,this.rZ);
		
		// convert all vectors to points
		var ps = tileVectorToPoints(vs);
		
		// append the circle faces to faceObject at the same index position as the parent object (the 3d object making use of the circle in its construction)
		for (var i=0; i<vs[1].length-1; i+=1){
			faceObject[id].push(new F(ps[0][0],ps[1][i],ps[1][i+1], colour, c1));
		}
	}
}


///////////// 3D   --   Below are the 3D objects which populate the scene


class Cuboid extends SceneObject {
	constructor (newObject, c, w, h, d, colour, tiles, rot, dynarot, rotcentre, tileMethod, colourdouble){
		
		// Since Cuboid is a 3D object, it draws on its parent class SceneObject
		super(newObject, c,colour, rot, dynarot, rotcentre, colourdouble);
		
		// A cuboid also has attributes: number of tiles, width, height and depth
		this.w = w;
		this.h = h;
		this.d = d;
		
		// The default method to tile the cuboid is method 1, if another is specified (ie: 2) then use that instead
		
		// Method 1: Uses six objects of class Circle. Each Circle is defined with only 4 tiles, so they in fact make up 6 squares, and hence combine to make a cube.
		// 			 This method is very efficient as use very few faces also when drawn we can see very few to no visible defects (where faces are drawn in the wrong order)
		// Method 2: Uses a tiling of faces as you might see kitchen tiles. It has a variable number of faces, but there are defects
		
		if (!tileMethod){ this.tileMethod = 1;}
		else {this.tileMethod = tileMethod;}
		
		// If Method 2 is chosen, define this.tiles and v1 through to v8, (vertices of the Cuboid)
		
		if (this.tileMethod===2){
			if (tiles[0]){
				this.tiles = tiles;
			} else {
				this.tiles = [tiles,tiles,tiles];
			}
			this.v1 = {x:w, y:h, z:d};
			this.v2 = {x:w, y:h, z:-d};
			this.v3 = {x:w, y:-h, z:d};
			this.v4 = {x:w, y:-h, z:-d};
			this.v5 = {x:-w, y:h, z:d};
			this.v6 = {x:-w, y:h, z:-d};
			this.v7 = {x:-w, y:-h, z:d};
			this.v8 = {x:-w, y:-h, z:-d};
		}
	}
	
	
	// Where the Cuboid is 'built', its faces are constructed and added to the array faceObject
	build (){
		
		// Clear faceObject[this.id] in case it was already populated (eg: a previous rotation of the same object)
		faceObject[this.id] = [];
		
		// If Method 1 is used, then draw the 6 circles, each shifted by 45 degrees since the way Circle is defined with sin and cos (see Circle above)
		if (this.tileMethod===1){
			new Circle('YZ',this.c,{x:this.c.x+this.w/2,y:this.c.y,z:this.c.z},this.h/sqrt(2),this.d/sqrt(2),this.colour,4,this.rot,this.id,45);
			new Circle('YZ',this.c,{x:this.c.x-this.w/2,y:this.c.y,z:this.c.z},this.h/sqrt(2),this.d/sqrt(2),this.colour,4,this.rot,this.id,45);
			new Circle('XZ',this.c,{x:this.c.x,y:this.c.y+this.h/2,z:this.c.z},this.w/sqrt(2),this.d/sqrt(2),this.colour,4,this.rot,this.id,45);
			new Circle('XZ',this.c,{x:this.c.x,y:this.c.y-this.h/2,z:this.c.z},this.w/sqrt(2),this.d/sqrt(2),this.colour,4,this.rot,this.id,45);
			new Circle('XY',this.c,{x:this.c.x,y:this.c.y,z:this.c.z+this.d/2},this.w/sqrt(2),this.h/sqrt(2),this.colour,4,this.rot,this.id,45);
			new Circle('XY',this.c,{x:this.c.x,y:this.c.y,z:this.c.z-this.d/2},this.w/sqrt(2),this.h/sqrt(2),this.colour,4,this.rot,this.id,45);
		}
		
		// If Method 2 is used instead, then create a list of vectors which spans across each edge, then apply rotations etc.. to each list.
		// Then combine these lists to create a grid of points (P) across each side of the cuboid, then tile these and create faces, appending them to the list faceObject
		else if (this.tileMethod===2){
			var v12 = applyRotationToTileLists(this.v8,generateLerpLists(this.v1,this.v2,this.tiles[0]),this.tiles[0],this.c,this.rX,this.rY,this.rZ);
			var v13 = applyRotationToTileLists(this.v8,generateLerpLists(this.v1,this.v3,this.tiles[1]),this.tiles[1],this.c,this.rX,this.rY,this.rZ);
			var v15 = applyRotationToTileLists(this.v8,generateLerpLists(this.v1,this.v5,this.tiles[2]),this.tiles[2],this.c,this.rX,this.rY,this.rZ);
			var v84 = applyRotationToTileLists(this.v1,generateLerpLists(this.v8,this.v4,this.tiles[2]),this.tiles[2],this.c,this.rX,this.rY,this.rZ);
			var v86 = applyRotationToTileLists(this.v1,generateLerpLists(this.v8,this.v6,this.tiles[1]),this.tiles[1],this.c,this.rX,this.rY,this.rZ);
			var v87 = applyRotationToTileLists(this.v1,generateLerpLists(this.v8,this.v7,this.tiles[0]),this.tiles[0],this.c,this.rX,this.rY,this.rZ);
					
			tilingProcess(tilePointsSquare(v12,v15,[this.tiles[0],this.tiles[2]],this.c),this.colour,this.c,this.id);
			tilingProcess(tilePointsSquare(v12,v13,[this.tiles[0],this.tiles[1]],this.c),this.colour,this.c,this.id);
			tilingProcess(tilePointsSquare(v13,v15,[this.tiles[1],this.tiles[2]],this.c),this.colour,this.c,this.id);
			tilingProcess(tilePointsSquare(v84,v86,[this.tiles[2],this.tiles[1]],this.c),this.colour,this.c,this.id);
			tilingProcess(tilePointsSquare(v84,v87,[this.tiles[2],this.tiles[0]],this.c),this.colour,this.c,this.id);
			tilingProcess(tilePointsSquare(v86,v87,[this.tiles[1],this.tiles[0]],this.c),this.colour,this.c,this.id);
		}
		
		// Update faceIDByObject array
		addFaceIDByObject(this.id);
	}
}


class Pyramid extends SceneObject {
	constructor (newObject, c, w, h, d, colour, tiles, rot, rotcentre, dynarot, colourdouble){
		
		// Since Pyramid is a 3D object, it draws on its parent class SceneObject
		super(newObject, c, colour, rot, dynarot, rotcentre, colourdouble);
		
		
		// NB: This implementation of Pyramid is the equivalent of the Tile Method 2 for the Cuboid (see above)
		//     So it would be more common to instead of defining a Pyramid in scene_design.js, simply use a Cone (see below) with the number of tiles used being 4
		
		// Number of tiles used
		this.tiles = tiles;
		
		// Vertices of the pyramid
		this.v1 = {x:w, y:h, z:-d};
		this.v2 = {x:w, y:-h, z:-d};
		this.v3 = {x:-w, y:h, z:-d};
		this.v4 = {x:-w, y:-h, z:-d};
		this.v5 = {x:0, y:0, z:d};
		this.v6 = {x:0, y:0, z:2*d};
	}
	
	
	// Where the Pyramid is 'built', its faces are constructed and added to the array faceObject
	build (){

		// Clear faceObject[this.id] in case it was already populated (eg: a previous rotation of the same object)
		faceObject[this.id] = [];
		
		// Create a list of vectors which spans across each edge, then apply rotations etc.. to each list.
		// Then combine these lists to create a grid of points (P) across each side of the cuboid, then tile these and create faces, appending them to the list faceObject
		var v12 = applyRotationToTileLists(addVector3(this.v4,this.v6),generateLerpLists(this.v1,this.v2,this.tiles),this.tiles,this.c,this.rX,this.rY,this.rZ);
		var v13 = applyRotationToTileLists(addVector3(this.v4,this.v6),generateLerpLists(this.v1,this.v3,this.tiles),this.tiles,this.c,this.rX,this.rY,this.rZ);
		var v24 = applyRotationToTileLists(addVector3(this.v3,this.v6),generateLerpLists(this.v2,this.v4,this.tiles),this.tiles,this.c,this.rX,this.rY,this.rZ);
		var v34 = applyRotationToTileLists(addVector3(this.v2,this.v6),generateLerpLists(this.v3,this.v4,this.tiles),this.tiles,this.c,this.rX,this.rY,this.rZ);
		var v15 = applyRotationToTileLists(addVector3(this.v4,this.v6),generateLerpLists(this.v1,this.v5,this.tiles),this.tiles,this.c,this.rX,this.rY,this.rZ);
		var v25 = applyRotationToTileLists(addVector3(this.v3,this.v6),generateLerpLists(this.v2,this.v5,this.tiles),this.tiles,this.c,this.rX,this.rY,this.rZ);
		var v35 = applyRotationToTileLists(addVector3(this.v2,this.v6),generateLerpLists(this.v3,this.v5,this.tiles),this.tiles,this.c,this.rX,this.rY,this.rZ);
		
		// Tile the square base
		tilingProcess(tilePointsSquare(v12,v13,this.tiles,this.c),this.colour,this.c,this.id);
		// Tile each triangular side
		tilingProcess(tilePointsTri(v12,v15,this.tiles,this.c),this.colour,this.c,this.id);
		tilingProcess(tilePointsTri(v13,v15,this.tiles,this.c),this.colour,this.c,this.id);
		tilingProcess(tilePointsTri(v24,v25,this.tiles,this.c),this.colour,this.c,this.id);
		tilingProcess(tilePointsTri(v34,v35,this.tiles,this.c),this.colour,this.c,this.id);
		
		// Update faceIDByObject array
		addFaceIDByObject(this.id);
	}
}



class Cone extends SceneObject {
	constructor (newObject, c, r1, r2, h, colour, tiles, rot, dynarot, rotcentre, open, colourdouble){
		
		// Since Cone is a 3D object, it draws on its parent class SceneObject
		super(newObject, c, colour, rot, dynarot, rotcentre, colourdouble);
		
		// Is the cone open or not? (ie: include the base of the cone)
		if (open) {this.open = open;}
		else {this.open = false;}
		
		// The height (h), first radius (r1), second radius (r2), and the number of tiles used
		this.h = h;
		this.r1 = r1;
		this.r2 = r2;
		this.tiles = tiles;
		
		// list of vectors of the cone -> vs[0] is the spike, vs[1] is a list of vectors around the circle on the base
		this.vs = [[{x:0,y:0,z:h/2}]];
		this.vs.push([]);
		for (var i=0; i<=this.tiles; i+=1){
			this.vs[1].push(new Vector3(r1*sin(360*i/this.tiles), r2*cos(360*i/this.tiles), -h/2));
		}
	}
	
	// Where the Cone is 'built', its faces are constructed and added to the array faceObject
	build (){
		
		// Clear faceObject[this.id] in case it was already populated (eg: a previous rotation of the same object)
		faceObject[this.id] = [];
		
		// If it is not open (ie: there is a base), then draw the circle on the bottom
		if (!this.open){
			new Circle('XY',this.c,{x:this.c.x,y:this.c.y,z:this.c.z-this.h/2},this.r1,this.r2,this.colour,this.tiles,this.rot,this.id);
		}
		
		// tranvs is the list of vectors (similar to vs), after the transformations have been applied (ie. rotation etc...)
		this.tranvs = [];
		this.tranvs.push(applyRotationToTileLists(origin,this.vs[0],0,this.c,this.rX,this.rY,this.rZ)); 
		this.tranvs.push(applyRotationToTileLists(origin,this.vs[1],this.tiles,this.c,this.rX,this.rY,this.rZ));
		
		// tileVectorToPoints converts the list of vectors tranvs to Points (P), and stores them in ps --> (see scene_funcs.js)
		this.ps = tileVectorToPoints(this.tranvs);
		
		// Creates the faces from the list of points in ps
		for (var i=0; i<this.vs[1].length-1; i+=1){
			faceObject[this.id].push(new F(this.ps[0][0],this.ps[1][i],this.ps[1][i+1], this.colour, this.c));
		}
				
		// Update faceIDByObject array
		addFaceIDByObject(this.id);
	}
}


class Cylinder extends SceneObject {
	constructor (newObject, c, r, h, colour, tiles1, tiles2, rot, dynarot, rotcentre, open, colourdouble){
				
		// Since Cylinder is a 3D object, it draws on its parent class SceneObject
		super(newObject, c, colour, rot, dynarot, rotcentre, colourdouble);
		
		// Is the cone open or not? (ie: include the base of the cone)
		if (open) {this.open = open;}
		else {this.open = false;}
		
		// The cylinders' height and radius
		this.h = h;
		this.r = r;
		
		// The centre of the circle at either end of the cylinder
		this.v1 = {x:0, y:0 , z:h};
		this.v2 = {x:0, y:0 , z:-h};
		
		// the two sets of number of tiles (tiles1 is how many 'layers' to the pillar, whilst tiles2 is how many tiles around in a circle)
		this.tiles1 = tiles1;
		this.tiles2 = tiles2;
		
		// list of vectors describing the cylinder, recording the same circle at various stages throughtout the cylinder (tiles1 times)
		this.vs = [];
		for (var i=0; i<=this.tiles1; i+=1){
			this.vs.push([]);
			for (var j=0; j<=this.tiles2; j+=1){
				this.vs[i].push(addVector3(lerpV(this.v1,this.v2, i/this.tiles1),new Vector3(r*cos(360*j/this.tiles2), r*sin(360*j/this.tiles2), 0)));
			}
		}
	}
	
	build (){
		
		// Clear faceObject[this.id] in case it was already populated (eg: a previous rotation of the same object)
		faceObject[this.id] = [];
		
		// If it is not open (ie: there is a top and base), then draw the circle on the top and the bottom
		if (!this.open){
			new Circle('XY',this.c,{x:this.c.x,y:this.c.y,z:this.c.z-this.h},this.r,this.r,this.colour,this.tiles2,{x:this.rot.x,y:this.rot.y,z:this.rot.z},this.id,90-360/this.tiles2);
			new Circle('XY',this.c,{x:this.c.x,y:this.c.y,z:this.c.z+this.h},this.r,this.r,this.colour,this.tiles2,{x:this.rot.x,y:this.rot.y,z:this.rot.z},this.id,90-360/this.tiles2);
		}
		
		// tranvs is the list of vectors (similar to vs), after the transformations have been applied (ie. rotation etc...)
		this.tranvs = [];
		for (var i=0; i<=this.tiles1; i+=1){
			this.tranvs.push(applyRotationToTileLists(origin,this.vs[i],this.tiles2,this.c,this.rX,this.rY,this.rZ));
		}
		
		// tileVectorToPoints converts the list of vectors tranvs to Points (P), and then tilingProcess creates the faces which are then added to the faceObject array
		tilingProcess(tileVectorToPoints(this.tranvs),this.colour,this.c,this.id);
		
		// Update faceIDByObject array
		addFaceIDByObject(this.id);
	}
}

class Torus extends SceneObject {
	constructor (newObject, c, r1, r2, colour, tiles1, tiles2, rot, dynarot, rotcentre, colourdouble){
						
		// Since Torus is a 3D object, it draws on its parent class SceneObject
		super(newObject, c, colour, rot, dynarot, rotcentre, colourdouble);
		
		// The number of tiles used for:
		//    -  tiles1  -->  outer ring
		//    -  tiles2  -->  inner ring
		this.tiles1 = tiles1;
		this.tiles2 = tiles2;
		
		// List of vectors describing the torus, recording the same circle at various stages around the ring (tiles1 times), each bending at a slightly greater angle
		// Also because this shapes' overall centre is in fact 'outside' of the object, the 'centre' used to calculate light shading of the faces (see scene_elements.js)
		// must be calculated to always be on the inside of the torus. So we create a circle of 'centres' through the middle of the torus (think where jam would be in a doughnut) :)
		this.vs = [];
		this.cs = [];
		for (var i=0; i<=this.tiles1; i+=1){
			this.vs.push([]);
			for (var j=0; j<=this.tiles2; j+=1){
				this.vs[i].push(new Vector3(r2*cos(360*i/this.tiles1)+r1*cos(360*j/this.tiles2)*(cos(360*i/this.tiles1)), r2*sin(360*i/this.tiles1)+r1*cos(360*j/this.tiles2)*(sin(360*i/this.tiles1)), r1*sin(360*j/this.tiles2)));
			}
			this.cs.push(new Vector3(r2*cos(360*i/this.tiles1), r2*sin(360*i/this.tiles1), 0));
		}
	}
	
	build (){
		
		// Clear faceObject[this.id] in case it was already populated (eg: a previous rotation of the same object)
		faceObject[this.id] = [];

		// tranvs is the list of vectors (similar to vs), after the transformations have been applied (ie. rotation etc...)
		this.tranvs = [];
		for (var i=0; i<=this.tiles1; i+=1){
			this.tranvs.push(applyRotationToTileLists(origin,this.vs[i],this.tiles2,this.c,this.rX,this.rY,this.rZ));
		}
		
		// trancs is the same idea as tranvs, but instead contains a list of transformed centres
		this.trancs = applyRotationToTileLists(origin,this.cs,this.tiles1,this.c,this.rX,this.rY,this.rZ);
		
		// Convert the list of vectors to Points (P) and then tile them in a pattern to create the faces (F) of the object
		tilingProcess(tileVectorToPoints(this.tranvs),this.colour,this.c,this.id,this.trancs);
				
		// Update faceIDByObject array
		addFaceIDByObject(this.id);
	}
}

class Sphere extends SceneObject {						
	
	// Since Sphere is a 3D object, it draws on its parent class SceneObject
	constructor (newObject, c, r1, r2, r3, colour, tiles1, tiles2, rot, dynarot, rotcentre, open, colourdouble){
		super(newObject, c, colour, rot, dynarot, rotcentre, colourdouble);
		
		// Is the sphere open or not? (ie: include the base of the cone)
		if (open) {this.open = open;}
		else {this.open = false;}

		// The number of tiles used for:
		//    -  tiles1  -->  number of slices of the sphere
		//    -  tiles2  -->  number of vertices used to create the circles for each slice (polygon with tiles2 sides)
		this.tiles1 = tiles1;
		this.tiles2 = tiles2;		
		
		this.r1 = r1;
		this.r2 = r2;
		this.r3 = r3;
		
		// List of vectors describing the sphere, recording the same circle at various stages through the object (slices)
		this.vs = [];
		for (var i=0; i<=this.tiles1; i+=1){
			this.vs.push([]);
			for (var j=0; j<=this.tiles2; j+=1){
				this.vs[i].push(new Vector3(2*r1*i/this.tiles1-r1, r2*cos(360*j/this.tiles2/* +144*i/(this.tiles1-2) */)*sqrt(1-sq(2*(i/this.tiles1)-1)), r3*sin(360*j/this.tiles2/* +144*i/(this.tiles1-2) */)*sqrt(1-sq(2*(i/this.tiles1)-1))));
			}
		}
	}
	
	build (){		
		
		// Clear faceObject[this.id] in case it was already populated (eg: a previous rotation of the same object)
		faceObject[this.id] = [];
		
		// Draw the ends of the sphere if it is not open (if there were not flat ends (poles) then it would draw a spike which doesn't look right)
		if (!this.open){
			new Circle('YZ',this.c,{x:this.c.x-this.r1+2*this.r1/this.tiles1,y:this.c.y,z:this.c.z},this.r2*sqrt(1-sq(2*(1/this.tiles1)-1)),this.r3*sqrt(1-sq(2*(1/this.tiles1)-1)),this.colour,this.tiles2,{x:this.rot.x,y:this.rot.y,z:this.rot.z},this.id,90-360/this.tiles2);
			new Circle('YZ',this.c,{x:this.c.x+this.r1-2*this.r1/this.tiles1,y:this.c.y,z:this.c.z},this.r2*sqrt(1-sq(2*(1/this.tiles1)-1)),this.r3*sqrt(1-sq(2*(1/this.tiles1)-1)),this.colour,this.tiles2,{x:this.rot.x,y:this.rot.y,z:this.rot.z},this.id,90-360/this.tiles2);
		}

		// tranvs is the list of vectors (similar to vs), after the transformations have been applied (ie. rotation etc...)
		this.tranvs = [];
		for (var i=1; i<=this.tiles1-1; i+=1){
			this.tranvs.push(applyRotationToTileLists(origin,this.vs[i],this.tiles2,this.c,this.rX,this.rY,this.rZ));
		}
				
		// Convert the list of vectors to Points (P) and then tile them in a pattern to create the faces (F) of the object
		tilingProcess(tileVectorToPoints(this.tranvs),this.colour,this.c,this.id);
						
		// Update faceIDByObject array
		addFaceIDByObject(this.id);
	}
}


