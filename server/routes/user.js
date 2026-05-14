const router = require('express').Router();
const auth   = require('../middleware/auth');
const User   = require('../models/User');

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch { res.status(500).json({ msg: 'Server error' }); }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { skills: req.body.skills },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;