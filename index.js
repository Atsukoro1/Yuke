const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

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