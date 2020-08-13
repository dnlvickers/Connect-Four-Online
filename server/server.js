//needed packets
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

//create express app and find static files
const app = express();
const clientPath  = __dirname+'/../client';
console.log('Serving static from '+clientPath)
app.use(express.static(clientPath));

//wrap app in server and io
const server = http.createServer(app);
const io = socketio(server);

server.on('error', function(err){
	console.error('Server error:',err);
});

server.listen(8080, function() {
	console.log('Program Init on 8080');
});

//global for socket of player waiting to play
let waitingPlayer=null;

io.on('connection', function(sock){
	//shake hands with the client side
	sock.emit('message','You connected');
	console.log('Someone connected');

	//checks if we already have a wiating player to create a game pair
	if (waitingPlayer) {
		console.log('Starting Game');
		new Connect4Game(waitingPlayer,sock);
		waitingPlayer = null;

	//otherwise set the new player to the waiting player
	} else {
		waitingPlayer = sock;
		sock.emit('message','Waiting for opponent');
	}

	//if the waiting player disconnects, reset the waiting player socket
	sock.on('disconnect',function(){
		if (sock==waitingPlayer) {
			waitingPlayer = null;
		}
	})
})

//create class to create and run a game instance
class Connect4Game {
	constructor(player1,player2) {
		//necessary class elemetns for runngint he game
		this._players=[player1,player2];
		this._board=this.new_board();
		this._players.forEach(s => s.emit('message','Opponent found'));
		this._players.forEach(s => s.emit('board',this._board));
		this._turn = 0;
		this._over = false;
		this._winner = null;

		//check for player inputs
		this._players.forEach((player,ind) => {
			player.on('move',(col) => {
				//check if the game is over and if we should register the move
				if(!this._over){
					//attempt to make the move the player input
					this.make_move(player,ind,col);
				}
			});
		})
	}

	//generates a new 7x6 game board on new game
	new_board(){
		var board = [];
		for (var i = 0; i < 7; i++) {
			var empty_column = [];
			for (var j = 0; j < 6;  j++) {
				empty_column.push(2);
			}
			board.push(empty_column);
		}
		return board;
	}

	//checks to make the player's attempted move
	make_move(player,ind,col) {
		//check that it is that player's turn
		if (ind == this._turn%2.0) {
			//check that the column is not full
			if (this._board[col][5]==2) {
				//go through with adding the game piece tot he column
				this.add_piece(col);
				//emits updates game board
				this._players.forEach(s => s.emit('board',this._board));
				//if the game is not over, let players know whose turn it is
				if (!this._over) {
					player.emit('message','You made a move')
					this._players[this._turn % 2].emit('message','Your turn');
				}
			} else {
				player.emit('message','That column is full');
			}
		} else {
			player.emit('message','It is not your turn');
		}
	}

	//adds game piece to desired colimn
	add_piece(col){
		//iterate throgh the board and add piece to first empty square
		for (var i = 0; i < this._board[col].length; i++) {
			//checks for the first empty square
			if (this._board[col][i] == 2){
				this._board[col][i] = this._turn % 2;
				this.check_gameover(col,i);
				this._turn++;
				break;
			}
		}
	}

	check_gameover(i,j) {
		//enter end game logic
		var pieceValue = this._board[i][j];
		for (var col = 0; col < 7; col++) {
			for (var row = 0; row < 6; row++) {
				//only player who can win is the one who makes the move. 
				if (pieceValue == this._board[col][row]) {
					//if vertical row
					if (row > 2) {
						if (pieceValue == this._board[col][row-1] && pieceValue == this._board[col][row-2] && pieceValue == this._board[col][row-3]) {
							this._winner = pieceValue;
						}
					}
					if (col < 4) {
						//if horizontal right
						if (pieceValue == this._board[col+1][row] && pieceValue == this._board[col+2][row] && pieceValue == this._board[col+3][row]) {
							this._winner = pieceValue;
						} else if (row < 3) {
							//if diagonal up-right
							if (pieceValue == this._board[col+1][row+1] && pieceValue == this._board[col+2][row+2] && pieceValue == this._board[col+3][row+3]) {
								this._winner = pieceValue;
							}
							//if diagonal down-right
						} else if (pieceValue == this._board[col+1][row-1] && pieceValue == this._board[col+2][row-2] && pieceValue == this._board[col+3][row-3]) {
							this._winner = pieceValue;
						}
					}
					if (col > 2) {
						//if horizontal left
						if (pieceValue == this._board[col-1][row] && pieceValue == this._board[col-2][row] && pieceValue == this._board[col-3][row]) {
							this._winner = pieceValue;
						} else if (row < 3) {
							//if diagonal up-left
							if (pieceValue == this._board[col-1][row+1] && pieceValue == this._board[col-2][row+2] && pieceValue == this._board[col-3][row+3]) {
								this._winner = pieceValue;
							}
							//if diagonal down-left
						} else if (pieceValue == this._board[col-1][row-1] && pieceValue == this._board[col-2][row-2] && pieceValue == this._board[col-3][row-3]) {
							this._winner = pieceValue;
						}
					}
				}
			}
		}
		
		//if we have a winner, let players know that the game is over
		if (this._winner == 0 || this._winner == 1) {
			this._players[pieceValue].emit('message','Congratualtions. You won!');
			this._players[(pieceValue+1)%2].emit('message','Sorry. You lost.');
			this._over = true;
		}
		return;
	}
}
