const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ObjectID = require("mongodb").ObjectID
const Joi = require('joi');

// Mongoose model
const User = require('../../models/User');
const Message = require('../../models/Message');

// Middleware
const {
    apiTokenVerify
} = require('../../utils/authenticated');

const router = express.Router();

router.post('/get', apiTokenVerify, async (req, res) => {

    // Schema to validate user input
    const joiSchema = new Joi.object({
        _id: Joi.string().required(),
        page: Joi.number().required().min(0)
    });

    // Send error back to the client
    const error = joiSchema.validate(req.body).error;
    if (error) return res.json({
        error: error.details[0].message
    });

    // Check if _id is a valid mongo id
    if (!ObjectID.isValid(req.body._id)) return res.json({
        error: "Id is not valid"
    });

    let documentCount = await Message.countDocuments({}) / 10
    let page = Math.floor(documentCount - req.body.page)

    // Get all messages, sort them and paginate them
    Message.find({ $or: [ { from: req.user._id, to: req.body._id }, { from: req.body._id, to: req.user._id } ] })
    .skip((page) * 10)
    .limit(10)
    .exec(function(err, docs) { 
        if(err) return res.json({ error: "Some error happened!" });
        res.json({ documents: [docs], maxPages: Math.floor(documentCount) });
    });
})

router.post('/delete', apiTokenVerify, (req, res) => {
    // Validate user input
    const joiSchema = new Joi.object({
        _id: Joi.string().required()
    });

    // Send error back to the client
    const error = joiSchema.validate(req.body).error;
    if (error) return res.json({
        error: error.details[0].message
    });

    // Check if _id is a valid mongo id
    if (!ObjectID.isValid(req.body._id)) return res.json({
        error: "Id is not valid"
    });

    // Delete the message
    Message.findByIdAndDelete(req.body._id, {}, function (err, result) {
        if (err) return res.json({
            error: "Some error happened!"
        });

        return res.json({
            success: true
        });
    })
});

router.post('/edit', apiTokenVerify, (req, res) => {
    // Validate user input
    const joiSchema = new Joi.object({
        _id: Joi.string().required(),
        content: Joi.string().required().min(1).max(500)
    });

    // Send error back to the client
    const error = joiSchema.validate(req.body).error;
    if (error) return res.json({
        error: error.details[0].message
    });

    Message.findByIdAndUpdate(req.body._id, {
        content: req.body.content
    }, {}, function (err, result) {
        if (err) return res.json({
            error: "Some error happened!"
        });

        return res.json({
            success: true
        });
    });
})

module.exports = router;