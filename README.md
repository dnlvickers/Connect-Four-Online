# Connect-Four-Online

In this code, I wanted to demonstrate an understanding of basic web application design and use of servers with node.js and socket.io. The program creates a 
running server with 'npm start' or 'npm run dev' executed from the server directory. In the current iteration of the cade, this simply creats a server on 
port 8080 for the local host, but can easily be put online.

The server checks for new players on the port and sends them the static files in the client directory. The client.js file handles the neccessary interaction
with the server side. Upon two players connecting, a new game instance is created. Each player can make moves in order which are sent to the server. Upon 
processing these moves, the server then sends an updated board to the clients until we reach an end of game.
