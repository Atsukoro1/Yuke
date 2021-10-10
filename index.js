const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// Connect to Mongoose database
mongoose.connect(process.env.MONGOURI, {   useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("Mongoose database connected!")
})
.catch((err) => {
    console.log(err);
})

// Create HTTP server
const app = express();
const server = http.createServer(app);

// Use cookie parser
app.use(cookieParser());

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const auth = require('./routes/api/auth');
app.use('/api/auth', auth);
const settings = require('./routes/api/settings');
app.use('/api/settings', settings);
const friends = require('./routes/api/friends');
app.use('/api/friends', friends);

server.listen((process.env.PORT || 3000), () => {
    console.log("Server started at port *" + (process.env.PORT || 3000))
})