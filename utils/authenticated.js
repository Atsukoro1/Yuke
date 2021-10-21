const jwt = require('jsonwebtoken');
const User = require('../models/User');
const md5 = require('md5');

module.exports = {
    // Verify token when using API
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

    // Check if user is authenticated on frontend
    async frontendTokenVerify(req, res, next) {
        const token = req.cookies.token;

        // Check if token exists
        if (!token) return res.redirect('/login');

        try {
            const verified = await jwt.verify(token, process.env.JWTSECRET);
            const user = await User.findOne({ _id: verified._id });
            user.email = md5(user.email);
            req.user = user;
            next();
        } catch (err) {
            return res.redirect('/login');
        }
    },

    // Redirect user back to chat if he's authenticated
    async redirectAuthenticated(req, res, next) {
        const token = req.cookies.token;

        // Check if token exists
        if(!token) return next();

        const verified = await jwt.verify(token, process.env.JWTSECRET);

        // If token can't be verified, let user to login
        if(!verified) return next();

        // If user exists, redirect user to chat
        const user = await User.findOne({ _id: verified._id });
        if(user) return res.redirect('/');

        return next();
    }
}