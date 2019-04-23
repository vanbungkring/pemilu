var express = require('express');
var router = express.Router();
const redis = require('redis');
const client = redis.createClient();
var current_page = 0;
var KP = 'https://kawal-c1.appspot.com/api/c/' + current_page + '?' + new Date().getTime()
var KPU = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp.json'
var KPU_DET = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp/' + current_page + '.json'
const request = require('request');
const numeral = require('numeral');
const async = require('async');
/* GET home page. */
router.get('/', cached, getInformation);

function cached(req, res, next) {
  client.get(current_page, function(err, data) {
    if (err) {
      next();
    };
    if (data != null) {
      return render(JSON.parse(data), res)
    } else {
      next();
    }
  });
}

function render(results, res) {
  var kpjs1 = 0;
  var kpjs2 = 0;
  var total_cakupan = 0;
  for (var i = 0, len = results.KP.children.length; i < len; i++) {
    total_cakupan = total_cakupan + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['cakupan'])
    kpjs1 = kpjs1 + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['pas1'])
    kpjs2 = kpjs1 + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['pas2'])

  }
  res.render('index', {
    title: KPU,
    data: results,
    kpjs1: kpjs1,
    kpjs2: kpjs2,
    total_cakupan: total_cakupan,
    numeral: numeral
  });
}

function getInformation(req, res) {
  current_page = req.params.id ? req.params.id : 0;
  var KPU_URL = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp.json'
  async.parallel({
      KP: function(callback) {
        request('https://kawal-c1.appspot.com/api/c/' + current_page + '?' + new Date().getTime(), {
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
        request(KPU_URL, {
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
    },
    function(err, results) {
      client.setex(current_page, 40, JSON.stringify(results));
      render(results, res);
    });
}
module.exports = router;
