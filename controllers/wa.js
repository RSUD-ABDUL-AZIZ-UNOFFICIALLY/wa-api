const { seedmsg, sendGrubMsg, sendMedia, getPic } = require("./app.js");

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
  sendGrub: async (req, res, next) => {
    try {
      const { telp, message } = req.body;
      let kirim = await sendGrubMsg(telp, message);
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
      const { telp } = req.query;
      let kirim = await getPic(telp);
      console.log(kirim);
      if (kirim.status == true) {
        if (!kirim.data.profilePic) {
          let baseURL = req.protocol + "://" + req.get("host") + "/";
          return res.status(203).json({
            status: true,
            message: "Profile pic found",
            data:{
              profilePic: baseURL + "api/wa/image/my-profile-circle.webp"
            }
          });
        }
        return res.status(200).json(kirim);
      }
      return res.status(400).json(kirim);
    } catch (error) {
      return next(error);
    }
  },
  postMedia: async (req, res, next) => {
    try {
      const { pdfUrl, to, stt, fileName } = req.body;
      let kirim = await sendMedia(pdfUrl, to, stt, fileName);
      console.log(kirim);
      if (kirim.status == true) {
        return res.status(200).json(kirim);
      }
      return res.status(400).json(kirim);
    } catch (error) {
      return next(error);
    }
  },
};
