//set initial message....
// uses the pure JS client API 
// reasons for usage include:
// no latency, which for a Game Engine is important. 
// should a more robust version be required, suggest using the wep socket API. (mitigated latency.)
CLICK = "NODE_CLICKED" //do some game logic

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
app.ports.request.subscribe((message) => {
    message = JSON.parse(message);
    console.log(message);
    gameEngine = new GameEngine;
    response = gameEngine.handleInput(message.msg, message.body)
    //response for API gets generated and sent back to the client. 
    app.ports.response.send(tempMessage);
});

// An easy way to deal with positions. 
class Vec2 {
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
}
// observable subject. Used to tell each node which node has been clicked...
// can be used after the Game Engine has said a click is proper.

class Subject{
	constructor(){
		this.observers = [];
	}
	subscribe(observer){
		this.observers.push(observer)
	}
	unsubscribe(observer){
		this.observers.filter(entry => entry != observer)
	}
	notify(data){
		// tells the node the message. 
		this.observers.forEach(observer => observer.update(data))
	}
}



class GameEngine {
	constructor(){
		this.playableNode = []; // should store the node objects... 
		this.startPos = {}; 
		this.endPos = {};
		this.currentPlayer = 1;  
		this.nodeArray = [] // base for 2d array of nodes...
		this.inPlayNodes = [] // 0 to start, 1 to end.
	}
	// function that might be useful to get the game logic running... 
	// but I'm not sure if this works... need to test it. 
	// Alternative idea is to set up Nodes to know when a click event exists....
	// and then have them call the GameEngine logic to say "hey I've been clicked."
	handleInput(msg, body){
		if(msg == INI){
			return tempMessage;
		}
		// Not using this, but it is a halfway decent list of the steps so we'll  see. 
		if(msg == CLICK){
			// do some game logic  
			// check node is allowed to be used, if not return error. 
			// check array of in play Nodes.... 
			// if no nodes "in play", check if this node is a start or end node
			// if yes, add that node to "in play" and return valid start
			// else error. 
			// if 1 node in play, check slope, if true, check distance. find all points along that slope, check that they are active (again?)
			return validStartMessage
		}
	}
	loss(){
		// if we lose
		return true;
		//else
		return false; 
	}
	endTurn(){
		canStillPlay = Loss(); // check if we have lost... 
		if(canStillPlay == false){
			//currentPlayer loses, return early, 
		}

		//swap players turns if we can still play...
		if(currentPlayer == 1){
			currentPlayer = 2; 
		}
		else{
			currentPlayer = 1; 
		}
	}
	createGrid(width, height){
		var myNode;
		width = width || 4;
		height = height || 4; //default values for the grid. 
		for (var i = 0; i < width; i++){
			this.nodeArray[i] = []; //build this rows 2 d array...
			for(var j = 0; j< height; j++){
				myNode =  new Node(i, j);
				this.nodeArray[i][j] = myNode;
				console.log(myNode)
			}
		}
		console.log(this.nodeArray);
	}
	traverseNodes(startPoint, EndPoint, slope){
		//tell the nodes to become inactive 

	}
	Slope(startPoint, endPoint){
		slope = (startPoint.y - endPoint.y) / (endPoint.x - endPoint.x)
		return slope;
	}
	checkSlope(startPoint, endPoint){
		// checks that a move is valid.
		if(startPoint.x == endPoint.x){
			// the 2 points are on the same line but the slope will be either infinity or negative infinity...
			// return early and say this is a valid slope 
			return true
		}
		else{
			slope = Slope()
			if(Math.abs(slope) == 1 || slope == 0){
				return true;
			}
			else{
				return false;
			}
		}
		//calc rise over run to find the slope of the line....
	}
	updatePlayableNodes(newStart, newEnd){
		//sets the nodes that can be played from. 

	}
}


// Nodes should know when they are clicked what there neighbors look like... 
class Node {
	constructor(x, y){
		this.pos = new Vec2(x, y); // default
		this.active = true // becomes false when the value can no longer be connected to or through...
		this.endNode = false // become true when 
		this.canStart = true; // true until after the first turn.
	}
	becomeInactive(){
		active = false;
	}
}




// 4x4 grid is the default

//START OF GAME 
//any node can be clicked

//first turn finished 
// only nodes NEXT TO the current start and ending Nodes can be clicked...

// the problem is: I just need the Nodes to know that the game is clickable....




validStartMessage = {
    "msg": "VALID_START_NODE",
    "body": {
        "newLine": null,
        "heading": "Player 2", // needs to be changed to state of player...
        "message": "Select a second node to complete the line." //needs to be changed to something appropriate. 
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



