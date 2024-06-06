const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null)
        return res.status(401).send({ msg: "No token, authorization denied" });

    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
            if (err.name == 'JsonWebTokenError') {
                return res.status(403).send({ msg: "Token is not valid" });
            } else {
                return res.status(500).send({ msg: "Internal server error" });
            }
        }
        if (!user) {
            return res.status(404).send({ msg: "Not found" });
        }
        req.user = user;
        next();
    });
}