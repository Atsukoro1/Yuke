const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Mongoose model
const User = require('../../models/User');

// Middleware
const {
    apiTokenVerify
} = require('../../utils/authenticated');

const router = express.Router();

router.post('/add', apiTokenVerify, async (req, res) => {
    // Validate user input
    const joiSchema = Joi.object({
        _id: Joi.string().required()
    });

    const error = joiSchema.validate(req.body).error;
    if (error) return res.json({
        error: error.details[0].message
    });

    // Check if user that will be added as a friend exists
    const userToAdd = await User.findOne({
        _id: req.body._id
    });
    if (!userToAdd) return res.json({
        error: "User you're trying to add does not exist."
    });

    // Check if user that will be added as a friend is not the author
    if (userToAdd == req.user) return res.json({
        error: "You cannot add yourself!"
    });

    // Add user to author outgoing requests
    req.user.outgoingFriendRequests.push({
        _id: userToAdd._id,
        username: userToAdd.username
    })

    // Save author's outgoing requests
    await User.findById(req.user._id).then((model) => {
        return Object.assign(model, {
            outgoingFriendRequests: req.user.outgoingFriendRequests
        });
    }).then((model) => {
        return model.save();
    });

    // Add user to oponnent ingoing requests
    userToAdd.ingoingFriendRequests.push({
        _id: req.user._id,
        username: req.user.username
    })

    // Save opponent's ingoing requests
    await User.findById(userToAdd._id).then((model) => {
        return Object.assign(model, {
            ingoingFriendRequests: userToAdd.ingoingFriendRequests
        });
    }).then((model) => {
        return model.save();
    });

    return res.status(200).json({
        success: true
    });
})

router.post('/decline', apiTokenVerify, async (req, res) => {
    // Validate input data
    const joiSchema = Joi.object({
        _id: Joi.string().required()
    })

    const error = joiSchema.validate(req.body).error;
    if (error) return res.json({
        error: error.details[0].message
    });

    // Get user from database
    const opponent = await User.findOne({
        _id: req.body._id
    });
    const author = req.user;

    // Remove the request from ingoing friend requests
    user = author.ingoingFriendRequests.filter(us => us._id == req.body._id);
    index = author.ingoingFriendRequests.findIndex(us => us._id == req.body._id);
    author.ingoingFriendRequests.splice(index, 1);
    author.friends.push(user[0]);

    // Remove the request from outgoing friend requests
    user = opponent.outgoingFriendRequests.filter(us => us._id == author._id.toString());
    index = opponent.outgoingFriendRequests.findIndex(us => us._id == author._id.toString());
    opponent.outgoingFriendRequests.splice(index, 1); 

    // Save author data to database
    User.findById(req.user._id).then((model) => {
        Object.assign(model, {
            ingoingFriendRequests: author.ingoingFriendRequests
        });

        try {
            model.save();
        } catch(err) {
            return;
        }
    });

    // Save opponent data to database
    User.findById(opponent._id).then((model) => {
        Object.assign(model, {
            ingoingFriendRequests: opponent.ingoingFriendRequests
        });

        try {
            model.save();
        } catch(err) {
            return;
        }
    });

    res.status(200).json({ success: true });
})

router.post('/accept', apiTokenVerify, async (req, res) => {
    // Validate input data
    const joiSchema = Joi.object({
        _id: Joi.string().required()
    })

    const error = joiSchema.validate(req.body).error;
    if (error) return res.json({
        error: error.details[0].message
    });

    // Get user from database
    const opponent = await User.findOne({
        _id: req.body._id
    });
    const author = req.user;

    // Remove author ingoing request and add user to friends
    user = author.ingoingFriendRequests.filter(us => us._id == req.body._id);
    index = author.ingoingFriendRequests.findIndex(us => us._id == req.body._id);
    author.ingoingFriendRequests.splice(index, 1);
    author.friends.push(user[0]);

    // Remove author outgoing request and add user to friends
    user = opponent.outgoingFriendRequests.filter(us => us._id == author._id.toString());
    index = opponent.outgoingFriendRequests.findIndex(us => us._id == author._id.toString());
    opponent.outgoingFriendRequests.splice(index, 1);
    opponent.friends.push(user[0]);

    // Save author data to database
    User.findById(req.user._id).then((model) => {
        Object.assign(model, {
            ingoingFriendRequests: author.ingoingFriendRequests,
            friends: author.friends
        });

        try {
            model.save();
        } catch(err) {
            return;
        }
    });

    // Save opponent data to database
    User.findById(opponent._id).then((model) => {
        Object.assign(model, {
            ingoingFriendRequests: opponent.ingoingFriendRequests,
            friends: opponent.friends
        });

        try {
            model.save();
        } catch(err) {
            return;
        }
    });

    // Send response back to client
    res.status(200).json({ success: true });
})

module.exports = router;