/* eslint-disable consistent-return */
const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.getCard = (req, res) => {
  Card.findById(req.params.id)
    .orFail(new Error('nullId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'nullId') {
        return res.status(404).send({ message: 'Не найдена карточки с таким id' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Не валидные id' });
      }

      return res.status(500).send({ message: err });
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }

      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findById(req.params.id)
    .then((card) => {
      if (card.owner._id.toString() !== req.user._id) {
        const error = new Error();
        error.name = 'notRules';
        return Promise.reject(error);
      }

      return Card.findByIdAndRemove(req.params.id)
        .then((dataCard) => res.send({ data: dataCard }))
        .catch(() => res.status(500).send({ message: 'на сервере произошла ошибка' }));
    })
    .catch((err) => {
      if (err.name === 'notRules') {
        return res.status(403).send({ message: 'Нет прав доступа' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Не валидный id карты' });
      }
      if (err.name === 'TypeError') {
        return res.status(404).send({ message: 'Нет карты с таким id' });
      }
      return res.status(500).send({ message: 'на сервере произошла ошибка' });
    });
};

module.exports.addLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('nullId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'nullId') {
        return res.status(404).send({ message: 'не найдена карточка с таким id' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Не валидные id' });
      }

      return res.status(500).send({ message: 'На сервера произошла ошибка' });
    });
};

module.exports.deleteLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(new Error('nullId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'nullId') {
        return res.status(404).send({ message: 'не найдена карточка с таким id' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Не валидные id' });
      }

      return res.status(500).send({ message: 'На сервера произошла ошибка' });
    });
};
