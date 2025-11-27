const buildAuthService = require('../services/authService');

class AuthController {
  init(dependencies) {
    this.authService = buildAuthService(dependencies);
    return this;
  }

  register = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'name, email and password are required' });
      }
      const result = await this.authService.register({ name, email, password });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
      }
      const result = await this.authService.login({ email, password });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = new AuthController();
