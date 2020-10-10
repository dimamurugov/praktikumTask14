const router = require('express').Router();
const auth = require('../middlewares/auth');
const {
  getCards, createCard, deleteCard, addLike, deleteLike, getCard,
} = require('../controllers/card');

router.get('/', auth, getCards);
router.get('/:id', auth, getCard);
router.post('/', auth, createCard);
router.delete('/:id', auth, deleteCard);

router.put('/:cardId/likes', auth, addLike);
router.delete('/:cardId/likes', auth, deleteLike);

module.exports = router;
