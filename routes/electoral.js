var express = require('express');
var router = express.Router();
var PARTAI = 'https://pemilu2019.kpu.go.id/static/json/partai.json?' + new Date().getTime()
var DAPIL = 'https://pemilu2019.kpu.go.id/static/json/dapil/dprri.json?' + new Date().getTime()
var HASIL = 'https://pemilu2019.kpu.go.id/static/json/hhcd/0.json'
const request = require('request');
const numeral = require('numeral');
var key = 'electoral'
const async = require('async');
const redis = require('redis');
const client = redis.createClient();
const DAPIL_STATIC = require('../static/dapil');
const PARTAI_STATIC = require('../static/partai');
router.get('/', calculate);
router.get('/dapil', generatedapil);
router.get('/hasil',cached, generateHasil);
router.get('/partai', generatePartai);

function cached(req, res, next) {
  client.get(key, function(err, data) {
      if (err) {
        next();
      };
      if (data != null) {
        return res.json(JSON.parse(data));
        }
        else {
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
