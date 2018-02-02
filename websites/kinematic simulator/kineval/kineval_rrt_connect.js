
/*-- |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/|

    KinEval | Kinematic Evaluator | RRT motion planning

    Implementation of robot kinematics, control, decision making, and dynamics 
        in HTML5/JavaScript and threejs
     
    @author ohseejay / https://github.com/ohseejay / https://bitbucket.org/ohseejay

    Chad Jenkins
    Laboratory for Perception RObotics and Grounded REasoning Systems
    University of Michigan

    License: Creative Commons 3.0 BY-SA

|\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| |\/| --*/

//////////////////////////////////////////////////
/////     RRT MOTION PLANNER
//////////////////////////////////////////////////

// STUDENT: 
// compute motion plan and output into robot_path array 
// elements of robot_path are vertices based on tree structure in tree_init() 
// motion planner assumes collision checking by kineval.poseIsCollision()

/* KE 2 : Notes:
   - Distance computation needs to consider modulo for joint angles
   - robot_path[] should be used as desireds for controls
   - Add visualization of configuration for current sample
*/

/*
STUDENT: reference code has functions for:

*/

kineval.planMotionRRTConnect = function motionPlanningRRTConnect() {

    // exit function if RRT is not implemented
    //   start by uncommenting kineval.robotRRTPlannerInit 
    if (typeof kineval.robotRRTPlannerInit === 'undefined') return;

    if ((kineval.params.update_motion_plan) && (!kineval.params.generating_motion_plan)) {
        kineval.robotRRTPlannerInit();
        kineval.params.generating_motion_plan = true;
        kineval.params.update_motion_plan = false;
        kineval.params.planner_state = "initializing";
    }
    if (kineval.params.generating_motion_plan) {
        rrt_result = robot_rrt_planner_iterate();
        if (rrt_result === "reached") {
            kineval.params.update_motion_plan = false; // KE T needed due to slight timing issue
            kineval.params.generating_motion_plan = false;
            textbar.innerHTML = "planner execution complete";
            kineval.params.planner_state = "complete";
        }
        else kineval.params.planner_state = "searching";
    }
    else if (kineval.params.update_motion_plan_traversal||kineval.params.persist_motion_plan_traversal) {

        if (kineval.params.persist_motion_plan_traversal) {
            kineval.motion_plan_traversal_index = (kineval.motion_plan_traversal_index+1)%kineval.motion_plan.length;
            textbar.innerHTML = "traversing planned motion trajectory";
        }
        else
            kineval.params.update_motion_plan_traversal = false;

        // set robot pose from entry in planned robot path
        robot.origin.xyz = [
            kineval.motion_plan[kineval.motion_plan_traversal_index].vertex[0],
            kineval.motion_plan[kineval.motion_plan_traversal_index].vertex[1],
            kineval.motion_plan[kineval.motion_plan_traversal_index].vertex[2]
        ];

        robot.origin.rpy = [
            kineval.motion_plan[kineval.motion_plan_traversal_index].vertex[3],
            kineval.motion_plan[kineval.motion_plan_traversal_index].vertex[4],
            kineval.motion_plan[kineval.motion_plan_traversal_index].vertex[5]
        ];

        // KE 2 : need to move q_names into a global parameter
        for (x in robot.joints) {
            robot.joints[x].angle = kineval.motion_plan[kineval.motion_plan_traversal_index].vertex[q_names[x]];
        }

    }
}

// STENCIL: uncomment and complete initialization function
kineval.robotRRTPlannerInit = function robot_rrt_planner_init() {

    // form configuration from base location and joint angles
    q_start_config = [
        robot.origin.xyz[0],
        0,
        robot.origin.xyz[2],
        robot.origin.rpy[0],
        robot.origin.rpy[1],
        robot.origin.rpy[2]
    ];

    q_names = {};  // store mapping between joint names and q DOFs
    q_index = [];  // store mapping between joint names and q DOFs

    for (x in robot.joints) {
        q_names[x] = q_start_config.length;
        q_index[q_start_config.length] = x;
        q_start_config = q_start_config.concat(robot.joints[x].angle);
    }

    // set goal configuration as the zero configuration
    var i; 
    q_goal_config = new Array(q_start_config.length);
    for (i=0;i<q_goal_config.length;i++) q_goal_config[i] = 0;

    // flag to continue rrt iterations
    rrt_iterate = true;
    rrt_iter_count = 0;
    stepSize = 1;
    tolerance = 1.2*stepSize;

    // make sure the rrt iterations are not running faster than animation update
    cur_time = Date.now();
    
    T_a = tree_init(q_start_config,"T_a");
    T_b = tree_init(q_goal_config,"T_b");

    q_new = [];
    tree1 = T_a;
    tree2 = T_b;
    target = q_goal_config;
}

