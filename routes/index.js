var express = require('express');
var router = express.Router();
var KP = 'https://kawal-c1.appspot.com/api/c/0?' + new Date().getTime()
var KPU = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp.json?' + new Date().getTime()
const request = require('request');
const numeral = require('numeral');
const async = require('async');
/* GET home page. */
router.get('/', function(req, res, next) {

  async.parallel({
    KP: function(callback) {
      request(KP, {
        json: true
      }, (err, res, body) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, body);
        }
      });
    },
    KPU: function(callback) {
      request(KPU, {
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
  //res.json(results);
  var kpjs1=0;
  var kpjs2 =0;
  console.log(results.KP);
  for (var i = 0, len = results.KP.children.length; i < len; i++) {
    var kpjs1 = kpjs1+parseInt(results.KP.data[results.KP.children[i][0]]['sum']['pas1'])
    console.log(kpjs1);
    var kpjs2 = kpjs1+parseInt(results.KP.data[results.KP.children[i][0]]['sum']['pas2'])
    console.log(kpjs2);
  }
    res.render('index', {
      title: KPU,
      data:results,
      kpjs1:kpjs1,
      kpjs2:kpjs2,
      numeral:numeral
    });
  });

});

module.exports = router;
