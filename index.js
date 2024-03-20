/** @format */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes/index');
const port = 3001;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
	cors({
		origin: '*',
		allowedHeaders: '*',
		exposedHeaders: '*',
	})
);

app.use(apiRoutes);

app.listen(port, () => console.log(`listening on http://localhost:${port}`));
