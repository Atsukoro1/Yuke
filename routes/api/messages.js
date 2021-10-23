const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ObjectID = require("mongodb").ObjectID
const Joi = require('joi');

// Mongoose model
const User = require('../../models/User');
const Message = require('../../models/Message');

// Middleware
const { apiTokenVerify } = require('../../utils/authenticated');

const router = express.Router();

router.get('/get', apiTokenVerify, (req, res) => {

    // Schema to validate user input
    const joiSchema = new Joi.object({
        _id: Joi.string().required(),
        page: Joi.number().required().min(1)
    });

    // Send error back to the client
    const error = joiSchema.validate(req.body).error;
    if(error) return res.json({ error: error.details[0].message });

    if (!ObjectID.isValid(req.body._id)) return res.json({
        error: "Id is not valid"
    });
    
    Message.paginate({ $or: [ { from: req.user._id, to: req.body._id }, { from: req.body._id, to: req.user._id } ], sort: '-creationDate' }, { page: req.body.page, limit: 10 }, function(err, result) {
        if(err) return res.json({ error: "Some error happened!" });

        return res.json(result);
    });
})

module.exports = router;