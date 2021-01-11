const express = require('express');

const app = express();

app.use('/api/auth/login', (req, res, next) => {
    const user = [
      {
        _id: '1',
        email: 'test@email.com',
        password: 'MotDePasse',
        userId: '1',
      },
    ];
    res.status(200).json(user);
  });

module.exports = app;