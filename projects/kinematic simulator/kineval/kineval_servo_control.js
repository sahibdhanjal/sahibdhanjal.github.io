
/*-- |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/|

    KinEval | Kinematic Evaluator | arm servo control

    Implementation of robot kinematics, control, decision making, and dynamics 
        in HTML5/JavaScript and threejs
     
    @author ohseejay / https://github.com/ohseejay / https://bitbucket.org/ohseejay

    Chad Jenkins
    Laboratory for Perception RObotics and Grounded REasoning Systems
    University of Michigan

    License: Creative Commons 3.0 BY-SA

|\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| --*/

kineval.setpointDanceSequence = function execute_setpoints() {

    // if update not requested, exit routine
    if (!kineval.params.update_pd_dance) return; 

    // STENCIL: implement FSM to cycle through dance pose setpoints
    var sequence = {};

    /*
        Setpoint Format
        sequence[i] = [ torso_lift_joint , shoulder_pan_joint , shoulder_lift_joint , elbow_flex_joint , wrist_flex_joint , head_pan , head_tilt]
    */

    sequence[0] = [0, 0, 0, 0, 0, 0, 0];
    
    /* Dance begins */
    
    /* Swag Move Block - Head bobbing/ Waving */
    sequence[1] = [0.4, -1.5, 0, 0, 0, -1.5 , -0.5];

    sequence[2] = [0, -1.2, -0.19, 0.4, -0.4, -1.2, 0.5];
    sequence[3] = [0.4,-0.9, 0.19, -0.4, 0.4, -0.9, -0.5];

    sequence[4] = [0, -0.6,  -0.19, 0.4, -0.4, -0.6, 0.5];
    sequence[5] = [0.4, -0.3, 0.19, -0.4, 0.4, -0.3, -0.5];

    sequence[6] = [0, 0,  -0.19, 0.4, -0.4, 0, 0.5];
    sequence[7] = [0.4, 0.3, 0.19, -0.4, 0.4, 0.3, -0.5];

    sequence[8] = [0, 0.6,  -0.19, 0.4, -0.4, 0.6, 0.5];
    sequence[9] = [0.4, 0.9,0.19, -0.4, 0.4, 0.9, -0.5];

    sequence[10] = [0, 1.2, -0.19, 0.4, -0.4, 1.2, 0.5];
    sequence[11] = [0.4, 1.5, 0.19, -0.4, 0.4, 1.5, -0.5];
    
    
    /* Dance Sequence 2 - Go DJ! Go DJ! */
    sequence[12] = [0.4, -0.8, -0.1, -1.3, 0, 0.2, 0.5];
    sequence[13] = [0.3, -0.8, 0.1, -0.7, 0, 0.2, -0.50];
    sequence[14] = [0.4, -0.8, -0.1, -1.3, 0, 0.2, 0.50];
    sequence[15] = [0.4, -0.8, 0.1, -0.7, 0, 0.2, -0.50];
    sequence[16] = [0.3, -0.8, -0.1, -1.3, 0, 0.2, 0.50];
    sequence[17] = [0.4, -0.8, 0.1, -0.7, 0, 0.2, -0.50];
    sequence[18] = [0.3, -0.8, -0.1, -1.3, 0, 0.2, 0.50];

    /* Ending Sequence */
    sequence[19] = [0.4, -0.8, 0.25, -2.25, 0.45, 0, 0];
    sequence[20] = [0.4, -1.2, 0.4, 0, 0.6, 0, 0];
    sequence[21] = [0.4, -1.57, 0.6, 1.9, 0.75, 0, 0];
    sequence[22] = [0, 0, 0, 0, 0, 0, 0];

    /* Dance ended */


    // Finite State Machine Block

    kineval.params.dance_sequence_index.length = Object.keys(sequence).length;

    if (kineval.params.dance_pose_index < kineval.params.dance_sequence_index.length) {
        if (reached_flag==0) {  // Setting all angles and joint movements
            kineval.params.setpoint_target["torso_lift_joint"] = sequence[kineval.params.dance_pose_index][0];
            kineval.params.setpoint_target["shoulder_pan_joint"] = sequence[kineval.params.dance_pose_index][1];
            kineval.params.setpoint_target["shoulder_lift_joint"] = sequence[kineval.params.dance_pose_index][2];        
            kineval.params.setpoint_target["elbow_flex_joint"] = sequence[kineval.params.dance_pose_index][3];        
            kineval.params.setpoint_target["wrist_flex_joint"] = sequence[kineval.params.dance_pose_index][4];        
            kineval.params.setpoint_target["head_pan_joint"] = sequence[kineval.params.dance_pose_index][5];        
            kineval.params.setpoint_target["head_tilt_joint"] = sequence[kineval.params.dance_pose_index][6];
            reached_flag=1;
        }
        else {  // Checking if movements completed or not
            if (sequence[kineval.params.dance_pose_index][0] - 0.05 <= robot.joints["torso_lift_joint"].angle || sequence[kineval.params.dance_pose_index][0] + 0.05 <= robot.joints["torso_lift_joint"].angle){
                if (sequence[kineval.params.dance_pose_index][1] - 0.05 <= robot.joints["shoulder_pan_joint"].angle || sequence[kineval.params.dance_pose_index][1] + 0.05 <= robot.joints["shoulder_pan_joint"].angle){
                    if (sequence[kineval.params.dance_pose_index][2] - 0.05 <= robot.joints["shoulder_lift_joint"].angle || sequence[kineval.params.dance_pose_index][2] + 0.05 <= robot.joints["shoulder_lift_joint"].angle){
                        if (sequence[kineval.params.dance_pose_index][3] - 0.05 <= robot.joints["elbow_flex_joint"].angle || sequence[kineval.params.dance_pose_index][3] + 0.05 <= robot.joints["elbow_flex_joint"].angle){
                            if (sequence[kineval.params.dance_pose_index][4] - 0.05 <= robot.joints["wrist_flex_joint"].angle || sequence[kineval.params.dance_pose_index][4] + 0.05 <= robot.joints["wrist_flex_joint"].angle){
                                if (sequence[kineval.params.dance_pose_index][5] - 0.05 <= robot.joints["head_pan_joint"].angle || sequence[kineval.params.dance_pose_index][5] + 0.05 <= robot.joints["head_pan_joint"].angle){
                                    if (sequence[kineval.params.dance_pose_index][6] - 0.05 <= robot.joints["head_tilt_joint"].angle || sequence[kineval.params.dance_pose_index][6] + 0.05 <= robot.joints["head_tilt_joint"].angle){
                                        reached_flag=0;
                                        kineval.params.dance_pose_index+=1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

kineval.setpointClockMovement = function execute_clock() {

    // if update not requested, exit routine
    if (!kineval.params.update_pd_clock) return; 

    var curdate = new Date();
    for (x in robot.joints) {
        kineval.params.setpoint_target[x] = curdate.getSeconds()/60*2*Math.PI;
    }
}


kineval.robotArmControllerSetpoint = function robot_pd_control () {
    // if update not requested, exit routine
    if ((!kineval.params.update_pd)&&(!kineval.params.persist_pd)) return; 

    kineval.params.update_pd = false; // if update requested, clear request and process setpoint control

    // STENCIL: implement P servo controller over joints
    for (x in robot.joints) {
        var error = kineval.params.setpoint_target[x] - robot.joints[x].angle,
            kp = 0.08;
        robot.joints[x].control = kp*error; // kP = 0.1 in this case.. Tune more to get better reaction time
    }
}