const jwt = require('jsonwebtoken');

module.exports = {
    apiTokenVerify(req, res, next) {
        const token = req.cookies.token;

        // Check if token exists
        if (!token) return res.json({
            error: "Access denied!"
        });

        try {
            const verified = jwt.verify(token, process.env.JWTSECRET);
            req.user = verified;
            next();
        } catch (err) {
            return res.json({
                error: "Invalid token!"
            });
        }
    },

    frontendTokenVerify(req, res, next) {
        const token = req.cookies.token;

        // Check if token exists
        if (!token) return res.redirect('/');

        try {
            const verified = jwt.verify(token, process.env.JWTSECRET);
            req.user = verified;
            next();
        } catch (err) {
            return res.redirect('/');
        }
    }
}