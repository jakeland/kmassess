//set initial message....
// uses the pure JS client API 
// reasons for usage include:
// no latency, which for a Game Engine is important. 
// should a more robust version be required, suggest using the wep socket API. (mitigated latency.)
CLICK = "NODE_CLICKED" //do some game logic
gridMinX= 0; // default minimum value for the grid
gridMaxX = 4; //default maximum value for the X
gridMinY = 0; // default minimum value for the grid
gridMaxY = 4; // default minimum value for the Y


function invalidEndNode(_optionalMessage){
    message = _optionalMessage || "Invalid move!"
    return({
        "msg": "INVALID_END_NODE",
        "body": {
            "newLine": null,
            "heading": "Player "+ gameEngine.currentPlayer,
            "message": "Invalid move!"
        }
    })
}
function invalidStartMessage(_optionalMessage){
    message = _optionalMessage || "Invalid Start! Please select a node at the end of the current line!"
    return ({
        "msg": "INVALID_START_NODE",
        "body": {
            "newLine": null,
            "heading": "Player "+ gameEngine.currentPlayer, // needs to be changed to state of player...
            "message": message //needs to be changed to something appropriate. 
        }
    })
}
function validStartMessage(_optionalMessage){
    message = _optionalMessage || "Select a second node to complete the line."
    return ({
        "msg": "VALID_START_NODE",
        "body": {
            "newLine": null,
            "heading": "Player "+ gameEngine.currentPlayer, // needs to be changed to state of player...
            "message": message //needs to be changed to something appropriate. 
        }
    })
}

function iniMessage(player, _optionalMessage){
    message = _optionalMessage || "Awaiting Player " + player + "'s turn"
    return ({
        "msg": "INITIALIZE", //used to check input. 
        "body": {
            "newLine": null,
            "heading": "Player " + player,
            "message": message
        }
    })
}


function validEndNode(start, end){
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
            "heading": "Player " + gameEngine.currentPlayer,
            "message": null
        }
    })
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
        this.initialTurn = true;
        this.currentPlayer = 1;  
        this.requiredConnections = 0;
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
        if(msg == iniMessage().msg){
            this.createGrid(4, 4); //sets up the grid
            return iniMessage(1); 
        }
        // Not using this, but it is a halfway decent list of the steps so we'll  see. 
        if(msg == CLICK){
           return this.handleNodeClick(body);
        }
    }
    // figures out how to respond to the click...
    swapPlayer(start, end){
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
        var node = this.nodeArray[body.x][body.y];
        var lineArray = []; // resets the nodeArray to []...

        if(node.active == false){
            return invalidEndNode();
        }
        // 
        if(this.inPlayNodes.hasOwnProperty('start')){
            var start = this.inPlayNodes.start
            if ((start.connections > this.requiredConnections || node.connections > 0) || !this.checkSlope(start.pos, node.pos)){
                this.inPlayNodes = {};
                return invalidEndNode();
            }
            else{
                lineArray = this.traverseNodes(start.pos, node.pos);
                if(lineArray == false){
                    this.inPlayNodes = {}
                    return invalidEndNode();
                }else{
                    console.log(lineArray)
                    this.requiredConnections = 1;
                    lineArray.forEach(function(n){
                        if(n == lineArray[0] || n == lineArray[lineArray.length -1]){
                            this.nodeArray[n.pos.x][n.pos.y].connections += 1;
                        }else{
                            this.nodeArray[n.pos.x][n.pos.y].connections += 2;
                        } 
                    }, this)
                    this.swapPlayer(start, node);
                    this.initialTurn == false;
                    return validEndNode(start.pos, node.pos);
                }
            }

        }
        else{
            if (node.connections == this.requiredConnections){
                this.inPlayNodes.start = node;
                return validStartMessage();                
            } 
            else{
                return invalidStartMessage();
            }
        }
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
            }
        }
        this.canBeStarted = this.nodeArray;
    }
    traverseNodes(startPoint, endPoint, slope){
        var min;
        var max;

        if (startPoint.x == endPoint.x){
            return this.traverseVertical(startPoint, endPoint);
        }
        else if (startPoint.y == endPoint.y){
            return this.traverseHorizontal(startPoint, endPoint);
        }
        else{
            return this.traverseDiagonal(startPoint, endPoint)
        }
        //var intercept = this.intercept(startPoint, slope)
        //check each Node in the line, then if they are all clickable, tell them to become active or inactive. 
        //check slope, return early if it fails. 
    }
    traverseDiagonal(startPoint, endPoint){
        if(startPoint.x < endPoint.x){
            var min = startPoint.x;
            var max = endPoint.x;            
        }else{
            min = endPoint.x;
            max = startPoint.x;
        }

        var lineArray =[];
        this.connectionCheck = 1; 
        var slope = this.slope(startPoint, endPoint);
        var intercept = this.intercept(startPoint, slope);
        var y;
        for(var i = min; i <= max; i+= 1){
            y = slope * i + intercept;
            if(this.nodeArray[i][y].connections == 2){
                lineArray = false; 
                break;
            }else{
                lineArray.push(this.nodeArray[i][y])
            }

        }
        return lineArray; 

    }
    traverseHorizontal(startPoint, endPoint){
        var min;
        var max; 
        if(startPoint.x < endPoint.x){
            min = startPoint.x;
            max = endPoint.x;
        }else{
            min = endPoint.x;
            max = startPoint.x;
        }

        var lineArray = []
        for (var i = min; i <= max; i+= 1){
            //this isn't dry, but having written it out this way I have some better ideas of how to do it. 
            // hopefully I can come back to it. 
            if(this.nodeArray[i][startPoint.y].connections == 2){
                lineArray = false;
                break;
            }else{
                lineArray.push(this.nodeArray[i][startPoint.y])
            }
        }
        return lineArray;
    }
    traverseVertical(startPoint, endPoint){
        var min; 
        var max;
        var lineArray = [];
        if(startPoint.y < endPoint.y){
            min = startPoint.y;
            max = endPoint.y;
        }else{
            min = endPoint.y;
            max = startPoint.y;
        }
        for (var i = min; i<= max; i++){
            if(this.nodeArray[startPoint.x][i].connections == 2){
              lineArray = false;
              break;
            }else{
                lineArray.push(this.nodeArray[startPoint.x][i])
            }
        }
        return lineArray;
       
    }
    intercept(start, slope){
        //y = m * x + b;
        if(slope === -Infinity || slope === Infinity){
            return 0; 
        }
        else{
             return start.y - slope * start.x;
        }
    }
    slope(startPoint, endPoint){
        var slope = (startPoint.y - endPoint.y) / (startPoint.x - endPoint.x)
        return slope; 
    }
    checkNeighbor(node){
        
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
            var slope = this.slope(startPos, endPos)
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
    response = gameEngine.handleInput(message.msg, message.body)
    // response for API gets generated and sent back to the client. 
    // fake message for debugging purpose..
    app.ports.response.send(response);
});
