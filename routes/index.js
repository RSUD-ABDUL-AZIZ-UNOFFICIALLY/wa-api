const express = require("express");
const routes = express.Router();

const base = require('../controllers/wa');
const wa = require('../controllers/wa');
// const middleware = require('../middlewares');


routes.post('/wa/send', wa.send);

module.exports = routes;
