const jwt = require('jsonwebtoken');
const User = require('../models/User');
const md5 = require('md5');

module.exports = {
    async apiTokenVerify(req, res, next) {
        const token = req.cookies.token;

        // Check if token exists
        if (!token) return res.json({
            error: "Access denied!"
        });

        try {
            const verified = jwt.verify(token, process.env.JWTSECRET);
            const user = await User.findOne({ _id: verified._id });
            req.user = user;
            next();
        } catch (err) {
            return res.json({
                error: "Invalid token!"
            });
        }
    },

    async frontendTokenVerify(req, res, next) {
        const token = req.cookies.token;

        // Check if token exists
        if (!token) return res.redirect('/login');

        try {
            const verified = await jwt.verify(token, process.env.JWTSECRET);
            req.user = verified;
            next();
        } catch (err) {
            return res.redirect('/login');
        }
    }
}