const express = require("express");
const routes = express.Router();

const base = require('../controllers/wa');
const wa = require('../controllers/wa');
const middleware = require('../middlewares');

routes.post('/wa/send',middleware.check, wa.send);
routes.post('/wa/sendgrub',middleware.check, wa.sendGrub);
routes.post('/wa/postmedia', middleware.check, wa.postMedia);
routes.get('/wa/getprofilepic',middleware.check, wa.getProfilePic);
routes.post('/wa/cek', middleware.check, wa.cekCotak);
routes.post('/wa/logout', middleware.check, wa.logout);
routes.get('/wa/listChat', middleware.check, wa.getlistChat);
routes.post('/wa/setUnread', middleware.check, wa.setUnread);
routes.get('/wa/getChat', middleware.check, base.getChat);
routes.post('/wa/getImageChat', middleware.check, wa.getImageChat);
routes.post('/wa/contacname', middleware.check, wa.getContactName);

module.exports = routes;
