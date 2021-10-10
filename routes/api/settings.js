const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Mongoose model
const User = require('../../models/User');

// Middleware
const { apiTokenVerify } = require('../../utils/authenticated');

const router = express.Router();

router.post('/changepassword', apiTokenVerify, async(req, res) => {
    // Validate user input
    const joiSchema = Joi.object({
        password: Joi.string().min(8).required(),
        newPassword: Joi.string().min(8).required()
    })
    const error = joiSchema.validate(req.body).error;
    if(error) return res.json({ error: error.details[0].message });

    // Check if password matches the hash
    const match = await bcrypt.compare(req.body.password, req.user.password);
    if(!match) return res.json({ error: "Password is incorrect!" })

    // Hash new password
    const newHashedPassword =  await bcrypt.hash(req.body.newPassword, 11);

    // Change password
    User.findById(req.user._id).then((model) => {
        return Object.assign(model, {password: newHashedPassword});
    }).then((model) => {
        return model.save();
    }).then((updatedModel) => {
        // Password changed
        return res.status(200).json({ success: true });
    }).catch((err) => {
        return res.json({ error: "Some error happened, contact administrator!" });
    });
});

router.post('/changeemail', apiTokenVerify, async(req, res) => {
    // Validate user input
    const joiSchema = Joi.object({
        password: Joi.string().min(8).required(),
        newEmail: Joi.string().max(255).min(3).required()
    });
    const error = joiSchema.validate(req.body).error;
    if(error) return res.json({ error: error.details[0].message });

    // Check if user with this email already exists
    const emailExistUser = await User.findOne({ email: req.body.newEmail });
    if(emailExistUser) return res.json({ error: "User with this email already exists!" })

    // Check if password matches the hash
    const match = await bcrypt.compare(req.body.password, req.user.password);
    if(!match) return res.json({ error: "Password is incorrect!" })

    // Change email
    User.findById(req.user._id).then((model) => {
        return Object.assign(model, {email: req.body.newEmail});
    }).then((model) => {
        return model.save();
    }).then((updatedModel) => {
        // Email changed
        return res.status(200).json({ success: true });
    }).catch((err) => {
        console.log(err);
        return res.json({ error: "Some error happened, contact administrator!" });
    });
})

router.post('/changeusername', apiTokenVerify, async(req, res) => {
    // Validate user input
    const joiSchema = Joi.object({
        password: Joi.string().min(8).required(),
        newUsername: Joi.string().max(50).min(3).required()
    });
    const error = joiSchema.validate(req.body).error;
    if(error) return res.json({ error: error.details[0].message });

    // Check if password matches the hash
    const match = await bcrypt.compare(req.body.password, req.user.password);
    if(!match) return res.json({ error: "Password is incorrect!" })

    // Change username
    User.findById(req.user._id).then((model) => {
        return Object.assign(model, {username: req.body.newUsername});
    }).then((model) => {
        return model.save();
    }).then((updatedModel) => {
        // Username changed
        return res.status(200).json({ success: true });
    }).catch((err) => {
        console.log(err);
        return res.json({ error: "Some error happened, contact administrator!" });
    });
})

module.exports = router;