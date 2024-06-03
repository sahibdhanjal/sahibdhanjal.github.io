//   CREATE ROBOT STRUCTURE

// KE 

links_geom_imported = false;

//////////////////////////////////////////////////
/////     DEFINE ROBOT AND LINKS
//////////////////////////////////////////////////

// create robot data object
robot = new Object(); // or just {} will create new object

// give the robot a name
robot.name = "Dynamixel Arm";

// initialize start pose of robot in the world
robot.origin = {xyz: [0,0,0], rpy:[0,0,0]};  

// specify base link of the robot; robot.origin is transform of world to the robot base
robot.base = "base";  

        
// specify and create data objects for the links of the robot
robot.links = {
    "base": {},  
    "shoulder_right": {}, 
    "elbow_right": {}, 
    "wrist_right": {}, 
    "gripper_right": {},
    "gripper_main": {},
};

//////////////////////////////////////////////////
/////     DEFINE JOINTS AND KINEMATIC HIERARCHY
//////////////////////////////////////////////////

// specify and create data objects for the joints of the robot
robot.joints = {};

robot.joints.shoulder_right_yaw = {parent:"base", child:"shoulder_right"};
robot.joints.shoulder_right_yaw.origin = {xyz: [0.0,0.8,0.0], rpy:[-Math.PI/2,0,0]};
robot.joints.shoulder_right_yaw.axis = [0.0,0.0,-1.0]; 

robot.joints.elbow_right_yaw = {parent:"shoulder_right", child:"elbow_right"};
robot.joints.elbow_right_yaw.origin = {xyz: [0.0,0.0,0.9], rpy:[Math.PI/2,0,0]};
robot.joints.elbow_right_yaw.axis = [1.0,0.0,0.0]; 

robot.joints.wrist_right_yaw = {parent:"elbow_right", child:"wrist_right"};
robot.joints.wrist_right_yaw.origin = {xyz: [0.0,0.0,0.9], rpy:[0,0,0]};
robot.joints.wrist_right_yaw.axis = [1.0,0.0,0.0]; 

robot.joints.gripper_right_yaw = {parent:"wrist_right", child:"gripper_right"};
robot.joints.gripper_right_yaw.origin = {xyz: [0.0,0.0,0.9], rpy:[0,0,0]};
robot.joints.gripper_right_yaw.axis = [1.0,0.0,0.0]; 

robot.joints.main_yaw = {parent:"gripper_right", child:"gripper_main"};
robot.joints.main_yaw.origin = {xyz: [0.0,0.0,0.9], rpy:[0,0,0]};
robot.joints.main_yaw.axis = [1.0,0.0,0.0]; 

// specify name of endeffector frame
robot.endeffector = {};
robot.endeffector.frame = "main_yaw";
robot.endeffector.position = [[0],[0],[0.5],[1]];

//////////////////////////////////////////////////
/////     DEFINE LINK threejs GEOMETRIES
//////////////////////////////////////////////////

/*  threejs geometry definition template, will be used by THREE.Mesh() to create threejs object
    // create threejs geometry and insert into links_geom data object
    links_geom["link1"] = new THREE.CubeGeometry( 5+2, 2, 2 );

    // example of translating geometry (in object space)
    links_geom["link1"].applyMatrix( new THREE.Matrix4().makeTranslation(5/2, 0, 0) );

    // example of rotating geometry 45 degrees about y-axis (in object space)
    var temp3axis = new THREE.Vector3(0,1,0);
    links_geom["link1"].rotateOnAxis(temp3axis,Math.PI/4);
*/

// define threejs geometries and associate with robot links 
links_geom = {};

temp_material = new THREE.MeshLambertMaterial( { } );
temp_material.color.r = 0.5;
temp_material.color.g = 0.5;
temp_material.color.b = 0.5;
temp_material.transparent = false;

links_geom["base"] = new THREE.CubeGeometry( 0.7, 0.8, 0.7 );
links_geom["base"].applyMatrix( new THREE.Matrix4().makeTranslation(0, 0.4, 0) );

links_geom["shoulder_right"] = new THREE.CubeGeometry( 0.3, 0.3, 1 );
links_geom["shoulder_right"].applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 0.5) );

links_geom["elbow_right"] = new THREE.CubeGeometry( 0.3, 0.3, 1 );
links_geom["elbow_right"].applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 0.5) );

links_geom["wrist_right"] = new THREE.CubeGeometry( 0.3, 0.3, 1 );
links_geom["wrist_right"].applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 0.5) );

links_geom["gripper_right"] = new THREE.CubeGeometry( 0.3, 0.3, 1 );
links_geom["gripper_right"].applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 0.5) );

links_geom["gripper_main"] = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 20, 20, false);
links_geom["gripper_main"].applyMatrix( new THREE.Matrix4().makeTranslation(0, 0, 0.14) );

