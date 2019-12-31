
/*-- |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/|

    KinEval | Kinematic Evaluator | collision detection

    Implementation of robot kinematics, control, decision making, and dynamics 
        in HTML5/JavaScript and threejs
     
    @author ohseejay / https://github.com/ohseejay / https://bitbucket.org/ohseejay

    Chad Jenkins
    Laboratory for Perception RObotics and Grounded REasoning Systems
    University of Michigan

    License: Creative Commons 3.0 BY-SA

|\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| --*/

// KE: merge collision test into FK
// KE: make FK for a configuration and independent of current robot state

kineval.robotIsCollision = function robot_iscollision() {
    // test whether geometry of current configuration of robot is in collision with planning world 

    // form configuration from base location and joint angles
    var q_robot_config = [
        robot.origin.xyz[0],
        robot.origin.xyz[1],
        robot.origin.xyz[2],
        robot.origin.rpy[0],
        robot.origin.rpy[1],
        robot.origin.rpy[2]
    ];

    q_names = {};  // store mapping between joint names and q DOFs

    for (x in robot.joints) {
        q_names[x] = q_robot_config.length;
        q_robot_config = q_robot_config.concat(robot.joints[x].angle);
    }

    // test for collision and change base color based on the result
    collision_result = kineval.poseIsCollision(q_robot_config);

    robot.collision = collision_result;

    if (collision_result == false)
        return false;
    
    return true;
}

kineval.poseIsCollision = function robot_collision_test(q) {
    // perform collision test of robot geometry against planning world 
    // test base origin (not extents) against world boundary extents
    if ((q[0]<robot_boundary[0][0])||(q[0]>robot_boundary[1][0])||(q[2]<robot_boundary[0][2])||(q[2]>robot_boundary[1][2]))
        return robot.base;

    buildMatStack(q);
    // STENCIL: implement forward kinematics for collision detection
    //return robot_collision_forward_kinematics(q);
    // return collision_FK_link(robot.links[robot.base], robot.links[robot.base].xform);
    return collision_FK_link(robot.links[robot.base],xforms[robot.base]);
}

function collision_FK_link(link,mstack) {
    // test collision by transforming obstacles in world to link space
    mstack_inv = numeric.inv(mstack);
    var i; var j;

    for (j in robot_obstacles) {
        var obstacle_local = matrix_multiply(mstack_inv,robot_obstacles[j].location);
        // assume link is in collision as default
        var in_collision = true;
        if ((obstacle_local[0][0]<(link.bbox.min.x-robot_obstacles[j].radius)) || (obstacle_local[0][0]>(link.bbox.max.x+robot_obstacles[j].radius)))
            in_collision = false;

        if ((obstacle_local[1][0]<(link.bbox.min.y-robot_obstacles[j].radius)) || (obstacle_local[1][0]>(link.bbox.max.y+robot_obstacles[j].radius)))
            in_collision = false;

        if ((obstacle_local[2][0]<(link.bbox.min.z-robot_obstacles[j].radius)) || (obstacle_local[2][0]>(link.bbox.max.z+robot_obstacles[j].radius)))
            in_collision = false;

        if (in_collision)
            return link.name;
    }

    // recurse child joints for collisions, 
    //   returning name of descendant link in collision
    //   or false if all descendants are not in collision
    if (typeof link.children !== 'undefined') { 
        var local_collision;
        for (i in link.children) {
            // STUDENT: create this joint FK traversal function 
            // local_collision = collision_FK_joint(robot.joints[link.children[i]], robot.joints[link.children[i]].xform);
            local_collision = collision_FK_joint(robot.joints[link.children[i]], xforms[link.children[i]]);

            if (local_collision)
               return local_collision;
        }
    }

    // return false, when no collision detected for this link and children
    return false;
}

function collision_FK_joint(joint,mstack){
    var local_collision = collision_FK_link(robot.links[joint.child], mstack);
    if (local_collision)
        return local_collision;
    return false;
}

function buildMatStack(q){
    matstack_new = [];
    xforms = {};
    ctr = 2; // Position of matstack to pop out till
    q_pos = 6;
    matstack_new.push(generate_identity(4));
    traverseBase(q);
}

function traverseBase(q) {
    var xpos = q[0],
        ypos = q[1],
        zpos = q[2],
        r = q[3],
        p = q[4],
        y = q[5],
        jsmat = matrix_multiply(generate_translation_matrix(xpos,ypos,zpos),matrix_multiply(matrix_multiply(generate_rotation_matrix_X(r),generate_rotation_matrix_Y(p)),generate_rotation_matrix_Z(y))),
        child = robot.base,
        offset_xform = matrix_multiply(generate_rotation_matrix_Y(-Math.PI/2),generate_rotation_matrix_X(-Math.PI/2));

    robot_heading = matrix_multiply(jsmat,[[0],[0],[1],[1]]);
    robot_lateral = matrix_multiply(jsmat,[[1],[0],[0],[1]]);

    if(robot.links_geom_imported){
        jsmat = matrix_multiply(jsmat,offset_xform);
        ctr = 3; // Initial popping off of matrix stack till the torso lift
    }

    matstack_new.push(jsmat);
    xforms[child] = matstack_new.slice(-1)[0];
    traverseLink(child,q);
}

function traverseLink(links,q) {
    var link = robot.links[links],
        child = link.children,
        iter = 0;
    xforms[links] = matrix_copy(matstack_new.slice(-1)[0]);

    if(child.length==0){
        matstack_new = matstack_new.splice(0,ctr);
        ctr = 2; // Popping off till base(level 2) once level 3 execution is done
    }

    else
        for(iter=0 ; iter<child.length ; iter++)
            traverseJoint(child[iter],q);
}

function traverseJoint(joints,q) {
    var joint = robot.joints[joints],
        child = joint.child;
        jsmat = generate_new_XForm(joints,q[q_pos]),
        prev = matstack_new.slice(-1)[0],
        transform = matrix_multiply(prev,jsmat);
    matstack_new.push(transform);
    xforms[joints] = matstack_new.slice(-1)[0];
    traverseLink(child,q);
}

function generate_new_XForm(joints,angle) {
    var joint = robot.joints[joints],
        xpos = joint.origin.xyz[0],
        ypos = joint.origin.xyz[1],
        zpos = joint.origin.xyz[2],
        r = joint.origin.rpy[0],
        p = joint.origin.rpy[1],
        y = joint.origin.rpy[2],
        axis = joint.axis,
        quaternion = quaternion_from_axisangle(axis,angle),
        rotation = quaternion_to_rotation_matrix(quaternion),
        jsmat = matrix_multiply(generate_translation_matrix(xpos,ypos,zpos),matrix_multiply(matrix_multiply(generate_rotation_matrix_X(r),generate_rotation_matrix_Y(p)),generate_rotation_matrix_Z(y)));
    
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

function getCurrPose(){
    var pose = [robot.origin.xyz[0],
        0,
        robot.origin.xyz[2],
        robot.origin.rpy[0],
        robot.origin.rpy[1],
        robot.origin.rpy[2]];
    for(x in robot.joints)
        pose = pose.concat(robot.joints[x].angle);

    return pose;
}