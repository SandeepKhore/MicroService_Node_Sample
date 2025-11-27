const express = require('express');
const authController = require('../controllers/authController');

module.exports = (dependencies) => {
  authController.init(dependencies);
  const router = express.Router();

  router.post('/register', authController.register);
  router.post('/login', authController.login);

  return router;
};
