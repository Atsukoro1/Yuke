const express = require('express');
const router = express.Router();

// Mongoose models
const User = require('../../models/User');

// Middleware
const { frontendTokenVerify, redirectAuthenticated } = require('../../utils/authenticated')

router.get('/login', redirectAuthenticated, async (req,res) => {
    res.render('login.ejs', {
        title: "Login"
    });
})

router.get('/register', redirectAuthenticated, async (req,res) => {
    res.render('register.ejs', {
        title: "Register"
    });
})

router.get('/', frontendTokenVerify, async (req,res) => {
    res.render('chat.ejs', {
        title: "Chat",
        user: req.user
    });
})

module.exports = router;