const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect('/login');
    }
    try {
        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.userId = decodedToken.userId;  // Store userId in req object
        next();
    } catch (err) {
        console.error('Invalid access token:', err);
        res.redirect('/login');
    }
}

module.exports = { isAuthenticated };
