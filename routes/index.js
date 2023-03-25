const express = require("express");
const routes = express.Router();

const base = require('../controllers/wa');
const wa = require('../controllers/wa');
const middleware = require('../middlewares');


routes.post('/wa/send',middleware.check, wa.send);
routes.get('/wa/getprofilepic', middleware.check,wa.getProfilePic);

module.exports = routes;
