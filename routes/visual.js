var express = require('express');
var router = express.Router();
const request = require('request');
const numeral = require('numeral');
const async = require('async');
router.get('/', drawMap);

function drawMap(req,res){
  res.render('visual', {
    title: 'Simulasi Perolehan Kursi Legislatif'
  });
}
module.exports = router;
