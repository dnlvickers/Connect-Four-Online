//globals required on cliend stide
const sock = io();
var canvas,ctx;
var gameBoard = [];

//load in the game board on start of page
document.addEventListener('DOMContentLoaded',function(){
	canvas=document.getElementById('gameCanvas');
	ctx = canvas.getContext('2d');
	generate_board();
});

//handles writing messages from server and sending to player
function writeEvent(text) {
	const parent = document.querySelector('#events');
	parent.innerHTML = text;
};

sock.on('message',function(text){
	writeEvent(text);
});

//handles recieving server side game board and updating the client side game board
sock.on('board',function(board){
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			gameBoard[i][j].type = board[i][j];
			gameBoard[i][j].draw();
		}
	}
});

//handles selecting the colummn the player wants to add a piece to
function mouse_down(event) {
	const column_width = Math.floor(canvas.width/7.0);
	const column = Math.floor(event.layerX/column_width);
	console.log(column);
	sock.emit('move',column);
}

//class to handle convenient drawing of game pieces
class Circle {
	constructor (x = 0, y = 0, radius = 50, type = 0) {
		this.x = Number(x);
		this.y = Number(y);
		this.radius = Math.floor(canvas.width/14.0)*0.9;
		this.type = type;
	}
	draw() {
		ctx.beginPath();
		if (this.type == 2) {
			ctx.fillStyle = 'white';	
		} else if (this.type == 0) {
			ctx.fillStyle = 'red';
		} else if (this.type == 1) {
			ctx.fillStyle = 'black';
		} else {
			console.log('Something is wrong here...');
		}
		ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
	}

}

//handles creation of game board
function generate_board() {
	//draw background bue color
	ctx.beginPath();
	ctx.fillStyle = 'blue';
	ctx.rect(0,0,canvas.width,canvas.height);
	ctx.fill();
	ctx.stroke();

	//add cicles with color based on value
	for (var i = 0; i < 7; i++) {
		const x = (i*Math.floor(canvas.width/7.0)) + canvas.width/14.0;
		var column = [];
		for (var j = 0; j < 6; j++) {
			const y = canvas.height - (j*Math.floor(canvas.height/6.0)) - canvas.height/12.0;
			var slot = new Circle(x,y,90,2);
			slot.draw();
			column.push(slot);			
		}
		gameBoard.push(column);
	}

}