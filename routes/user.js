const router = require('express').Router();
const auth = require('../middlewares/auth');

const {
  getUsers, getUser, updatetUser, updatetAvatar,
} = require('../controllers/user');

router.get('/', auth, getUsers);
router.get('/:id', auth, getUser);

router.patch('/me', auth, updatetUser);
router.patch('/me/avatar', auth, updatetAvatar);

module.exports = router;
