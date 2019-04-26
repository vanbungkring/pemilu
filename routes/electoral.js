var express = require('express');
var router = express.Router();
var PARTAI = 'https://pemilu2019.kpu.go.id/static/json/partai.json?' + new Date().getTime()
var DAPIL = 'https://pemilu2019.kpu.go.id/static/json/dapil/dprri.json?' + new Date().getTime()
var HASIL = 'https://pemilu2019.kpu.go.id/static/json/hhcd/0.json'
const request = require('request');
const numeral = require('numeral');
const _ = require('underscore');
var key = 'electoral'
const async = require('async');
const redis = require('redis');
const client = redis.createClient();
const DAPIL_STATIC = require('../static/dapil');
const PARTAI_STATIC = require('../static/partai');
router.get('/', calculate);
router.get('/dapil', generatedapil);
router.get('/hasil', cached, generateHasil);
router.get('/partai', generatePartai);

function cached(req, res, next) {
  client.get(key, function(err, data) {
    if (err) {
      next();
    };
    if (data != null) {
      return render(JSON.parse(data), res);;
    } else {
      next();
    }
  });
}

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
      client.setex(key, 7200, JSON.stringify(body));
      render(result, res);
    }
  });
}

function render(result, res) {
  var tmp = {};
  var tmp2 = {}
  for (var data in DAPIL_STATIC) {
    console.log(result.table[data]);
    var keysSorted = (Object.keys(result.table[data]).sort(function(a, b) {
      return result.table[data][b] - result.table[data][a]
    }))
    console.log(keysSorted)
    // var sortedByVal = Object.keys(result.table[data])
    //   .filter(x => /^\d/g.test(x))
    //   .map(function(x) {
    //     tmp[this[x]] = x;
    //     return this[x];
    //   }, result.table[data])
    //   .sort((a, b) => b - a);
    // sortedByVal.forEach(function(x){
    //   var datax = new Object();
    //   datax[tmp[x]] = x;
    //   tmp2[data]=datax
    //   console.log('data-->',tmp[x], ':', x)
    // })
  }
  res.json(keysSorted);
}

function calculate(req, res) {
  res.render('electoral', {
    title: 'Simulasi Perolehan Kursi Legislatif'
  });
}
module.exports = router;
