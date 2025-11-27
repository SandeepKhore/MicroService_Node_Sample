const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { logger } = require('../../../shared');
const buildUserRepository = require('../repositories/userRepository');

module.exports = ({ redisClient, eventBus, config }) => {
  const userRepository = buildUserRepository();
  const generateSession = async (userId) => {
    const sessionToken = uuid();
    await redisClient.set(sessionToken, userId.toString(), {
      EX: config.sessionTtlSeconds,
    });
    return sessionToken;
  };

  const generateJwt = (user) => {
    return jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
      },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
  };

  const sanitizeUser = (user) => ({
    id: user._id,
    email: user.email,
    name: user.name,
  });

  const register = async ({ name, email, password }) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      const err = new Error('Email already in use');
      err.status = 400;
      throw err;
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser({ name, email, password: hash });
    const sessionToken = await generateSession(user._id);
    const jwtToken = generateJwt(user);

    await eventBus.publish('user.events', 'user.registered', {
      id: user._id,
      email: user.email,
      name: user.name,
    });

    logger.info(`User registered ${user.email}`);
    return {
      user: sanitizeUser(user),
      sessionToken,
      jwtToken,
    };
  };

  const login = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const sessionToken = await generateSession(user._id);
    const jwtToken = generateJwt(user);

    await eventBus.publish('user.events', 'user.loggedin', {
      id: user._id,
      email: user.email,
      name: user.name,
    });

    logger.info(`User logged in ${user.email}`);
    return {
      user: sanitizeUser(user),
      sessionToken,
      jwtToken,
    };
  };

  return {
    register,
    login,
  };
};
