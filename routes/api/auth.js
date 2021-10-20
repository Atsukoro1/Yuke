const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Mongoose model
const User = require('../../models/User');

// Middleware
const { apiTokenVerify } = require('../../utils/authenticated');

const router = express.Router();

router.get('/me', apiTokenVerify, async (req, res) => {
    res.send(req.user);
})

router.post('/register', async (req, res) => {
    const joiSchema = Joi.object({
        username: Joi.string()
        .min(3)
        .max(50)
        .required(),

        email: Joi.string()
        .email()
        .required()
        .max(255),
        
        password: Joi.string()
        .min(8)
        .required()
    });

    const error = joiSchema.validate(req.body).error;

    if(error) return res.json({ error: error.details[0].message });

    const existingUser = await User.findOne({ email: req.body.email });

    if(existingUser) return res.json({ error: "User with this email address already exists!" });

    req.body.password = await bcrypt.hash(req.body.password, 11);

    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });

    newUser.save();

    const token = jwt.sign({ _id: newUser._id }, process.env.JWTSECRET);

    return res.status(200).json({ token: token });
});

router.post('/login', async (req, res) => {
    const joiSchema = Joi.object({
        email: Joi.string()
        .email()
        .required()
        .max(255),
        
        password: Joi.string()
        .min(8)
        .required()
    });

    const error = joiSchema.validate(req.body).error;

    if(error) return res.json({ error: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });

    if(!user) return res.json({ error: "User with this email does not exist!" });

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);

    if(!passwordMatch) res.json({ error: "Incorrect password!" });

    const token = jwt.sign({ _id: user._id }, process.env.JWTSECRET);

    return res.status(200).json({ token: token });
});

module.exports = router;