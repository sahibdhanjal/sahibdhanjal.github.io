
/*-- |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/|

    KinEval | Kinematic Evaluator | update robot state from controls

    Implementation of robot kinematics, control, decision making, and dynamics 
        in HTML5/JavaScript and threejs
     
    @author ohseejay / https://github.com/ohseejay / https://bitbucket.org/ohseejay

    Chad Jenkins
    Laboratory for Perception RObotics and Grounded REasoning Systems
    University of Michigan

    License: Creative Commons 3.0 BY-SA

|\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| --*/

kineval.applyControls = function robot_apply_controls() {
    // apply robot controls to robot kinematics transforms and joint angles, then zero controls
    // includes update of camera position based on base movement

    // update robot configuration from controls
    for (x in robot.joints) {
        if (isNaN(robot.joints[x].control))
            console.warn("kineval: control value for " + x +" is a nan"); //+robot.joints[x].control);

        // update joint angles
        robot.joints[x].angle += robot.joints[x].control;

    // STENCIL: enforce joint limits for prismatic and revolute joints
        
        // if(robot.joints[x].angle > 2*Math.PI){
        //     robot.joints[x].angle-=2*Math.PI;
        // }

        // JOINT LIMITS ENFORCED
        robot.joints[x].angle = joint_limiter(x,robot.joints[x].angle);

        // clear controls back to zero for next timestep
        robot.joints[x].control = 0;
    }

    // base motion
    robot.origin.xyz[0] += robot.control.xyz[0];
    robot.origin.xyz[1] += robot.control.xyz[1];
    robot.origin.xyz[2] += robot.control.xyz[2];
    robot.origin.rpy[0] += robot.control.rpy[0];
    robot.origin.rpy[1] += robot.control.rpy[1];
    robot.origin.rpy[2] += robot.control.rpy[2];

    // move camera with robot base
    camera_controls.object.position.x += robot.control.xyz[0];
    camera_controls.object.position.y += robot.control.xyz[1];
    camera_controls.object.position.z += robot.control.xyz[2];

    // zero controls now that they have been applied to robot
    robot.control = {xyz: [0,0,0], rpy:[0,0,0]}; 
}



function joint_limiter(joint,angle) {
    var limits_max = {},
        limits_min = {};

    /*
    Descriptions and limits from the link below:
    http://docs.fetchrobotics.com/robot_hardware.html
    */

    // All joints having range [-99999999999, 99999999999] are continuous joints and can be rotated infinitely as per definition

    limits_min["torso_lift_joint"] = 0;
    limits_max["torso_lift_joint"] = 0.4;

    // limits_min["shoulder_pan_joint"] = -1.606;
    // limits_max["shoulder_pan_joint"] = 1.606;

    // limits_min["shoulder_lift_joint"] = -1.518;
    // limits_max["shoulder_lift_joint"] = 1.222;

    // limits_min["upperarm_roll_joint"] = -99999999999;   
    // limits_max["upperarm_roll_joint"] = 99999999999;

    // limits_min["elbow_flex_joint"] = -2.251;
    // limits_max["elbow_flex_joint"] = 2.251;

    // limits_min["forearm_roll_joint"] = -99999999999;
    // limits_max["forearm_roll_joint"] = 99999999999;

    // limits_min["wrist_flex_joint"] = -2.182;
    // limits_max["wrist_flex_joint"] = 2.182;

    // limits_min["wrist_roll_joint"] = -99999999999;
    // limits_max["wrist_roll_joint"] = 99999999999;

    // limits_min["gripper_axis"] = -99999999999;
    // limits_max["gripper_axis"] = 99999999999;

    // limits_min["head_pan_joint"] = -1.57;
    // limits_max["head_pan_joint"] = 1.57;

    // limits_min["head_tilt_joint"] = -0.785;
    // limits_max["head_tilt_joint"] = 1.57;

    limits_min["shoulder_pan_joint"] = -99999999;
    limits_max["shoulder_pan_joint"] = 999999;

    limits_min["shoulder_lift_joint"] = -999999999;
    limits_max["shoulder_lift_joint"] = 999999999999;

    limits_min["upperarm_roll_joint"] = -99999999999;   
    limits_max["upperarm_roll_joint"] = 99999999999;

    limits_min["elbow_flex_joint"] = -99999999999;
    limits_max["elbow_flex_joint"] = 99999999999;

    limits_min["forearm_roll_joint"] = -99999999999;
    limits_max["forearm_roll_joint"] = 99999999999;

    limits_min["wrist_flex_joint"] = -999999999;
    limits_max["wrist_flex_joint"] = 9999999999;

    limits_min["wrist_roll_joint"] = -99999999999;
    limits_max["wrist_roll_joint"] = 99999999999;

    limits_min["gripper_axis"] = -99999999999;
    limits_max["gripper_axis"] = 99999999999;

    limits_min["head_pan_joint"] = -9999999999999;
    limits_max["head_pan_joint"] = 9999999999;

    limits_min["head_tilt_joint"] = -99999999;
    limits_max["head_tilt_joint"] = 999999999;



    limits_min["torso_fixed_joint"] = 0;
    limits_max["torso_fixed_joint"] = 0;

    
    if(angle>limits_max[joint]){
        angle = limits_max[joint];
    }
    
    if(angle<limits_min[joint]){
        angle = limits_min[joint];
    }

    return angle;
}