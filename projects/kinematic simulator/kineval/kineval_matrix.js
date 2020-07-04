//////////////////////////////////////////////////
/////     MATRIX ALGEBRA AND GEOMETRIC TRANSFORMS 
//////////////////////////////////////////////////

// STENCIL: reference matrix code has the following functions:
//   matrix_multiply
//   matrix_transpose
//   matrix_pseudoinverse
//   matrix_invert_affine
//   vector_normalize
//   vector_cross
//   generate_identity
//   generate_translation_matrix
//   generate_rotation_matrix_X
//   generate_rotation_matrix_Y
//   generate_rotation_matrix_Z

function matrix_copy(m1) {
    // returns 2D array that is a copy of m1

    var mat = [];
    var i,j;

    for (i=0;i<m1.length;i++) { // for each row of m1
        mat[i] = [];
        for (j=0;j<m1[0].length;j++) { // for each column of m1
            mat[i][j] = m1[i][j];
        }
    }
    return mat;
}

function matrix_multiply(m1,m2){
    var mat = [],
        r1 = m1.length,
        c1 = m1[0].length,
        r2 = m2.length,
        c2 = m2[0].length,
        r = 0,
        c = 0,
        k = 0;

    if(c1!=r2){
        console.log("incompatible dimensions");
    }

    if(r1 == undefined || c1 == undefined || r2 == undefined || c2 == undefined) {
        console.log(" Multiplication not compatible with n x 1 matrices");
        return [];
    }

    for(r=0 ; r<r1 ; r++){
        mat[r] = [];
        for(c=0 ; c<c2 ; c++){
            mat[r][c] = 0;
            for(k=0 ; k<c1 ; k++)
                mat[r][c] += m1[r][k]*m2[k][c];
        }
    }
    return mat;
}

function matrix_transpose(m1){
    var mat = [],
        rows = m1.length,
        cols = m1[0].length,
        r = 0,
        c = 0;
    
    // Initialize empty matrix of c x r dimensions
    for(c=0 ; c<cols ; c++) {
        mat[c] = [];
        for(r=0 ; r<rows ; r++)
            mat[c][r] = 0;
    }

    // Populate transposed matrix
    for(r=0 ; r<rows ; r++){
        for(c=0 ; c<cols ; c++)
            mat[c][r] = m1[r][c];
    }
    return mat;
}


function matrix_pseudoinverse(m1) {
    var n = m1.length,  // number of rows
        m = m1[0].length,   // number of cols
        mult = [],
        inv = [];

    // Left Pseudo Inverse
    if(n > m) {
        mult = matrix_multiply( matrix_transpose(m1) , m1); // results in an M x M matrix
        inv = matrix_multiply( numeric.inv(mult) , matrix_transpose(m1));   // results in an M X N matrix
    }

    // Right Pseudo Inverse
    else if(m > n) {
        mult = matrix_multiply( m1 , matrix_transpose(m1) ); // results in an N x N matrix
        inv = matrix_multiply( matrix_transpose(m1) , numeric.inv(mult) );   // results in an M X N matrix        
    }

    else
        inv = numeric.inv(m1);

    return inv;     // always an M x N matrix
}

// function matrix_invert_affine(){}

function vector_normalize(v){
    var mat = [],
        i = v[0],
        j = v[1],
        k = v[2],
        den = Math.sqrt(i*i + j*j + k*k);
    mat = [i/den , j/den , k/den];
    return mat;
}

function vector_cross(v1,v2){
    var mat = [],
        i1 = v1[0],
        j1 = v1[1],
        k1 = v1[2],
        i2 = v2[0],
        j2 = v2[1],
        k2 = v2[2];

        mat = [(j1*k2 - j2*k1),(-i1*k2 + k1*i2),(i1*j2 - j1*i2)];
        return mat;
}

function vector_dot(v1,v2) {
    var i1 = v1[0],
        j1 = v1[1],
        k1 = v1[2],
        i2 = v2[0],
        j2 = v2[1],
        k2 = v2[2],
        val = i1*i2 + j1*j2 + k1*k2;
    return val;
}

function generate_identity(n){
    var mat = [],
        r = 0,
        c = 0;

    for (r=0 ; r<n ; r++){
        mat[r] = [];
        for (c=0 ; c<n ; c++){
            if(r==c)
                mat[r][c] = 1;
            else
                mat[r][c] = 0;
        }
    }
    return mat;
}

function generate_translation_matrix(x,y,z){
    var mat = [];
    
    mat = [
            [1,0,0,x],
            [0,1,0,y],
            [0,0,1,z],
            [0,0,0,1]];
    
    return mat;
}

function generate_rotation_matrix_X(theta){
    var mat = [],
        c = Math.cos(theta),
        s = Math.sin(theta);
    
    mat = [
            [1,0,0,0],
            [0,c,-s,0],
            [0,s,c,0],
            [0,0,0,1]];
    
    return mat;
}

function generate_rotation_matrix_Y(theta){
    var mat = [],
        c = Math.cos(theta),
        s = Math.sin(theta);
    
    mat = [
            [c,0,s,0],
            [0,1,0,0],
            [-s,0,c,0],
            [0,0,0,1]];
    
    return mat;
}

function generate_rotation_matrix_Z(theta){
    var mat = [],
        c = Math.cos(theta),
        s = Math.sin(theta);
    
    mat = [
            [c,-s,0,0],
            [s,c,0,0],
            [0,0,1,0],
            [0,0,0,1]];
    
    return mat;   
}

// Function to multiply a scalar value to a matrix 
function scale(scalar, mat){
    var rows = mat.length,
        cols = mat[0].length,
        r = 0,
        c = 0;

    for(r=0 ; r<rows ; r++){
        for(c=0 ; c<cols ; c++){
            mat[r][c] = scalar*mat[r][c];
        }
    }
    return mat;
}