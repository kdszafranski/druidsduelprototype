var express = require('express');
var router = express.Router();
var path = require('path');

// Handle index file separately
// Also catches any other request not explicitly matched elsewhere
router.get('/', function(req, res) {
  console.log("here");
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;
