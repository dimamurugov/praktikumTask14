/* eslint-disable consistent-return */
const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const NotRequestError = require('../errors/not-request-err');
const NotRulesError = require('../errors/not-rules-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.getCard = (req, res, next) => {
  Card.findById(req.params.id)
    .orFail(() => {
      throw new NotFoundError('Нет карточки с таким id');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotRequestError('не валидный id');
      }
      next(err);
    })
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new NotRequestError('Переданы некорректные данные');
      }

      next(err);
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.id)
    .then((card) => {
      if (card.owner._id.toString() !== req.user._id) {
        throw new NotRulesError('Нет прав доступа');
      }

      return Card.findByIdAndRemove(req.params.id)
        .orFail(() => {
          throw new NotFoundError('не найдена карточка с таким id');
        })
        .then((dataCard) => res.send({ data: dataCard }))
        .catch((err) => {
          next(err);
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotRequestError('Не валидный id карты');
      }
      if (err.name === 'TypeError') {
        throw new NotFoundError('Нет карточки с таким id');
      }
      next(err);
    })
    .catch(next);
};

module.exports.addLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('не найдена карточка с таким id');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotRequestError('Не валидный id карты');
      }

      next(err);
    })
    .catch(next);
};

module.exports.deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('не найдена карточка с таким id');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotRequestError('Не валидный id карты');
      }

      next(err);
    })
    .catch(next);
};
