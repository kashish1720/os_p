// server.js
// Express + Socket.io real-time chat demo

const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Create Express app
const app = express();
const PORT = 4000;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
	// Allow requests from any origin for simplicity in this demo
	cors: {
		origin: '*',
	}
});

// Serve the main page at "/"
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store active users (in memory, no database needed)
const activeUsers = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
	console.log('User connected');

	// When user joins with a username
	socket.on('join', (username) => {
		activeUsers.set(socket.id, username);
		socket.username = username;
		
		// Notify all clients that a new user joined
		io.emit('userJoined', {
			username: username,
			message: `${username} joined the chat`,
			timestamp: new Date().toLocaleTimeString()
		});
		
		// Send current online users count
		io.emit('userCount', activeUsers.size);
		
		console.log(`${username} joined`);
	});

	// When a chat message arrives from a client, broadcast to all clients
	socket.on('chatMessage', (data) => {
		// Broadcast message with username and timestamp
		io.emit('chatMessage', {
			username: socket.username || 'Anonymous',
			message: data.message,
			timestamp: new Date().toLocaleTimeString()
		});
	});

	// When client disconnects
	socket.on('disconnect', () => {
		const username = activeUsers.get(socket.id);
		if (username) {
			activeUsers.delete(socket.id);
			// Notify all clients that user left
			io.emit('userLeft', {
				username: username,
				message: `${username} left the chat`,
				timestamp: new Date().toLocaleTimeString()
			});
			io.emit('userCount', activeUsers.size);
			console.log(`${username} disconnected`);
		} else {
			console.log('User disconnected');
		}
	});
});

// Start server
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});