function robot_rrt_planner_iterate() {

    var i;
    rrt_alg = 1;  // 0: basic rrt (OPTIONAL), 1: rrt_connect (REQUIRED), 2: rrt_star

    if (rrt_iterate && (Date.now()-cur_time > 10)) {
        rrt_iter_count+=1;
        cur_time = Date.now();

        var rand = random_config();

        if(kineval.poseIsCollision(q_start_config)!=false || kineval.poseIsCollision(q_goal_config)!=false) {
            rrt_iterate = false;
            console.log(" Search Failed!");
            return "start/goal obstacle";
        }

        if(distance(q_start_config,q_goal_config)<=0.2*stepSize) {
            console.log("Reached Target!");
            rrt_iterate = false;
            return "reached"
        }

        
        if(rrt_alg==0) {
            textbar.innerHTML = "RRT has been invoked.  Iteration: " + rrt_iter_count;
            var result = rrt_extend(rand,q_goal_config,T_a);
            if(result=="reached"){
                path_dfs(q_goal_config, q_start_config, T_a);
                return "reached";
            }
            return "iterating";
        }

        else if(rrt_alg==1) {
            textbar.innerHTML = "RRT-Connect has been invoked. Iteration: " + rrt_iter_count;
            if(rrt_extend(rand, target, tree1)!="trapped")
                if(rrt_connect(q_new,tree2)=="reached"){
                    path_dfs(q_new,q_start_config,T_a);
                    path_dfs(q_new,q_goal_config,T_b);
                    rrt_iterate = false;
                    return "reached";
                }

            if(tree1.name == "T_a"){
                tree1 = T_b;
                tree2 = T_a;
                target = q_goal_config;
            }
            else{
                tree1 = T_a;
                tree2 = T_b;
                target = q_start_config;
            }

            return "iterating";
        }

        else {
            textbar.innerHTML = "RRT-Star has been invoked. Iteration: " + rrt_iter_count;
            var nearest = nearest_neighbor(rand, T_a),
                vertex = new_config(nearest,rand, T_a);

            if(distance(vertex,q_goal_config)<= 2*stepSize)
                vertex = q_goal_config;
            
            if (Math.abs(vertex[0] - q_goal_config[0]) <= 0.2*stepSize && Math.abs(vertex[2] - q_goal_config[2]) <= 0.2*stepSize)
                vertex = q_goal_config;
            
            if(kineval.poseIsCollision(vertex)==false && inTree(vertex,T_a)==false){
                var near = findNeighborhood(vertex,T_a),
                    parent_idx = chooseParent(vertex, nearest, near, T_a),
                    parent = T_a.vertices[parent_idx].vertex,
                    cost = T_a.vertices[parent_idx].cost + distance(parent,vertex);

                tree_add_vertex(T_a, vertex, parent, cost);
                tree_add_edge(T_a, T_a.newest, parent_idx);
                reWire(vertex, nearest, near, T_a);

                if(isEqual(vertex,q_goal_config)==true) {
                    console.log("Found Path");
                    path_dfs(q_goal_config, q_start_config, T_a);
                    rrt_iterate = false;
                }
            }
        }
    }
}

//////////////////////////////////////////////////
/////     STENCIL SUPPORT FUNCTIONS
//////////////////////////////////////////////////

function tree_init(q,name) {

    // create tree object
    var tree = {};

    // initialize with vertex for given configuration
    tree.vertices = [];
    tree.vertices[0] = {};
    tree.vertices[0].vertex = q;
    tree.vertices[0].edges = [];
    tree.vertices[0].cost = 0;
    tree.vertices[0].parent = [];
    tree.name = name;

    // create rendering geometry for base location of vertex configuration
    add_config_origin_indicator_geom(tree.vertices[0]);

    // maintain index of newest vertex added to tree
    tree.newest = 0;

    return tree;
}

function tree_add_vertex(tree, q, parent, cost) {
    // create new vertex object for tree with given configuration and no edges
    var new_vertex = {};
    new_vertex.edges = [];
    new_vertex.vertex = q;
    new_vertex.parent = parent;
    new_vertex.cost = cost;

    // create rendering geometry for base location of vertex configuration
    add_config_origin_indicator_geom(new_vertex);

    // maintain index of newest vertex added to tree
    tree.vertices.push(new_vertex);
    tree.newest = tree.vertices.length - 1;
}

