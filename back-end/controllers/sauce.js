const { json } = require('body-parser');
const fs = require('fs');
const { findOne } = require('../models/Sauce');

const Sauce = require ('../models/Sauce');


exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    //J'initialise les like et dislikes à 0 car lors de l'incrémentation le +1 et -1 affiche NaN lorsque qu'on applique la méthode likeSauce()
    likes: 0,
    dislikes: 0,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
  .then(() => res.status(200).json({ message: 'Sauce créée !'}))
  .catch(error => res.status(400).json({ error }));
};

exports.editSauce = (req, res, next) => {
  let sauceObject = {};

  //si un fichier est présent dans la requête
  if (req.file) {
    //j'efface l'image sur le serveur si la sauce en possède déjà une
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
    const filename = sauce.imageUrl.split('/images/')[1]
    fs.unlinkSync(`images/${filename}`)
  })

   // ici je crée un object sauce si j'update avec une image
    sauceObject = {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
  } else {
    sauceObject = {
      ...req.body
    }
  }  
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
    .catch(error => res.status(400).json({ error }));
};


exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};


exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
  };


exports.getAllSauces = (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({ error }));
};


exports.likeSauce = (req, res, next) => {

  let like = req.body.like;
  let userId = req.body.userId;


  // on récupère la sauce dans l'url req.params.id, et on utilise la méthode findOne de mongoose pour la trouver.
  Sauce.findOne({_id: req.params.id})         
   .then(sauce => { // ici on récupère la sauce trouvée

  switch (like ) {
    // un utilisateur aime une sauce
    case 1:
      Sauce.updateOne(
       {_id :req.params.id } ,
       {
        $inc: { likes: +1 },
        $push: { usersLiked: userId },
      }
        )
        .then(() => res.status(200).json({ message: 'Liked !' }))
        .catch((error) => res.status(400).json({ error }))
      break;

      // un utilisateur n'aime pas une sauce
      case -1:
      Sauce.updateOne(
       {_id :req.params.id } ,
       {
        $inc: { dislikes: +1 },
        $push: { usersDisliked: userId },
      }
        )
        .then(() => res.status(200).json({ message: 'Disliked !' }))
        .catch((error) => res.status(400).json({ error }));
      break;

      // un utilisatuer enlève son like
      case 0:
        if(sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            {_id :req.params.id } ,
            {
             $inc: { likes: -1 },
             $pull: { usersLiked: userId },
           }
             )
             .then(() => res.status(200).json({ message: 'Unliked !' }))
             .catch((error) => res.status(400).json({ error }));
        
        } else if (sauce.usersDisliked.includes(userId)) {
          // un utilisatuer enlève son dislike
          Sauce.updateOne(
            {_id :req.params.id } ,
            {
             $inc: { dislikes: -1 },
             $pull: { usersDisliked: userId },
           }
             )
             .then(() => res.status(200).json({ message: 'Undisliked !' }))
             .catch((error) => res.status(400).json({ error }));
        }
        break;
      }
    })
    .catch(error => res.status(404).json({ error }));
}