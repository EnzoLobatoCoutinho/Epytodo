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
    app.get("/todos", middleware, (req, res) => {
        db.query('SELECT * FROM todo', (err, results) => {
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
    app.get("/todos/:id", middleware, (req, res) => {
        db.query('SELECT * FROM todo WHERE id = ?', [req.params.id], (err, results) => {
            if (err) {
                return res.status(500).send({ msg: "Internal server error" });
            }
            if (results.length == 0) {
                return res.status(404).send({ msg: "Not found" });
            }
            results[0].created_at = date(results[0].created_at);
            results[0].due_time = date(results[0].due_time);
            res.send(results[0]);
        });
    });
    app.post("/todos", middleware, (req, res) => {
        if (req.body.title == undefined || req.body.description == undefined || req.body.due_time == undefined || req.body.user_id == undefined || isNaN(req.body.user_id) || req.body.status == undefined) {
            return res.status(400).send({ msg: "Bad Parameter" });
        }
        db.query('SELECT * FROM user WHERE id = ?', [req.body.user_id], (err, rows) => {
            if (err) {
                return res.status(500).send({ msg: "Internal server error" });
            }
            if (rows.length == 0) {
                return res.status(500).send({ msg: "Internal server error" });
            }
            db.query('INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)', [req.body.title, req.body.description, req.body.due_time, req.body.user_id, req.body.status], (err, results) => {
                if (err) {
                    return res.status(500).send({ msg: "Internal server error" });
                }
                db.query('SELECT * FROM todo WHERE id = ?', [results.insertId], (err, results) => {
                    if (err) {
                        return res.status(500).send({ msg: "Internal server error" });
                    }
                    results[0].created_at = date(results[0].created_at);
                    results[0].due_time = date(results[0].due_time);
                    res.send(results[0]);
                });
            });
        });
    });
    app.put("/todos/:id", middleware, (req, res) => {
        if (req.body.title == undefined || req.body.description == undefined || req.body.due_time == undefined || req.body.user_id == undefined || isNaN(req.body.user_id) || req.body.status == undefined) {
            return res.status(400).send({ msg: "Bad Parameter" });
        }
        db.query('SELECT * FROM user WHERE id = ?', [req.body.user_id], (err, rows) => {
            if (err) {
                return res.status(500).send({ msg: "Internal server error" });
            }
            if (rows.length == 0) {
                return res.status(500).send({ msg: "Internal server error" });
            }
            db.query('UPDATE todo SET title = ?, description = ?, due_time = ?, user_id = ?, status = ? WHERE id = ?', [req.body.title, req.body.description, req.body.due_time, req.body.user_id, req.body.status, req.params.id], (err, results) => {
                if (err) {
                    return res.status(500).send({ msg: "Internal server error" });
                }
                db.query('SELECT * FROM todo WHERE id = ?', [req.params.id], (err, results) => {
                    if (err) {
                        return res.status(500).send({ msg: "Internal server error" });
                    }
                    if (results.length == 0) {
                        return res.status(404).send({ msg: "Not found" });
                    }
                    results[0].created_at = date(results[0].created_at);
                    results[0].due_time = date(results[0].due_time);
                    res.send(results[0]);
                });
            });
        });
    });
    app.delete("/todos/:id", middleware, (req, res) => {
        db.query('DELETE FROM todo WHERE id = ?', [req.params.id], (err, results) => {
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
