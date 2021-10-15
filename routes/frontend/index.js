const express = require('express');
const router = express.Router();

const { frontendTokenVerify } = require('../../utils/authenticated')

router.get('/login', async (req,res) => {
    res.render('login.ejs', {
        title: "Login"
    });
})

router.get('/register', async (req,res) => {
    res.render('register.ejs', {
        title: "Register"
    });
})

router.get('/', async (req,res) => {
    res.render('chat.ejs', {
        title: "Chat"
    });
})

module.exports = router;