const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Mongoose model
const User = require('../../models/User');

// Middleware
const { apiTokenVerify } = require('../../utils/authenticated');

const router = express.Router();

router.post('/add', apiTokenVerify, async(req, res) => {
    // Validate user input
    const joiSchema = Joi.object({
        _id: Joi.string().required()
    });

    const error = joiSchema.validate(req.body).error;
    if(error) return res.json({ error: error.details[0].message });

    // Check if user that will be added as a friend exists
    const userToAdd = await User.findOne({ _id: req.body._id });
    if(!userToAdd) return res.json({ error: "User you're trying to add does not exist." });

    // Check if user that will be added as a friend is not the author
    if(userToAdd == req.user) return res.json({ error: "You cannot add yourself!" });

    // Add user to author outgoing requests
    req.user.outgoingFriendRequests.push(
        { _id: userToAdd._id, username: userToAdd.username }
    )

    // Save author's outgoing requests
    await User.findById(req.user._id).then((model) => {
        return Object.assign(model, {outgoingFriendRequests: req.user.outgoingFriendRequests});
    }).then((model) => {
        return model.save();
    });

    // Add user to oponnent ingoing requests
    userToAdd.ingoingFriendRequests.push(
        { _id: req.user._id, username: req.user.username }
    )

    // Save opponent's ingoing requests
    await User.findById(userToAdd._id).then((model) => {
        return Object.assign(model, {ingoingFriendRequests: userToAdd.ingoingFriendRequests});
    }).then((model) => {
        return model.save();
    });

    return res.status(200).json({ success: true });
})

module.exports = router;