function add_config_origin_indicator_geom(vertex) {

    // create a threejs rendering geometry for the base location of a configuration
    // assumes base origin location for configuration is first 3 elements 
    // assumes vertex is from tree and includes vertex field with configuration

    temp_geom = new THREE.CubeGeometry(0.1,0.1,0.1);
    temp_material = new THREE.MeshLambertMaterial( { color: 0xffff00, transparent: true, opacity: 0.7 } );
    temp_mesh = new THREE.Mesh(temp_geom, temp_material);
    temp_mesh.position.x = vertex.vertex[0];
    temp_mesh.position.y = vertex.vertex[1];
    temp_mesh.position.z = vertex.vertex[2];
    scene.add(temp_mesh);
    vertex.geom = temp_mesh;
}

function tree_add_edge(tree,q1_idx,q2_idx) {

    // add edge to first vertex as pointer to second vertex
    tree.vertices[q1_idx].edges.push(tree.vertices[q2_idx]);

    // add edge to second vertex as pointer to first vertex
    tree.vertices[q2_idx].edges.push(tree.vertices[q1_idx]);

    // can draw edge here, but not doing so to save rendering computation
}

function tree_remove_edge(tree, q1_idx, q2_idx) {
    var edge1 = tree.vertices[q1_idx].edges,
        edge2 = tree.vertices[q2_idx].edges,
        vertex1 = tree.vertices[q1_idx].vertex,
        vertex2 = tree.vertices[q2_idx].vertex,
        l1 = edge1.length,
        l2 = edge2.length,
        pos = 0;

    for(var i=0; i<l1; i++)
        if (isEqual(edge1[i],vertex2))
            pos = i;
    edge1.splice(pos,1);

    for(var i=0; i<l2; i++)
        if (isEqual(edge2[i],vertex1))
            pos = i;
    edge2.splice(pos,1);
}

//////////////////////////////////////////////////
/////     RRT IMPLEMENTATION FUNCTIONS
//////////////////////////////////////////////////


    // STENCIL: implement RRT-Connect functions here, such as:
    //   rrt_extend
    //   rrt_connect
    //   random_config
    //   new_config
    //   nearest_neighbor
    //   normalize_joint_state
    //   find_path
    //   path_dfs

// Chooses parent with minimum cost
function chooseParent(target, min_idx, nbr_idxs, tree) {
    var cmin = tree.vertices[min_idx].cost + strip(distance(tree.vertices[min_idx].vertex, target)),
        pos = min_idx;

    if(nbr_idxs.length>0){
        for(var i=0; i<nbr_idxs.length;i++){
            var cost = tree.vertices[nbr_idxs[i]].cost + strip(distance(tree.vertices[nbr_idxs[i]].vertex, target));
            if (cost<cmin)
                pos = nbr_idxs[i];
        }
    }
    return pos;
}

// Rewires the structure
function reWire(target, min_idx, nbr_idxs, tree) {
    if(nbr_idxs.length>0)
        for(var i=0; i<nbr_idxs.length; i++){
            var cost = tree.vertices[nbr_idxs[i]].cost;
            var new_cost = tree.vertices[tree.newest].cost + strip(distance(tree.vertices[tree.newest].vertex, tree.vertices[nbr_idxs[i]].vertex));
            if (new_cost<cost){
                tree.vertices[nbr_idxs[i]].cost = new_cost;
                var parent_idx = getIndex(tree.vertices[nbr_idxs[i]].parent,tree);
                tree.vertices[nbr_idxs[i]].parent = tree.vertices[tree.newest].vertex;
                tree_add_edge(tree,nbr_idxs[i],tree.newest);
                tree_remove_edge(tree, parent_idx, nbr_idxs[i]);
            }
        }
}

// Connects double RRTs based on RRT-Connect Algorithm
function rrt_connect(target, tree) {
    var result = rrt_extend(target,target,tree);
    if(result=="advanced")
        result = rrt_extend(target, target, tree);
    return result;
}

// Extends and expands RRTs
function rrt_extend(rand, target, tree) {
    var nnbr_idx = nearest_neighbor(rand,tree),
        vertex = new_config(nnbr_idx, rand, tree),
        parent = tree.vertices[nnbr_idx].vertex,
        cost = tree.vertices[nnbr_idx].cost + strip(distance(vertex,parent));

    if(distance(vertex,target) <= stepSize)
        vertex = target;

    if (Math.abs(vertex[0] - target[0]) <= 0.1*stepSize && Math.abs(vertex[2] - target[2]) <= 0.1*stepSize)
                vertex = target;

    if(kineval.poseIsCollision(vertex)==false && inTree(vertex,tree)==false){
        tree_add_vertex(tree, vertex, parent, cost);
        tree_add_edge(tree, tree.newest, nnbr_idx);

        q_new = vertex;

        if(isEqual(vertex,target)==true){
            rrt_iterate = false;
            return "reached";
        }

        return "advanced";
    }

    else
        return "trapped";
}

