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

// Socket event when user joins the socket
io.on('connection', (socket) => {
    // Add user to map on join
    socketConnectedUsers.set(socket._id, socket.id);

    // When someone sends a message from client catch the data here
    socket.on('message', (data) => {
        // Get socket id for message recipient
        let sendToSocketId = socketConnectedUsers.get(data.to);

        // If socket id exists, send the message to recipient
        socket.to(sendToSocketId).emit('message', {
            content: data.content,
            to: data.to,
            from: data.from
        });
    })

    socket.on('disconnect', () => {
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

// Frontent route
const frontend = require('./routes/frontend/index');
app.use('/', frontend);

server.listen((process.env.PORT || 3000), () => {
    console.log("Server started at port *" + (process.env.PORT || 3000))
})