const { seedmsg } = require("./app.js");

module.exports = {
  send: async (req, res, next) => {
    try {
      const { telp, message } = req.body;
   // contoh callback function
    //   seedmsg(telp, message, (err, result) => {
    //     if (err) {
    //         return res.status(400).json(err);
    //     }
    //     return res.status(200).json(result);
    //     });
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
};
