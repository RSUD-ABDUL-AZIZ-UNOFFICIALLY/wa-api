const jwt = require('jsonwebtoken');
module.exports ={
    check : async (req, res, next) => {
        try {
            if (!req.headers['authorization']) {
                return res.status(401).json({
                    status: false,
                    message: 'unauthorized access',
                    data: 'reuired authorization token'
                });
            }
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
}