const jwt = require('jsonwebtoken');

const JWT_SECRET = '6a672188c7e3304165e9acafd99f3e89caa47c5bf4636dcb5b1e8aa79478a63e';

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация туточки' });
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    const { NODE_ENV } = process.env;
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }

  req.user = payload;

  next();
};
