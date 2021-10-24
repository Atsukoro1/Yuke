const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// Connect to Mongoose database
mongoose.connect(process.env.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("Mongoose database connected!")
})
.catch((err) => {
    console.log(err);
})

// Mongoose models
const Message = require('./models/Message');
const User = require('./models/User');

// Create HTTP server
const app = express();
const server = http.createServer(app);

// Create socket
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8080",
    }
});

let socketConnectedUsers = new Map();

// Socket authentication
io.use((socket, next) => {
    // Get and validate user connected to socket
    const token = cookie.parse(socket.handshake.headers.cookie)["token"];

    if(!token) {
        return next(new Error("Invalid token."));
    }

    // Validate token, if token is invalid close connection don't let user to use the socket
    const validation = jwt.verify(token, process.env.JWTSECRET);
    
    if(!validation) {
        return next(new Error("Token is not valid."));
    }

    // Let user use this socket and add id parameter
    socket._id = validation._id;
    next();
});

// Send user's status to all friends
function announnceStatus(status, socket) {

    // Check if "status" is a valid status
    if(!["online", "idle", "offline"].includes(status)) return;

    // Find user by author id
    User.findById(socket._id, function(err, userInfo) {
        if(err) return;

        // Send status to socket of each friend
        if(userInfo.friends.length > 0) {
            userInfo.friends.forEach(f => {
                let sendToSocketId = socketConnectedUsers.get(f._id.toString());
                
                socket.to(sendToSocketId).emit('status', {
                    from: socket._id,
                    status: status
                });
            })
        }
    });
}

// Socket event when user joins the socket
io.on('connection', (socket) => {
    // Add user to map on join
    socketConnectedUsers.set(socket._id, socket.id);

    announnceStatus("online", socket);

    // When someone sends a message from client catch the data here
    socket.on('message', (data) => {
        // Get socket id for message recipient
        let sendToSocketId = socketConnectedUsers.get(data.to);

        // Send online status to user
        announnceStatus("online", socket);

        // If socket id exists, send the message to recipient
        socket.to(sendToSocketId).emit('message', {
            content: data.content,
            to: data.to,
            from: data.from
        });

        // Create message and save it to the database
        const newMessage = new Message({
            content: data.content,
            from: data.from,
            to: data.to
        });
        
        newMessage.save();
    })

    socket.on('disconnect', () => {

        announnceStatus("offline", socket);

        // Remove user from map on leave
        socketConnectedUsers.delete(socket._id);
    })
});

// Make public folder working to serve static files
app.use("/public", express.static(path.join(__dirname, 'public')));

// Use cookie parser
app.use(cookieParser());

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// Routes

// Api routes
const auth = require('./routes/api/auth');
app.use('/api/auth', auth);
const settings = require('./routes/api/settings');
app.use('/api/settings', settings);
const friends = require('./routes/api/friends');
app.use('/api/friends', friends);
const messages = require('./routes/api/messages');
app.use('/api/messages', messages);

// Frontent route
const frontend = require('./routes/frontend/index');
app.use('/', frontend);

server.listen((process.env.PORT || 3000), () => {
    console.log("Server started at port *" + (process.env.PORT || 3000))
})