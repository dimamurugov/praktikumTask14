/* eslint-disable consistent-return */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const NotFoundError = require('../errors/not-found-err');
const NotLoginError = require('../errors/not-login-err');
const NotRequestError = require('../errors/not-request-err');
const ConflictError = require('../errors/conflict-err');

const JWT_SECRET = '6a672188c7e3304165e9acafd99f3e89caa47c5bf4636dcb5b1e8aa79478a63e';
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.login = (req, res, next) => {
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
      throw new NotLoginError('Неправильные почта или пароль');
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password || '', 10)
    .then((hash) => {
      const regex = /\w.{7,}/i;
      if (!regex.test(password) || password === undefined) {
        throw new NotRequestError('Пароль должен быть миниму 8 символов');
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
        throw new NotRequestError('Пароль должен быть миниму 8 символов');
      }
      if (err.name === 'MongoError') {
        throw new ConflictError('Такой пользователь уже существует');
      }

      next(err);
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new NotFoundError('не найден пользователь с таким id');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotRequestError('Не валидный id');
      }

      next(err);
    })
    .catch(next);
};

module.exports.updatetUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('не найден пользователь с таким id');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new NotRequestError('Переданы некорректные данные');
      }
      next(err);
    })
    .catch(next);
};

module.exports.updatetAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar })
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('не найден пользователь с таким id');
      }
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new NotRequestError('Переданы некорректные данные');
      }
      next(err);
    })
    .catch(next);
};
