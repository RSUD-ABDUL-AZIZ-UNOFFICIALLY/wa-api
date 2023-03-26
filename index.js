'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.enable('trust proxy');
app.use("/api/wa/image", express.static("public/img"));

const routes = require('./routes');
app.use('/api', routes);

// handel error
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        status: false,
        message: 'internal server error',
        data: err.message
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('running on port', PORT);
});
