const bcrypt = require ('bcrypt');
const { json } = require('body-parser');
const jwt = require('jsonwebtoken');

const User = require ('../models/User');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) //exécution de l'algorythme de hashage -> 10 tours si on met plus de tour = plus de temps
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };


exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }) // on trouve le user qui correspond à l'email entré dans le formulaire (email unique donc on est sûr du user)
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' }); // si l'utisateur n'est pas trouvé dans la base
      }
      bcrypt.compare(req.body.password, user.password) //vérification des identifiants d’un utilisateur en comparant le hash entré avec le hash enregistré dans la base de données.
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({ // ici c'est que les informations sont valables
            userId: user._id, // renvoie un objet json qui contient un userId  et un token
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET', // le token est dans le header de la requête
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error })); // erreur liée à mongodb/erreur serveur
    })
    .catch(error => res.status(500).json({ error }));
};

