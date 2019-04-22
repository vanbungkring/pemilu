var express = require('express');
var router = express.Router();
var PARTAI = 'https://pemilu2019.kpu.go.id/static/json/partai.json?' + new Date().getTime()
var DAPIL = 'https://pemilu2019.kpu.go.id/static/json/dapil/dprri.json?' + new Date().getTime()
var HASIL = 'https://pemilu2019.kpu.go.id/static/json/hhcd/0.json'
const request = require('request');
const numeral = require('numeral');
const async = require('async');

router.get('/', function(req, res, next) {
  async.parallel({
    PARTAI: function(callback) {
      request(PARTAI, {
        json: true,
        strictSSL: false
      }, (err, res, body) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, body);
        }
      });
    },
    DAPIL: function(callback) {
      request(DAPIL, {
        json: true,
        strictSSL: false
      }, (err, res, body) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, body);
        }
      });
    },
    HASIL: function(callback) {
      request(HASIL, {
        json: true,
        strictSSL: false
      }, (err, res, body) => {
        if (err) {
          console.log(err);
          callback(err, null);
        } else {
          callback(null, body);
        }
      });
    }
  }, function(err, results) {
    var dapil = Object.values(results.DAPIL);
    var partai = Object.values(results.PARTAI);
    var hasil = Object.values(results.HASIL);
    if (req.xhr) {
      return res.json({
        hasil: results.HASIL.table["3303"],
        partai: partai,
        data: results
      })
    }
    res.render('dapil3', {
      title: 'DAPIL',
      data: results,
      partai: partai,
      dapil: "JAWA TENGAH III",
      hasil: results.HASIL.table["3303"],
      numeral: numeral
    });
    //   //res.json(results);
    //   var kpjs1 = 0;
    //   var kpjs2 = 0;
    //   console.log(results.KP);
    //   for (var i = 0, len = results.KP.children.length; i < len; i++) {
    //     var kpjs1 = kpjs1 + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['pas1'])
    //     console.log(kpjs1);
    //     var kpjs2 = kpjs1 + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['pas2'])
    //     console.log(kpjs2);
    //   }
    //   res.render('index', {
    //     title: KPU,
    //     data: results,
    //     kpjs1: kpjs1,
    //     kpjs2: kpjs2,
    //     numeral: numeral
    //   });
  });
});

module.exports = router;
