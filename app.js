/* eslint-disable no-unused-vars */
const { errors } = require('celebrate');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const NotFoundError = require('./errors/not-found-err');
const { login, createUser } = require('./controllers/user');

const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://84.252.131.237',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: [
    'Content-Type',
    'origin',
    'Authorization',
    'x-access-token',
    'accept',
  ],
  credentials: true,
};

const users = [
  { name: 'Дима', age: 22 },
  { name: 'Виктор', age: 30 },
  { name: 'Анастасия', age: 48 },
  { name: 'Алексей', age: 121 },
];

const app = express();
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('*', cors(corsOptions));

app.use(errors());
app.get('/', (req, res) => {
  res.status(200).send({message: " GET '/users' - получить данные, POST '/users' - изминить данные " });
});

app.get('/users', (req, res) => {
  res.status(200).send({message: 'Запрос GET, Получай информацию!', data: users });
});

app.post('/users', (req, res) => {
  const data = req.body;
  users.push({ name: data.name, age: data.age });
  res.status(200).send({ message: `Создал нового человека ${data.name} и ему ${data.age}`, users });
});

app.use('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

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
