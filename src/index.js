require('dotenv').config();
const express = require("express");
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT;
const db = require("./config/db");
const middleware = require('./middleware/auth');

app.use(express.json());
app.use(bodyParser.json());

require("./routes/auth/auth")(app, bcrypt, db);
require("./routes/user/user")(app, bcrypt, db, middleware);
require("./routes/todos/todos")(app, bcrypt, db, middleware);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});