//set initial message....
// uses the pure JS client API 
// reasons for usage include:
// no latency, which for a Game Engine is important. 
// should a more robust version be required, suggest using the wep socket API. (mitigated latency.)
CLICK = "NODE_CLICKED" //do some game logic

invalidEndNode = {
    "msg": "INVALID_END_NODE",
    "body": {
        "newLine": null,
        "heading": "Player 2",
        "message": "Invalid move!"
    }
}
validStartMessage = {
    "msg": "VALID_START_NODE",
    "body": {
        "newLine": null,
        "heading": "Player", // needs to be changed to state of player...
        "message": "Select a second node to complete the line." //needs to be changed to something appropriate. 
    }
}

iniMessage = {
    "msg": "INITIALIZE", //used to check input. 
    "body": {
        "newLine": null,
        "heading": "Player 1",
        "message": "Awaiting Player 1's Move"
    }
}

// every message runs through here
// could create a subject, then have the subject notify with the data?


// since position is always a pair of values, made a custom class.
class Vec2 {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}


class GameEngine {
    constructor(){
        this.playableNode = []; // should store the node objects... 
        this.startPos = {}; 
        this.endPos = {};
        this.currentPlayer = 1;  
        this.nodeArray = [] // base for 2d array of nodes...
        this.inPlayNodes = {} // inPlayNodes has a start and an end
        //inPlayNodes.subscribe(this);
    }
    // function that might be useful to get the game logic running... 
    // but I'm not sure if this works... need to test it. 
    // Alternative idea is to set up Nodes to know when a click event exists....
    // and then have them call the GameEngine logic to say "hey I've been clicked."
    handleInput(msg, body){
        // swap this to a case statement. 
        if(msg == iniMessage.msg){
            console.log('what')
            this.createGrid(4, 4); 
            return iniMessage; // sets up the grid
        }
        // Not using this, but it is a halfway decent list of the steps so we'll  see. 
        if(msg == CLICK){
           return this.handleNodeClick(body);
        }
    }
    // figures out how to respond to the click...
    swapPlayer(){
        this.inPlayNodes = {};
        if(this.currentPlayer == 1){
            this.currentPlayer = 2;
        }
        else{
            this.currentPlayer = 1;
        }
    }
    handleNodeClick(body){
        // is this Node the startNode? 
        let node = this.nodeArray[body.x][body.y]
        if(node.active == false){
            return invalidEndNode;
        }
        if(this.inPlayNodes.hasOwnProperty('start')){
            var start = this.inPlayNodes.start
            console.log('oh my')
            if (this.checkSlope(start.pos, node.pos)){
                this.swapPlayer(start, node);
                return this.validEndNode(start.pos, node.pos);
            }
            else{
                console.log('oh no')
            }

        }
        else{
            this.inPlayNodes.start = node;
            return validStartMessage;

        }
    }
    validEndNode(start, end){
        return ({
            "msg": "VALID_END_NODE",
            "body": {
                "newLine": {
                    "start": {
                        "x": start.x,
                        "y": start.y
                    },
                    "end": {
                        "x": end.x,
                        "y": end.y
                    }
                },
                "heading": "Player " + this.currentPlayer,
                "message": null
            }
        })
    }
    createGrid(width, height){
        var myNode;
        width = width || 4; // default values for the grid. swap to constants... probably.
        height = height || 4; //default values for the grid. 
        for (var i = 0; i < width; i++){
            this.nodeArray[i] = []; //build this rows 2d array...
            for(var j = 0; j< height; j++){
                myNode =  new Node(i, j);
                this.nodeArray[i][j] = myNode;
                console.log(myNode)
                //clickedSubject.subscribe(myNode);
                console.log('yup')
            }
        }
        console.log(this.nodeArray);
        this.canBeStarted = this.nodeArray;
    }
    traverseNodes(startPoint, EndPoint, slope){
        //check each Node in the line, then if they are all clickable, tell them to become active or inactive. 
        //check slope, return early if it fails. 
    }
    Slope(startPoint, endPoint){
        let slope = (startPoint.y - endPoint.y) / (startPoint.x - endPoint.x)
        return slope; 
    }
    // just checks the slope of the line to make sure we're allowed to deal with this. 
    checkSlope(startPos, endPos){
        // checks that a move is valid.
        if(startPos.x == endPos.x){
            // the 2 points are on the same line but the slope will be either infinity or negative infinity...
            // return early and say this is a valid slope 
            return true
        }
        else{
            let slope = this.Slope(startPos, endPos)
            if(Math.abs(slope) == 1 || slope == 0){
                return true;
            }
            else{
                return false;
            }
        }
        //calc rise over run to find the slope of the line....
    }
  
}


// Nodes should know when they are clicked what there neighbors look like... 
class Node {
    constructor(x, y){
        this.pos = new Vec2(x, y); 
        this.connections = 0; // Once a node has been clicked it can't be played 
        this.inPlay = false; // temp value true when clicked as the first Node of a turn, and allowed to be played from.
    }
    check(data){
        // takes data from Notification subject and decides how to proceed. 
        if(this.pos.x == data.x && this.pos.y == data.y && this.pos.y){
            // if this has already been played and we're selecting the end node, send an error. 
            if (this.connections > 1){
                //send a message that this has already been used
                return false;
                
            }
            // tell game engine I've got this going....f
            this.inPlay = true;
            return true;
        }
        else{
            //send error message to 
        }

    }
    checkNeighbor(data){
        //assuming we play in the fourth quadrant ONLY
        // may need a rework if that changes. 
        if(Math.abs(data.x - this.pos.x) == 1 && Math.abs(data.y - this.pos.y == 1)){
            // this node can be played from
            console.log(this.pos)
        }
    }
    becomeInactive(){
        active = false;
    }
}

validEndMessage = {
    "msg": "VALID_END_NODE",
    "body": {
        "newLine": null,
        "heading": "Player 2",
        "message": "Player Ones Turn"
    }
}

goMessage = {
    "msg": "GAME_OVER",
    "body": {
        "newLine": null, 
        "heading": "", 
    }
}



gameEngine = new GameEngine; // build the game engine....

app.ports.request.subscribe((message) => {
    message = JSON.parse(message);
    // just debugging...
    console.log(message);
    response = gameEngine.handleInput(message.msg, message.body)
    // response for API gets generated and sent back to the client. 
    // fake message for debugging purpose..
    app.ports.response.send(response);
});
