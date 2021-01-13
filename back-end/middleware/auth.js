const jwt = require('jsonwebtoken');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; //on récupére le token dans le header et on le split
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();//middleware  qui sera appliqué avant le controller de nos routes. Pour chaque requête sur nos routes protégées on va d'abord passer par ce middleware
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};