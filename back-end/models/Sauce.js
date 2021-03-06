const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    mainPepper: { type: String, required: true },
    likes: { type: Number },
    dislikes: { type: Number },
    usersLiked: { type: Array },
    usersDisliked: { type: Array },
    userId: { type: String }
});

module.exports = mongoose.model('Sauce', sauceSchema);