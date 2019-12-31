
/*-- |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/|

    KinEval | Kinematic Evaluator | inverse kinematics

    Implementation of robot kinematics, control, decision making, and dynamics 
        in HTML5/JavaScript and threejs
     
    @author ohseejay / https://github.com/ohseejay / https://bitbucket.org/ohseejay

    Chad Jenkins
    Laboratory for Perception RObotics and Grounded REasoning Systems
    University of Michigan

    License: Creative Commons 3.0 BY-SA

|\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| --*/

kineval.robotInverseKinematics = function robot_inverse_kinematics(endeffector_target_world, endeffector_joint, endeffector_position_local) {

    ee = endeffector_joint; // making end-effector joint to be global
    transform = matrix_multiply(robot.joints[ee].xform, [[endeffector_position_local[0]], [endeffector_position_local[1]], [endeffector_position_local[2]], [1]]);
    euler_angles = getEulerAngles(robot.joints[ee].xform);

    // compute joint angle controls to move location on specified link to Cartesian location
    if ((kineval.params.update_ik)||(kineval.params.persist_ik)) { 
        // if update requested, call ik iterator and show endeffector and target
        kineval.iterateIK(endeffector_target_world, endeffector_joint, endeffector_position_local);
        if (kineval.params.trial_ik_random.execute)
            kineval.randomizeIKtrial();
        else // KE: this use of start time assumes IK is invoked before trial
            kineval.params.trial_ik_random.start = new Date();
    }

    kineval.params.update_ik = false; // clear IK request for next iteration
}

kineval.randomizeIKtrial = function randomIKtrial () {
   // update time from start of trial
    cur_time = new Date();
    kineval.params.trial_ik_random.time = cur_time.getTime()-kineval.params.trial_ik_random.start.getTime();

   // get endeffector Cartesian position in the world
    endeffector_world = matrix_multiply(robot.joints[robot.endeffector.frame].xform,robot.endeffector.position);

   // compute distance of endeffector to target
    kineval.params.trial_ik_random.distance_current = Math.sqrt(
            Math.pow(kineval.params.ik_target.position[0][0]-endeffector_world[0][0],2.0)
            + Math.pow(kineval.params.ik_target.position[1][0]-endeffector_world[1][0],2.0)
            + Math.pow(kineval.params.ik_target.position[2][0]-endeffector_world[2][0],2.0) );

   // if target reached, increment scoring and generate new target location
    // KE 2 : convert hardcoded constants into proper parameters
    if (kineval.params.trial_ik_random.distance_current < 0.01) {
        kineval.params.ik_target.position[0][0] = 1.2*(Math.random()-0.5);
        kineval.params.ik_target.position[1][0] = 1.2*(Math.random()-0.5)+1.5;
        kineval.params.ik_target.position[2][0] = 0.7*(Math.random()-0.5)+0.5;
        kineval.params.trial_ik_random.targets += 1;
        textbar.innerHTML = "IK trial Random: target " + kineval.params.trial_ik_random.targets + " reached at time " + kineval.params.trial_ik_random.time;
    }
}

kineval.iterateIK = function iterate_inverse_kinematics(endeffector_target_world, endeffector_joint, endeffector_position_local) {
    // Target position and orientation
    var ox = endeffector_target_world.orientation[0],
        oy = endeffector_target_world.orientation[1],
        oz = endeffector_target_world.orientation[2],
        
        dx = endeffector_target_world.position[0],
        dy = endeffector_target_world.position[1],
        dz = endeffector_target_world.position[2],

    // End-Effector position and orientation
        x = transform[0],
        y = transform[1],
        z = transform[2],

        ee_x = euler_angles[0],
        ee_y = euler_angles[1],
        ee_z = euler_angles[2],

        del = Math.sqrt(Math.pow(dx-x,2) + Math.pow(dy-y,2) + Math.pow(dz-z,2)),
        gamma = kineval.params.ik_steplength,	// step length from console
        item = ee,
        de = [],
        dq = [],
        link = {},
        i = 0;

    // With orientation
    if (kineval.params.ik_orientation_included==false)
        de = [[dx-x],[dy-y],[dz-z],[0],[0],[0]];
    
    // Without orientation
    else
        de = [[dx-x],[dy-y],[dz-z],[ox - ee_x],[oy - ee_y],[oz - ee_z]];
    
    // Estimate with Jacobian Inverse
    if (kineval.params.ik_pseudoinverse==true)
    	dq = scale( gamma , matrix_multiply(matrix_pseudoinverse(Jacobian()), de) );

    // Estimate with Jacobian Transpose
    else
    	dq = scale( gamma , matrix_multiply(matrix_transpose(Jacobian()), de) );

    for(i = dq.length - 1; i>=0 ; i--) {
        robot.joints[item].control =  dq[i][0];
        link = robot.joints[item].parent;
        if(link!=robot.base)
            item = robot.links[link].parent;
    }
}

function Jacobian() {
    var J = [],
        item = ee;

    while(parent_link != robot.base) {
        var Ji = colJacob(item),
            parent_link = robot.joints[item].parent,
            parent = robot.links[parent_link].parent;
        J.push(Ji);
        
        item = parent;
    }
    J = matrix_transpose(J.reverse());
    
    return J;
}

/* Function definition as per slide 11 pg 33, 34 */
function colJacob(i) {
    var J = [],
        joint = robot.joints[i],
        
        axisf = [[joint.axis[0]], [joint.axis[1]], [joint.axis[2]], [1]],	//axis in link frame
        axisw = matrix_multiply(joint.xform, axisf),	// axis in world frame
        
        axis = [axisw[0],axisw[1],axisw[2]],

        oi = [joint.xform[0][3], joint.xform[1][3], joint.xform[2][3]],		// joint origin in world frame
        oe = [transform[0][0],transform[1][0],transform[2][0]],     // end-effector in world frame
        
        r = [oe[0] - oi[0], oe[1] - oi[1], oe[2] - oi[2]],	// o_n - o_i
        k = [axis[0] - oi[0], axis[1] - oi[1], axis[2] - oi[2]],	//k - o_i
        
        v = vector_cross(k,r);

    if(joint.type == "prismatic")
        J = [[k[0]] , [k[1]] , [k[2]] , [0] , [0] , [0]];
    else
        J = [[v[0]] , [v[1]] , [v[2]] , [k[0]] , [k[1]] , [k[2]]];
    
    return J;
}

// Function as per the following link
// http://nghiaho.com/?page_id=846
// https://machinelearning1.wordpress.com/2014/02/08/transformation-matrix-euler-angles/
// My Derivation
function getEulerAngles(mat) {
    var roll = Math.atan2(-mat[1][2],mat[2][2]),
        pitch = Math.asin(mat[0][2]),
        yaw = Math.atan2(-mat[0][1], mat[0][0]),
        angles = [roll,pitch,yaw];    
    return angles;
}