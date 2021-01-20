const { json } = require('body-parser');
const fs = require('fs');
const { findOne } = require('../models/Sauce');

const Sauce = require ('../models/Sauce');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
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

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.editSauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
    .catch(error => res.status(400).json({ error }));
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
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

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
  };

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(400).json({ error }));
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.likeSauce = (req, res, next) => {

  let like = req.body.like;
  let userId = req.body.userId;


  // on récupère la sauce dans l'url req.params.id, et on utilise la méthode findOne de mongoose pour la trouver.
  Sauce.findOne({_id: req.params.id})         
   .then(sauce => {

  switch (like ) {
    // a user likes sauce
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

      // a user dislikes sauce
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

      // a user unlike sauce
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
          // a user undislikes sauce
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