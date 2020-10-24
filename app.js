/* eslint-disable no-unused-vars */
const { errors } = require('celebrate');
const { celebrate, Joi } = require('celebrate');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { login, createUser } = require('./controllers/user');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

app.use(requestLogger);

app.use(cookieParser());
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().pattern(/([\w-]\.?)+@([\w-]\.?)+\.\w{2,}/),
    password: Joi.string().required().min(8).max(30),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().pattern(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/),
    email: Joi.string().required().pattern(/([\w-]\.?)+@([\w-]\.?)+\.\w{2,}/),
    password: Joi.string().required().min(8).max(30),
  }),
}), createUser);

app.use('/users', require('./routes/user'));
app.use('/cards', require('./routes/card'));

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(err.statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});

app.listen(PORT);

app.use('/', (req, res) => res.status(404).send({ message: 'Запрашиваемый ресурс не найден' }));
