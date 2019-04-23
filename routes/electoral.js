var express = require('express');
var router = express.Router();
var PARTAI = 'https://pemilu2019.kpu.go.id/static/json/partai.json?' + new Date().getTime()
var DAPIL = 'https://pemilu2019.kpu.go.id/static/json/dapil/dprri.json?' + new Date().getTime()
var HASIL = 'https://pemilu2019.kpu.go.id/static/json/hhcd/0.json'
const request = require('request');
const numeral = require('numeral');
const async = require('async');
const DAPIL_STATIC = require('../static/dapil');

router.get('/', calculate);
router.get('/dapil', generatedapil);

function generatedapil(req, res) {
  res.json(DAPIL_STATIC);
}

function calculate(req, res) {
  res.render('electoral', {
    title: 'Simulasi Perolehan Kursi Legislatif'
  });
}
module.exports = router;
