const { json } = require('body-parser');
const fs = require('fs');
const { findOne } = require('../models/Sauce');

const Sauce = require ('../models/Sauce');


exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
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

  if (req.file) {
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
    const filename = sauce.imageUrl.split('/images/')[1]
    fs.unlinkSync(`images/${filename}`)
    })

    sauceObject = {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
  } else {
    sauceObject = {
      ...req.body
    }
  }
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) // 1er argument = objet de comparaison celui qu'on modifie et le 2eme argument c'est la nouvelle version de l'objet et on vérifie que l'id est celui qui est bien dans le corps de la requête
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


  Sauce.findOne({_id: req.params.id})         
   .then(sauce => { 

  switch (like ) {
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