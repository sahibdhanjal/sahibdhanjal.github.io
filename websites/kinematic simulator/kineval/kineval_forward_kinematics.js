
/*-- |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/|

    KinEval | Kinematic Evaluator | forward kinematics

    Implementation of robot kinematics, control, decision making, and dynamics 
        in HTML5/JavaScript and threejs
     
    @author ohseejay / https://github.com/ohseejay / https://bitbucket.org/ohseejay

    Chad Jenkins
    Laboratory for Perception RObotics and Grounded REasoning Systems
    University of Michigan

    License: Creative Commons 3.0 BY-SA

|\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| --*/

kineval.robotForwardKinematics = function robotForwardKinematics () { 

    if (typeof kineval.buildFKTransforms === 'undefined') {
        textbar.innerHTML = "forward kinematics not implemented";
        return;
    }

    // STENCIL: implement kineval.buildFKTransforms();
    kineval.buildFKTransforms();

}

// STENCIL: reference code alternates recursive traversal over 
//   links and joints starting from base, using following functions: 
//     traverseFKBase
//     traverseFKLink
//     traverseFKJoint
//
// user interface needs the heading (z-axis) and lateral (x-axis) directions
//   of robot base in world coordinates stored as 4x1 matrices in
//   global variables "robot_heading" and "robot_lateral"
//
// if geometries are imported and using ROS coordinates (e.g., fetch),
//   coordinate conversion is needed for kineval/threejs coordinates:
//
//   if (robot.links_geom_imported) {
//       var offset_xform = matrix_multiply(generate_rotation_matrix_Y(-Math.PI/2),generate_rotation_matrix_X(-Math.PI/2));

kineval.buildFKTransforms = function buildFKTransforms() {
    matstack = [];
    robot_lateral = [[1],[0],[0],[1]];
    robot_heading = [[0],[0],[1],[1]];
    ctr = 2; // Position of matstack to pop out till

    matstack.push(generate_identity(4));
    traverseFKBase();
}

function traverseFKBase() {
    var xpos = robot.origin.xyz[0],
        ypos = robot.origin.xyz[1],
        zpos = robot.origin.xyz[2],
        r = robot.origin.rpy[0],
        p = robot.origin.rpy[1],
        y = robot.origin.rpy[2],
        jsmat = matrix_multiply(generate_translation_matrix(xpos,ypos,zpos),matrix_multiply(matrix_multiply(generate_rotation_matrix_X(r),generate_rotation_matrix_Y(p)),generate_rotation_matrix_Z(y))),
        child = robot.base,
        offset_xform = matrix_multiply(generate_rotation_matrix_Y(-Math.PI/2),generate_rotation_matrix_X(-Math.PI/2));

    robot_heading = matrix_multiply(jsmat,robot_heading);
    robot_lateral = matrix_multiply(jsmat,robot_lateral);

    if(robot.links_geom_imported){
        jsmat = matrix_multiply(jsmat,offset_xform);
        ctr = 3; // Initial popping off of matrix stack till the torso lift
    }

    matstack.push(jsmat);
    robot.links[child].xform = matrix_copy(matstack.slice(-1)[0]);
    traverseFKLink(child);
}

function traverseFKLink(links) {
    var link = robot.links[links],
        child = link.children,
        iter = 0;
    robot.links[links].xform = matrix_copy(matstack.slice(-1)[0]);

    if(child.length==0){
        matstack = matstack.splice(0,ctr);
        ctr = 2; // Popping off till base(level 2) once level 3 execution is done
    }

    else
        for(iter=0 ; iter<child.length ; iter++)
            traverseFKJoint(child[iter]);
}

function traverseFKJoint(joints) {
    var joint = robot.joints[joints],
        child = joint.child;
        jsmat = generateXForm(joints),
        prev = matstack.slice(-1)[0],
        transform = matrix_multiply(prev,jsmat);
    matstack.push(transform);
    robot.joints[joints].xform = matrix_copy(matstack.slice(-1)[0]);
    traverseFKLink(child);
}


function generateXForm(joints) {
    var joint = robot.joints[joints],
        xpos = joint.origin.xyz[0],
        ypos = joint.origin.xyz[1],
        zpos = joint.origin.xyz[2],
        r = joint.origin.rpy[0],
        p = joint.origin.rpy[1],
        y = joint.origin.rpy[2],
        angle = joint.angle,
        axis = joint.axis,
        quaternion = quaternion_from_axisangle(axis,angle),
        rotation = quaternion_to_rotation_matrix(quaternion),
        jsmat = matrix_multiply(generate_translation_matrix(xpos,ypos,zpos),matrix_multiply(matrix_multiply(generate_rotation_matrix_X(r),generate_rotation_matrix_Y(p)),generate_rotation_matrix_Z(y)));
    
    // Hacky fix for limiting the lift joint prismatic and the torso fixed joint fixed (only in case of fetch)

    if(joint.name == "torso_lift_joint"){
        var transverse = [[1,0,0,0],[0,1,0,0],[0,0,1,angle],[0,0,0,1]];
        jsmat = matrix_multiply(jsmat,transverse);
    }

    else if (joint.name == "torso_fixed_joint")
        return jsmat;
    
    else
        jsmat = matrix_multiply(jsmat,rotation);
    
    return jsmat;
}