// Draws Path on the map
function path_dfs(node, target, tree){
    var curr = node,
        path = []

    while(isEqual(curr,target)==false){
        path.push(curr);
        var curr_idx = getIndex(curr,tree),
            parent = tree.vertices[curr_idx].parent;
        
        kineval.motion_plan.push(tree.vertices[curr_idx]);
        tree.vertices[curr_idx].geom.material.color = {r:1,g:0,b:0};

        curr = parent;
    }
}

// Returns a suitable new configuration if available
function new_config(q_idx, rand, tree) {
    var n = strip(distance(rand, tree.vertices[q_idx].vertex)),
        xd = [];

    for(var i=0;i<rand.length;i++) {
        var dt = stepSize*(rand[i] - tree.vertices[q_idx].vertex[i])/n;
        if (i!=1)
            xd.push(tree.vertices[q_idx].vertex[i] + dt);
        else
            xd.push(tree.vertices[q_idx].vertex[i]);
    }

    return xd;
}

// Generates an N-D random configuration
function random_config() {
    var x_min = robot_boundary[0][0],
        y_min = robot_boundary[0][1],
        z_min = robot_boundary[0][2],
        x_max = robot_boundary[1][0],
        y_max = robot_boundary[1][1],
        z_max = robot_boundary[1][2],
        x = Math.random() * (x_max - x_min) + x_min,
        y = Math.random() * (y_max - y_min) + y_min,
        z = Math.random() * (z_max - z_min) + z_min,
        R = 0,//Math.random() * (4*Math.PI) - 2*Math.PI,
        P = strip(Math.random() * (2*Math.PI)),
        Y = 0,//Math.random() * (4*Math.PI) - 2*Math.PI,
        q = [x,y,z,R,P,Y];

    for (x in robot.joints)
        q = q.concat(strip(Math.random()*(2*Math.PI)));

    return q;
}

// Returns all node indexes in neighborhood
function findNeighborhood(target, tree) {
    var nbrs = [];
    for(var i=0; i<=tree.newest; i++)
        if (distance(target,tree.vertices[i].vertex) <= tolerance)
            nbrs.push(i);
    return nbrs;
}

// Returns the index of the nearest neighbour
function nearest_neighbor(target, tree) {
    var min = 999999,
        pos = 0,
        dist = 0;

    for(var i=0; i<=tree.newest; i++) {
        var dist = distance(target,tree.vertices[i].vertex);
        if (min >= dist) {min = dist; pos = i;}
    }
    return pos;
}

// Checks if arrays are equal
function isEqual(q1,q2) {
    for(var i=0; i<q1.length; i++)
        if (q1[i]!=q2[i])
            return false;
    return true;
}

// Returns index of vertex, if it's in the tree
function getIndex(vertex, tree) {
    if (inTree(vertex,tree))
        for(var i=0; i<=tree.newest; i++)
            if (isEqual(vertex, tree.vertices[i].vertex))
                return i;
    return null;
}

// Checks if the vertex is already in the tree or not
function inTree(vertex, tree) {
    for(var i=0; i<=tree.newest; i++)
        if (isEqual(vertex, tree.vertices[i].vertex))
            return true;
    return false;
}

// Returns Norm of a vector
function norm(q) {
    var sum = 0;
    for(var i=0; i<q.length; i++)
        sum += q[i]*q[i];
    return Math.sqrt(q);
}

// Returns distance between 2 N-D vectors
function distance(q1, q2) {
    var len1 = q1.length,
        len2 = q2.length,
        dist = 0;
    
    if (len1!=len2)
        console.log("incompatible vectors");

    for(var i=0;i<len1;i++)
        dist += Math.pow((q1[i] - q2[i]),2);

    return Math.sqrt(dist);
}

// Rounds a number to 2 digit precision
function strip(val){
    return (Math.round(val*100)/100);
}

function printTree(tree) {
    for(var i=0; i<=tree.newest; i++)
        print(tree.vertices[i].vertex);
}

// Prints the elements of an array
function print(arr) {
    var st = "Path := \n";
    
    for(var i=0;i<arr.length;i++)
        st += "["+arr[i] + "]\n"
    console.log(st);
}