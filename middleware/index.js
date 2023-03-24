const jwt = require('jsonwebtoken');
module.exports ={
    check : async (req, res, next) => {
        try {
            const token = (req.headers['authorization']).split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET_KEY);
            next();
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    },
    checkAdmin : async (req, res, next) => {
        try {
            const token = (req.headers['authorization']).split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            let obj = decoded.kd_access.find(o => o.lvid === 1);
            console.log(obj);
            if (obj) {
                next();
            } else {
                return res.status(401).json({
                    status: false,
                    message: 'You are not admin',
                    data: null
                });
            }
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    },
    checkDokter : async (req, res, next) => {
        try {
            const token = (req.headers['authorization']).split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            let obj = decoded.kd_access.find(o => o.lvid === 3);
            console.log(obj);
            if (obj) {
                next();
            } else {
                return res.status(401).json({
                    status: false,
                    message: 'You are not dokter',
                    data: null
                });
            }
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    }
}