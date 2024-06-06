const jwt = require("jsonwebtoken");

module.exports = function(app, bcrypt, db) {
    app.post("/login", (req, res) => {
        if (req.body.email == undefined || req.body.password == undefined) {
            res.status(400).send({ msg: "Bad Parameter" });
            return;
        }
        db.query('SELECT * FROM user WHERE email = ?', [req.body.email], (err, rows) => {
            if (err) {
                res.status(500).send({ msg: "Internal server error" });
                return;
            }
            if (rows.length == 0) {
                res.status(401).send({ msg: "Invalid Credentials" });
                return;
            }
            if (!bcrypt.compareSync(req.body.password, rows[0].password)) {
                res.status(401).send({ msg: "Invalid Credentials" });
                return;
            }
            const token = jwt.sign({ id: rows[0].id }, process.env.SECRET);
            res.send({ token: token });
        });
    })
    app.post("/register", (req, res) => {
        if (req.body.email == undefined || req.body.name == undefined || req.body.firstname == undefined || req.body.password == undefined) {
            res.status(400).send({ msg: "Bad Parameter" });
            return;
        }
        db.query('SELECT * FROM user WHERE email = ?', [req.body.email], (err, rows) => {
            if (err) {
                res.status(500).send({ msg: "Internal server error", error: err });
                return;
            }
            if (rows.length > 0) {
                res.status(409).send({ msg: "Account already exists" });
                return;
            }
            const passwd = bcrypt.hashSync(req.body.password, 10);
            db.query('INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)', [req.body.email, passwd, req.body.name, req.body.firstname], (err, results) => {
                if (err) {
                    res.status(500).send({ msg: "Internal server error" });
                    return;
                }
                const token = jwt.sign({ id: results.insertId }, process.env.SECRET);
                res.send({ token: token });
            });
        });
    });
};