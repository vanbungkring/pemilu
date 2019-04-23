var express = require('express');
var router = express.Router();
var PARTAI = 'https://pemilu2019.kpu.go.id/static/json/partai.json?' + new Date().getTime()
var DAPIL = 'https://pemilu2019.kpu.go.id/static/json/dapil/dprri.json?' + new Date().getTime()
var HASIL = 'https://pemilu2019.kpu.go.id/static/json/hhcw/dprri/32676.json'
const request = require('request');
const numeral = require('numeral');
const async = require('async');
const DAPIL_STATIC = require('../static/wilayah');
const PARTAI_STATIC = require('../static/partai');
router.get('/', calculate);
router.get('/dapil', generatedapil);
router.get('/hasil', generateHasil);
router.get('/partai', generatePartai);

function generatedapil(req, res) {
  res.json(DAPIL_STATIC);
}

function generatePartai(req, res) {
  res.json(PARTAI_STATIC);
}

function generateHasil(req, res) {
  request(HASIL, {
    json: true,
    strictSSL: false
  }, (err, response, body) => {
    if (err) {
      res.json(err)
    } else {
      console.log(body);
      res.json(body)
    }
  });
}

function calculate(req, res) {
  res.render('electoral', {
    title: 'Simulasi Perolehan Kursi Legislatif'
  });
}
module.exports = router;