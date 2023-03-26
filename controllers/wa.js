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
};
