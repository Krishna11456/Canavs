const { WebSocketServer } = require('ws');
const url = require('url');


const PORT = Number(process.env.PORT) || 8080;

// 1. Start the server
const wss = new WebSocketServer({ port: PORT });


//we store arrays inside an object grouped by Room ID.
const rooms = {};    // this storage remains, because it;s in terminal(unllke react which is in broswer, because those are stored in broswer so refresh and gone..)

console.log("🚀 Infinite Canvas Server running on ws://localhost:8080");

wss.on('connection', (ws, req) => {


  const parameters = url.parse(req.url, true);   // built-in fucntion, that splits url in individual components(query, protocol, host etc..)
  const roomId = parameters.query.room;

  // Reject connection if they didn't provide a room ID
  if (!roomId) {
    console.log("❌ Connection rejected: No room ID provided.");
    ws.close();
    return;
  }

  //tie this WebSocket connection with its Room ID
  ws.roomId = roomId;
  
  // If this room doesn't exist in memory yet, create an empty array for it
  if (!rooms[roomId]) {
    rooms[roomId] = [];
    console.log(`🏨 Created new room in memory: ${roomId}`);
  }

  console.log(`👤 User joined room: ${roomId}`);


  // 5. THE MASTER PHOTOGRAPH: Send them the current state of THEIR specific room
  ws.send(JSON.stringify({ 
    type: 'sync:full', 
    data: rooms[roomId] 
  }));



  // 6. THE ROUTER: Listen for incoming messages
  ws.on('message', (rawData) => {
    const messageData = JSON.parse(rawData);

    // Memorize their React ID for the Ghost Cursor fix
    if (messageData.type === 'cursor:move') {
        ws.reactUserId = messageData.data.id; 
    }

    // Update the server's memory for THIS SPECIFIC ROOM
    if (messageData.type === 'shape:new') {
        rooms[roomId].push(messageData.data);
    } 
    else if (messageData.type === 'shape:move') {
        const shapeToUpdate = rooms[roomId].find(obj => obj.id === messageData.data.id);
        if (shapeToUpdate) {
            shapeToUpdate.x = messageData.data.x;
            shapeToUpdate.y = messageData.data.y;
            shapeToUpdate.color = messageData.data.color || shapeToUpdate.color;
        }
    } 
    else if (messageData.type === 'shape:delete') {
        rooms[roomId] = rooms[roomId].filter(obj => obj.id !== messageData.data.id);
    }



    // 7. THE BROADCAST FILTER: Send the update to the room
    const sentableData = JSON.stringify(messageData);

    wss.clients.forEach((client) => {
      // THE MAGIC: Only send if the client is active, is NOT the sender, AND is in the exact same room!
      if (client.readyState === 1 && client !== ws && client.roomId === roomId) {
        client.send(sentableData);
      }
    });
  });


  

  // 8. CHECK OUT: Handle disconnections and fix the Ghost Cursor!
  ws.on('close', () => {
    console.log(`👋 User left room: ${roomId}`);
    
    if (ws.reactUserId) {
        const leavePayload = JSON.stringify({
            type: 'user:leave',
            data: { id: ws.reactUserId }
        });

        // Tell everyone in THIS ROOM to delete the cursor
        wss.clients.forEach((client) => {
            if (client.readyState === 1 && client.roomId === roomId) {
                client.send(leavePayload);
            }
        });
    }
  });
});


























// UPDATED LAST ONE(COMMENTED THIS TO CHECK IF FIRST ONE, I got the error correct)

/* const WebSocket = require('ws');

// Start the server and tell it to listen on "door" 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log("🚦 Canvas Traffic Controller is running on ws://localhost:8080");

wss.on('connection', function connection(clientSocket) {
    console.log("👋 A new user connected to the canvas!");

    clientSocket.on('message', function listener(messageAsString) {
        try {
            // 1. We successfully parse the incoming data into a JS Object
            const messageData = JSON.parse(messageAsString);
            console.log("📦 Received an update:", messageData.type);

            // 2. CREATE A GUARANTEED PURE STRING
            const outboundPayload = JSON.stringify(messageData);

            // 3. Relay the message to everyone else
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client !== clientSocket) {
                    
                    // The { binary: false } flag forces the server to send Text, not a Blob!
                    client.send(outboundPayload, { binary: false });
                    
                }
            });
        } catch (error) {
            console.error("❌ Server failed to process incoming message:", error);
        }
    });
}); 

*/