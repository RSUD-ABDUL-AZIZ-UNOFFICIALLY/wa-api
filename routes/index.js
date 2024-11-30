const express = require("express");
const routes = express.Router();

const base = require('../controllers/wa');
const wa = require('../controllers/wa');
const middleware = require('../middlewares');

routes.post('/wa/send',middleware.check, wa.send);
routes.post('/wa/sendgrub',middleware.check, wa.sendGrub);
routes.post('/wa/postmedia', middleware.check, wa.postMedia);
routes.get('/wa/getprofilepic',middleware.check, wa.getProfilePic);

module.exports = routes;
