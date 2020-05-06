

/*  -----     scene_funcs.js     -----  */

// These functions are used to build the objects defined in scene_objects.js



// find a list of points between two given points

function generateLerpLists(v1,v2,tiles){
	var l1 = [];
	for (var i=0; i<=tiles; i+=1){
		l1.push(lerpV(v1,v2, i/tiles));
	}
	return l1;
}

// Apply a rotation to a list of tiles
function applyRotationToTileLists(startV,l2,tiles,c,rotMatrixX,rotMatrixY,rotMatrixZ){
	var l3 = [];
	for (var j=0; j<=tiles; j+=1){
		l3.push(addVector3(c,matrixVectorProduct(rotMatrixZ,matrixVectorProduct(rotMatrixY,matrixVectorProduct(rotMatrixX, addVector3(multScalarVector(0.5,startV),l2[j]))))));
	}
	return l3;
}

// Convert a grid of vectors to points (P) so that they can be processed and turned into faces
function tileVectorToPoints(vs){
	var ps = [];
	for (var i=0; i<vs.length; i+=1){
		ps.push([]);
		for (var j=0; j<vs[i].length; j+=1){
			ps[i].push(new P(vs[i][j]));
		}
	}
	return ps;
}

// Create a square lattice of points (P)
function tilePointsSquare(V1s,V2s,tiles,c){
	var l3 = [];
	for (var i=0; i<=tiles[0]; i+=1){
		l3.push([]);
		for (var j=0; j<=tiles[1]; j+=1){
			l3[i].push(new P(multScalarVector(0.5,addVector3(V1s[i],V2s[j]))));
		}
	}
	return l3;
}

// Create a triangular lattice of points (P)
function tilePointsTri(V1s,V2s,tiles,c){
	var l3 = [];
	for (var i=0; i<=tiles; i+=1){
		l3.push([]);
		for (var j=0; j<=tiles-i; j+=1){
			l3[i].push(new P(multScalarVector(0.5,addVector3(V1s[j],V2s[i]))));
		}
	}
	return l3;
}

// Convert grids of points (P) to faces (F) and store them in the faceObject at index ID
function tilingProcess(l4,colour,c,ID,varC){
	var faceCenter;
	for (var i=0; i<l4.length-1; i+=1){
		if (!varC){
			faceCenter = c;
		} else {
			faceCenter = varC[i];
		}
		for (var j=0; j<l4[i].length-1; j+=1){
			
			if ((i+j)%2){
				faceObject[ID].push(new F(l4[i][j],l4[i][j+1],l4[i+1][j+1], colour, faceCenter));
				if (l4[i+1][j+1]){
					if (!partialTiling){
						faceObject[ID].push(new F(l4[i][j],l4[i+1][j],l4[i+1][j+1], colour, faceCenter));
					}
				}
			} else {
				faceObject[ID].push(new F(l4[i][j],l4[i][j+1],l4[i+1][j], colour, faceCenter));
				if (l4[i+1][j+1]){
					if (!partialTiling){
						faceObject[ID].push(new F(l4[i][j+1],l4[i+1][j],l4[i+1][j+1], colour, faceCenter));
					}
				}
			}
		}
	}
}

// update faceIdByObject to get cumulative a list of indexes of where one objects' faces start and end for the array f
function addFaceIDByObject(ID){
	if (faceIDByObject.length < objects.length){
		if (faceIDByObject[ID-1]) {
			faceIDByObject.push(faceObject[ID].length + faceIDByObject[ID-1]);
		} else {
			faceIDByObject.push(faceObject[ID].length);
		}
	}
}
