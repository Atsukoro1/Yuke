const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const md5 = require('md5');
const ObjectID = require("mongodb").ObjectID

// Mongoose model
const User = require('../../models/User');

// Middleware
const {
    apiTokenVerify
} = require('../../utils/authenticated');

const router = express.Router();

router.post('/search', apiTokenVerify, async (req, res) => {
    // Validate user input
    const joiSchema = Joi.object({
        username: Joi.string().required().min(1).max(255)
    });

    // Send back error if user input is not valid
    const error = joiSchema.validate(req.body).error;
    if (error) return res.json({
        error: error.details[0].message
    });

    User.find({
            username: {
                $regex: "^" + req.body.username
            }
        }, "_id username email")
        .limit(10)
        .exec(function (err, users) {
            if(err) return res.json({ error: "Some error happened!" });

            // Return if no users were found
            if(users.length == 0) return res.json({ error: "No users found!" });

            // Hash email because we're using gravatar
            users.forEach(u => {
                u.email = md5(u.email);
            });
            return res.json(users);
        });
})

router.post('/add', apiTokenVerify, async (req, res) => {
    // Validate user input
    const joiSchema = Joi.object({
        _id: Joi.string().required()
    });

    const error = joiSchema.validate(req.body).error;
    if (error) return res.json({
        error: error.details[0].message
    });

    // Check if id is valid mongo id
    if (!ObjectID.isValid(req.body._id)) return res.json({
        error: "Id is not valid"
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
        username: userToAdd.username,
        email: md5(userToAdd.email)
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
        username: req.user.username,
        email: md5(req.user.email)
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

router.post('/remove', apiTokenVerify, async (req, res) => {
    // Validate input data
    const joiSchema = Joi.object({
        _id: Joi.string().required()
    })

    const error = joiSchema.validate(req.body).error;
    if (error) return res.json({
        error: error.details[0].message
    });

    // Check if id is valid mongo id
    if (!ObjectID.isValid(req.body._id)) return res.json({
        error: "Id is not valid"
    });

    // Get user from database
    const opponent = await User.findOne({
        _id: req.body._id
    });
    const author = req.user;

    // Remove friend from author
    aindex = author.friends.findIndex(us => us._id == req.body._id);
    author.friends.splice(aindex, 1);

    // Remove friend from opponent
    oindex = opponent.friends.findIndex(us => us._id == author._id);
    opponent.friends.splice(oindex, 1);

    // Save author to database
    User.findById(req.user._id).then((model) => {
        Object.assign(model, {
            friends: author.friends
        });

        try {
            model.save();
        } catch (err) {
            return;
        }
    });

    // Save opponent data to database
    User.findById(opponent._id).then((model) => {
        Object.assign(model, {
            friends: opponent.friends
        });

        try {
            model.save();
        } catch (err) {
            return;
        }
    });

    res.status(200).json({
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

    // Check if id is valid mongo id
    if (!ObjectID.isValid(req.body._id)) return res.json({
        error: "Id is not valid"
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
        } catch (err) {
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
        } catch (err) {
            return;
        }
    });

    res.status(200).json({
        success: true
    });
})

router.post('/block', apiTokenVerify, async (req, res) => {
    // Validate input data
    const joiSchema = Joi.object({
        _id: Joi.string().required()
    })

    const error = joiSchema.validate(req.body).error;
    if (error) return res.json({
        error: error.details[0].message
    });

    // Check if id is valid mongo id
    if (!ObjectID.isValid(req.body._id)) return res.json({
        error: "Id is not valid"
    });

    // Get user from database
    const opponent = await User.findOne({
        _id: req.body._id
    });
    const author = req.user;

    // Check if users are friends
    if (author.friends.filter(us => us._id == req.body._id).length > 0) {
        // Remove friend from author
        user = author.friends.filter(us => us._id == req.body._id);
        aindex = author.friends.findIndex(us => us._id == req.body._id);
        author.friends.splice(aindex, 1);

        // Add user to author's blocked users
        author.blockedUsers.push(user[0]);

        // Save author to database
        User.findById(req.user._id).then((model) => {
            Object.assign(model, {
                friends: author.friends,
                blockedUsers: author.blockedUsers
            });

            try {
                model.save();
            } catch (err) {
                return;
            }
        });

        // Remove friend from opponent
        oindex = opponent.friends.findIndex(us => us._id == author._id);
        opponent.friends.splice(oindex, 1);

        // Save opponent to database
        User.findById(opponent._id).then((model) => {
            Object.assign(model, {
                friends: opponent.friends
            });

            try {
                model.save();
            } catch (err) {
                return;
            }
        });
    }

    res.status(200).json({
        success: true
    });
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

    // Check if id is valid mongo id
    if (!ObjectID.isValid(req.body._id)) return res.json({
        error: "Id is not valid"
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
        } catch (err) {
            return;
        }
    });

    // Save opponent data to database
    User.findById(opponent._id).then((model) => {
        Object.assign(model, {
            outgoingFriendRequests: opponent.outgoingFriendRequests,
            friends: opponent.friends
        });

        try {
            model.save();
        } catch (err) {
            return;
        }
    });

    // Send response back to client
    res.status(200).json({
        success: true
    });
})

module.exports = router;