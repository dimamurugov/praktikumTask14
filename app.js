require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { login, createUser } = require('./controllers/user');

const app = express();
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

app.post('/signin', login);
app.post('/signup', createUser);

app.use('/users', require('./routes/user'));
app.use('/cards', require('./routes/card'));

app.listen(PORT);

app.use('/', (req, res) => res.status(404).send({ message: 'Запрашиваемый ресурс не найден' }));
