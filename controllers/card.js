const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.getCard = (req, res) => {
  Card.findById(req.params.id)
    .orFail(() => new Error('notValidId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'Error') {
        return res.status(404).send({ message: 'Не найдена карточки с таким id' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Не валидные id' });
      }

      return res.status(500).send({ message: 'На сервере произошла ошибка' });
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
        return Promise.reject(new Error('Нет прав для обработки'));
      }

      return Card.findByIdAndRemove(req.params.id)
        .orFail(() => new Error('notValidId'))
        .then((dataCard) => res.send({ data: dataCard }))
        .catch((err) => {
          if (err.name === 'Error') {
            return res.status(404).send({ message: 'не найдена карточка с таким id' });
          }
          if (err.name === 'CastError') {
            return res.status(400).send({ message: 'не валидный id' });
          }

          return res.status(500).send({ message: 'на сервере произошла ошибка' });
        });
    })
    .catch(() => {
      res.status(404).send({ message: 'Нет прав для доступа' });
    });
};

module.exports.addLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => new Error('notValidId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'Error') {
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
    .orFail(() => new Error('notValidId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'Error') {
        return res.status(404).send({ message: 'не найдена карточка с таким id' });
      }
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Не валидные id' });
      }

      return res.status(500).send({ message: 'На сервера произошла ошибка' });
    });
};
