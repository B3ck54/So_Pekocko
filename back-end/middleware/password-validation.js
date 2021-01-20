const passwordSchema = require('../models/password');

module.exports = (req, res, next) => {
    if(!passwordSchema.validate(req.body.password)){
        return res.status(400).json({ error: "Votre mot de passe n\'est pas sécurisé, il doit comporter : " + passwordSchema.validate(req.body.password, { list: true }) });
    } else {    
        next();
    }
};