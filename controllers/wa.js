const { seedmsg, getPic } = require("./app.js");

module.exports = {
  send: async (req, res, next) => {
    try {
      const { telp, message } = req.body;
      let kirim = await seedmsg(telp, message);
      console.log(kirim);
      if (kirim.status == true) {
        return res.status(200).json(kirim);
      }
      return res.status(400).json(kirim);
    } catch (error) {
      return next(error);
    }
  },
  getProfilePic: async (req, res, next) => {
    try {
      const { telp } = req.body;
      let kirim = await getPic(telp);
      console.log(kirim);
      if (kirim.status == true) {
        return res.status(200).json(kirim);
      }
      return res.status(400).json(kirim);
    } catch (error) {
      return next(error);
    }
  }
};
