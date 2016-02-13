var express = require('express');


var router = express.Router();
var oauthsig = require('oauth-signature');
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req);
});

module.exports = router;
