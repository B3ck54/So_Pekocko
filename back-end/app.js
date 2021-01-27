// Ce fichier gère toutes les requêtes envoyées au serveur

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path'); //donne accès au chemin de système de fichier
const helmet = require("helmet");// sécurité entêtes http

const dotenv = require('dotenv').config();

mongoose.set('useCreateIndex', true);


const sauceRoutes = require ('./routes/sauce');
const userRoutes = require ('./routes/user');

const connectionSecurity = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`
mongoose.connect( connectionSecurity,
{ useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(helmet());

var session = require('express-session');
app.set('trust proxy', 1) // trust first proxy

app.use(session({
  secret : 's3cuR3',
  name : 'sessionId',
  key: 'sid',
  resave: true,
  saveUninitialized: true,
    cookies: {
    secure: true,
    httpOnly: true, //sécurise la connexion au niveau des cookies pour ne pas être modifier par un attaquant
    domain: 'http://localhost:3000',
    sameSite: true,
    maxAge: 600000 // Time is in miliseconds
    }  
  })
);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;