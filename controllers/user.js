const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const JWT_SECRET = '6a672188c7e3304165e9acafd99f3e89caa47c5bf4636dcb5b1e8aa79478a63e';
module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  const { NODE_ENV } = process.env;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });

      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true,
      });
      res.status(200).send({ message: 'Авторизация прошла успешно!' })
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
    .then((hash) => {
      if (password.length < 8) {
        const error = new Error();
        error.name = 'smallPassword';
        return Promise.reject(error);
      }
      return hash;
    })
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({
      data: {
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      if (err.name === 'MongoError') {
        return res.status(409).send({ message: 'Такой пользователь уже существует' });
      }
      if (err.name === 'smallPassword') {
        return res.status(400).send({ message: 'Пароль должен быть миниму 8 символов' });
      }

      return res.status(500).send({ message: 'произошла ошибка на сервере' });
    });
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.id)
    .orFail(() => {
      const error = new Error();
      error.name = 'notValidId';
      return Promise.reject(error);
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'notValidId') {
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
