# Real-time Chat with WebSockets (Socket.io + Express)

This project demonstrates real-time, bidirectional communication between a server and multiple clients using WebSockets via Socket.io.

## What are WebSockets?
WebSockets provide a persistent, full‑duplex communication channel between a client and a server over a single TCP connection. Unlike HTTP polling, WebSockets allow the server to push data to clients instantly, enabling true real-time experiences like chat, collaborative editing, notifications, and live dashboards.

## How Socket.io is used in this project
Socket.io builds on WebSockets and adds automatic reconnection, fallbacks, event-based messaging, and broadcasting. In this project:
- The server listens for client connections and logs lifecycle events.
- Clients emit a `chatMessage` event to the server when users send messages.
- The server broadcasts every `chatMessage` to all connected clients in real time using `io.emit`.

## Server–Client Interaction
- Client connects to the server at `/socket.io` (handled by Socket.io internally).
- Client emits `chatMessage` with the message text.
- Server receives the event and broadcasts it to all clients including the sender.
- All clients listen for `chatMessage` and update the chat UI instantly.

## Project Structure
```
.
├─ server.js            # Express + Socket.io server
├─ public/
│  └─ index.html        # Simple chat UI, connects via Socket.io client
└─ package.json         # Scripts and dependencies
```

## How to Run
1. Install dependencies (already included in this repository if you ran the automated setup):
   ```bash
   npm install
   ```
2. Start the development server with auto-reload:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:4000`.
4. Open multiple tabs to simulate multiple clients and send messages—they will appear in all tabs instantly.

## What this demonstrates
- Maintaining a persistent connection between client and server using WebSockets.
- Event-based messaging with Socket.io (`chatMessage`).
- Broadcasting messages to all connected clients in real time.

## Notes
- The server runs on port `4000`.
- The Socket.io client is loaded from the server at `/socket.io/socket.io.js`.
- Code is commented for clarity.
