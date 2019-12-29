//////////////////////////////////////////////////
/////     QUATERNION TRANSFORM ROUTINES 
//////////////////////////////////////////////////

    // STENCIL: reference quaternion code has the following functions:
    //   quaternion_from_axisangle
    //   quaternion_normalize
    //   quaternion_to_rotation_matrix
    //   quaternion_multiply

/*
All functions derived from:
1. http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToMatrix/
2. https://en.wikipedia.org/wiki/Quaternion
3. https://www.mathworks.com/help/aeroblks/quaternioninverse.html
*/

function quaternion_from_axisangle(axis,angle) {
	var	n = axis,
		w = Math.cos(angle/2),
		x = n[0]*Math.sin(angle/2),
		y = n[1]*Math.sin(angle/2),
		z = n[2]*Math.sin(angle/2),
		q = [w,x,y,z];
	return q;
}

function quaternion_normalize(q) {
	var den = Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]);
	return [q[0]/den , q[1]/den ,q[2]/den ,q[3]/den];
}

function quaternion_to_rotation_matrix(q) {
	var mat = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,1]],
		qw = q[0],
		qx = q[1],
		qy = q[2],
		qz = q[3];

	mat[0][0] = 1 - 2*qy*qy - 2*qz*qz;
	mat[0][1] = 2*qx*qy - 2*qz*qw;
	mat[0][2] = 2*qx*qz + 2*qy*qw;
	
	mat[1][0] = 2*qx*qy + 2*qz*qw;
	mat[1][1] = 1 - 2*qx*qx - 2*qz*qz;
	mat[1][2] = 2*qy*qz - 2*qx*qw;

	mat[2][0] = 2*qx*qz - 2*qy*qw;
	mat[2][1] = 2*qy*qz + 2*qx*qw;
	mat[2][2] = 1- 2*qx*qx - 2*qy*qy;

	return mat;
}

function quaternion_multiply(q1,q2) {
	var mat = [],
		a1 = q1[0],
		b1 = q1[1],
		c1 = q1[2],
		d1 = q1[3],
		a2 = q2[0],
		b2 = q2[1],
		c2 = q2[2],
		d2 = q2[3];

	console.log(a1,b1,c1,d1,a2,b2,c2,d2);
	mat[0] = a1*a2 - b1*b2 - c1*c2 - d1*d2;
	mat[1] = a1*b2 + b1*a2 + c1*d2 - d1*c2;
	mat[2] = a1*c2 - b1*d2 + c1*a2 + d1*b2;
	mat[3] = a1*d2 + b1*c2 - c1*b2 + d1*a2;

	return mat;
}

function quaternion_inverse(q) {
	return quaternion_normalize([q[0],-q[1],-q[2],-q[3]]);
}