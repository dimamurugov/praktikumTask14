const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  const { NODE_ENV, JWT_SECRET } = process.env;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });

      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true,
      })
        .end();
    })
    .catch(() => {
      res.status(401).send({ message: 'Неправильные почта или пароль' });
    });
};

module.exports.createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }

      return res.status(500).send({ message: 'произошла ошибка на сервере' });
    });
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.id)
    .orFail(() => new Error('notValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'Error') {
        return res.status(404).send({ message: 'не найден пользователь с таким id' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'не валидный id' });
      }

      return res.status(500).send({ message: 'На сервера произошла ошибка' });
    });
};

module.exports.updatetUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }

      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.updatetAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }

      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};
