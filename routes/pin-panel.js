const express = require('express');
const path = require('path');

const router = express.Router();

const builderDir = path.join(__dirname, '..', 'public', 'pin-builder');

router.use('/pin-panel/assets', express.static(builderDir));

router.get('/pin-panel', (req, res) => {
  res.sendFile(path.join(builderDir, 'index.html'));
});

module.exports = router;
