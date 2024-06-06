function date(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = function(app, bcrypt, db, middleware) {
    app.get("/user", middleware, (req, res) => {
        db.query('SELECT * FROM user WHERE id = ?', [req.user.id], (err, results) => {
            if (err) {
                return res.status(500).send({ msg: "Internal server error" });
            }
            if (results.length == 0) {
                return res.status(404).send({ msg: "Not found" });
            }
            results[0].created_at = date(results[0].created_at);
            res.send(results[0]);
        });
    });
    app.get("/user/todos", middleware, (req, res) => {
        db.query('SELECT * FROM todo WHERE user_id = ?', [req.user.id], (err, results) => {
            if (err) {
                return res.status(500).send({ msg: "Internal server error" });
            }
            results = results.map(result => {
                result.created_at = date(result.created_at);
                result.due_time = date(result.due_time);
                return result;
            });
            res.send(results);
        });
    });
    app.get("/users/:idemail", middleware, (req, res) => {
        if (!isNaN(req.params.idemail)) {
            db.query('SELECT * FROM user WHERE id = ?', [req.params.idemail], (err, results) => {
                if (err) {
                    return res.status(500).send({ msg: "Internal server error" });
                }
                if (results.length == 0) {
                    return res.status(404).send({ msg: "Not found" });
                }
                results[0].created_at = date(results[0].created_at);
                res.send(results[0]);
            });
        } else {
            db.query('SELECT * FROM user WHERE email = ?', [req.params.idemail], (err, results) => {
                if (err) {
                    return res.status(500).send({ msg: "Internal server error" });
                }
                if (results.length == 0) {
                    return res.status(404).send({ msg: "Not found" });
                }
                results[0].created_at = date(results[0].created_at);
                res.send(results[0]);
            });
        }
    });
    app.put("/users/:id", middleware, (req, res) => {
        if (req.body.email == undefined || req.body.name == undefined || req.body.firstname == undefined || req.body.password == undefined) {
            return res.send({ msg: "Bad Parameter" });
        }
        db.query('SELECT * FROM user WHERE email = ?', [req.body.email], (err, rows) => {
            if (err) {
                return res.status(500).send({ msg: "Internal server error" });
            }
            if (rows.length > 0 && rows[0].id != req.params.id) {
                return res.status(404).send({ msg: "Not found" });
            }
            const passwd = bcrypt.hashSync(req.body.password, 10);
            db.query('UPDATE user SET email = ?, password = ?, name = ?, firstname = ? WHERE id = ?', [req.body.email, passwd, req.body.name, req.body.firstname, req.params.id], (err, results) => {
                if (err) {
                    return res.status(500).send({ msg: "Internal server error" });
                }
                if (results.affectedRows == 0) {
                    return res.status(404).send({ msg: "Not found" });
                }
                db.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, results) => {
                    if (err) {
                        return res.status(500).send({ msg: "Internal server error" });
                    }
                    results[0].created_at = date(results[0].created_at);
                    res.send(results[0]);
                });
            });
        });
    });
    app.delete("/users/:id", middleware, (req, res) => {
        db.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, results) => {
            if (err) {
                return res.status(500).send({ msg: "Internal server error" });
            }
            if (results.affectedRows == 0) {
                return res.status(404).send({ msg: "Not found" });
            }
            res.send({ msg: `Successfully deleted record number: ${req.params.id}` });
        });
    });
};
