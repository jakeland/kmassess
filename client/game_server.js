//set initial message....
// uses the pure JS client API 
// reasons for usage include:
// no latency, which for a Game Engine is important. 
// should a more robust version be required, suggest using the wep socket API. (mitigated latency.)
CLICK = "NODE_CLICKED" //do some game logic

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
app.ports.request.subscribe((message) => {
    message = JSON.parse(message);
    // just debugging...
    console.log(message);
    gameEngine = new GameEngine;
    response = gameEngine.handleInput(message.msg, message.body)
    // response for API gets generated and sent back to the client. 
    // fake message for debugging purpose..
    app.ports.response.send(response);
});

// since position is always a pair of values, made a custom class.
class Vec2 {
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
}
// observable subject. Used to tell each node which node has been clicked...
// can be used after the Game Engine has said a click is proper.
// can also subscribe all the neighbor Nodes to the Node in question. 
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
		this.observers.forEach(observer => observer.check(data))
	}
}

clickedSubject = new Subject;
inPlayNodes = new Subject;
inPlayNodes.setStartNode = function(data){
	this.observers.forEach(observer => observer.setStartNode(data))
}

inPlayNodes.setEndNode = function(data){
	this.observers.forEach(observer => observer.setEndNode(data))
}
inPlayNodes.clearNodes = function(data){
	this.observers.forEach(observer => observer.clearNodes())
}

class GameEngine {
	constructor(){
		this.playableNode = []; // should store the node objects... 
		this.startPos = {}; 
		this.endPos = {};
		this.currentPlayer = 1;  
		this.nodeArray = [] // base for 2d array of nodes...
		this.inPlayNodes = {} // inPlayNodes has a start and an end
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
			return iniMessage;
		}
		// Not using this, but it is a halfway decent list of the steps so we'll  see. 
		if(msg == CLICK){
			console.log('body.x')
			return this.handleClick(body);
		}
		console.log(msg)
		console.log(body)
		console.log('oh no')
	}
	handleClick(body){
		// if in play has no values in it...
		let coords = new Vec2(body.x, body.y)
		clickedSubject.notify(coords)
		return validStartMessage
		// else do the step for the ending node .
	}
	loss(){
		// losing logic 
		// if we lose, gimme the player
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
		width = width || 4; // default values for the grid. swap to constants... probably.
		height = height || 4; //default values for the grid. 
		for (var i = 0; i < width; i++){
			this.nodeArray[i] = []; //build this rows 2d array...
			for(var j = 0; j< height; j++){
				myNode =  new Node(i, j);
				this.nodeArray[i][j] = myNode;
				console.log(myNode)
				clickedSubject.subscribe(myNode);
				console.log('yup')
			}
		}
		console.log(this.nodeArray);
	}
	traverseNodes(startPoint, EndPoint, slope){
		//check each Node in the line, then if they are all clickable, tell them to become active or inactive. 
		//check slope, return early if it fails. 
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
	setEndNode(node){
		this.inPlayNodes.start = node;
	}
	setStartNode(coords){
		this.inPlayNodes.end = node; 
	}
	clearNodes(){
		this.inPlayNodes = {};
	}
	updatePlayableNodes(newStart, newEnd){
		//sets the nodes that can be played from. 
		//sets 
	}
}


// Nodes should know when they are clicked what there neighbors look like... 
class Node {
	constructor(x, y){
		this.pos = new Vec2(x, y); 
		this.beenPlayed = false; // Once a node has been clicked it can't be played 
		this.inPlay = false; // true when clicked as the first Node of a turn, and allowed to be played from.
	}
	check(data){
		// takes data from Notification subject and decides how to proceed. 
		if(this.pos.x == data.x && this.pos.y == data.y){
			// tell game engine I've got this going....
			startNode.notify(this);
			this.inPlay = true;
		}

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



