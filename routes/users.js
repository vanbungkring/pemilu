var express = require('express');
var router = express.Router();
//var PARTAI = 'https://pemilu2019.kpu.go.id/static/json/partai.json?' + new Date().getTime()
const PARTAI = require('../static/partai');
var DAPIL = 'https://pemilu2019.kpu.go.id/static/json/dapil/dprri.json?' + new Date().getTime()
var HASIL = 'https://pemilu2019.kpu.go.id/static/json/hhcd/0.json'
const DAPIL_STATIC = require('../static/dapil');
const PARTAI_STATIC = require('../static/partai');
const request = require('request');
const numeral = require('numeral');
const async = require('async');

router.get('/', function(req, res, next) {
  console.log('called');
  async.series({
    PARTAI: function(callback) {
      console.log(PARTAI);
      callback(null, PARTAI);
    },
    HASIL: function(callback) {
      request(HASIL, {
        json: true,
        strictSSL: false
      }, (err, res, body) => {
        console.log(body);
        if (err) {
          console.log(err);
          callback(err, null);
        } else {
          callback(null, body);
        }
      });
    }
  }, function(err, results) {
    console.log(results);
    var partai = Object.values(results.PARTAI);
    var hasil = Object.values(results.HASIL);
    if (req.xhr) {
      return res.json({
        hasil: results.HASIL.table["3303"],
        partai: partai,
        data: results
      })
    }
    var sortable = [];
    var keysSorted = (Object.keys(results.HASIL.table["3303"]).sort(function(a, b) {
      return results.HASIL.table["3303"][b] - results.HASIL.table["3303"][a]
    }))
    var chair = [];
    var round = [];
    for (var i = 0; i < 9; i++) {
      chair.push(i + 1);
      round.push(i);
    }
    for (var i = 0; i < keysSorted.length; i++) {
      sortable.push({
        'key': keysSorted[i],
        'count': results.HASIL.table["3303"][keysSorted[i]],
        'chair': []
      })
    }
    var highest = sortable[0].count;
    var compared = 0;
    for (var i = 0; i < 10; i++) {
      if (i === 0) {
        compared = highest / 1;
      }
      if (i === 1) {
        compared = highest / 3;
      } else {
        compared = highest / 5;
      }
      for (var j = 0; j < sortable.length; j++) {
        var sorts = sortable[j];
        if (sorts.count >= compared && chair.length) {
          sorts.chair.push(chair.shift());
        }
      }
    }
    res.render('dapil3', {
      title: 'DAPIL',
      data: results,
      partai: partai,
      dapil: "JAWA TENGAH III",
      hasil: results.HASIL.table["3303"],
      hasil_sorted: sortable,
      numeral: numeral
    });

  });
});

module.exports = router;
