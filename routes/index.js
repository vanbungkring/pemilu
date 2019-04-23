var express = require('express');
var router = express.Router();
const redis = require('redis');
const client = redis.createClient();
var current_page = 0;
var KP = 'https://kawal-c1.appspot.com/api/c/' + current_page + '?' + new Date().getTime()
var KPU = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp.json'
var KP_ONNO = 'https://pantau.kawalpilpres2019.id/api/tps.json?nocache=' + new Date().getTime()
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
      return render(JSON.parse(data), req, res)
    } else {
      next();
    }
  });
}

function render(results, req, res) {
  var kpjs1 = 0;
  var kpjs2 = 0;
  var total_cakupan = 0;

  var kp_onno_cakupan = 0;
  var kp_onno_pas1 = 0;
  var kp_onno_pas2 = 0;
  //console.log(Object.values(results.KP_ONNO))
  for (var i = 0, len = Object.values(results.KP_ONNO).length; i < len; i++) {
    kp_onno_cakupan = kp_onno_cakupan + parseInt(Object.values(results.KP_ONNO)[i]['tps_masuk'])
    kp_onno_pas1 = kp_onno_pas1 + parseInt(Object.values(results.KP_ONNO)[i]['jokowi_amin'])
    kp_onno_pas2 = kp_onno_pas2 + parseInt(Object.values(results.KP_ONNO)[i]['prabowo_sandi'])
  }

  for (var i = 0, len = results.KP.children.length; i < len; i++) {
    total_cakupan = total_cakupan + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['cakupan'])
    kpjs1 = kpjs1 + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['pas1'])
    kpjs2 = kpjs2 + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['pas2'])

  }
  if (req.query && req.query.type == 'json') {
    return res.json({
      title: KPU,
      data: results,
      kpjs1: kpjs1,
      kpp1: kp_onno_pas1,
      kpp2: kp_onno_pas2,
      kppcakupan: kp_onno_cakupan,
      kpjs2: kpjs2,
      total_cakupan: total_cakupan,
      numeral: numeral
    });
  }
  res.render('index', {
    title: KPU,
    data: results,
    kpjs1: kpjs1,
    kpp1: kp_onno_pas1,
    kpp2: kp_onno_pas2,
    kppcakupan: kp_onno_cakupan,
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
      KP_ONNO: function(callback) {
        request(KP_ONNO, {
          json: true,
          strictSSL: false
        }, (err, res, body) => {
          if (err) {
            //console.log(err);
            callback(err, null);
          } else {
            const obj = {};
            for (const data of body) {
              var id = data.id;
              if (data.id === "9000000") {
                id = -99
              }
              obj[id] = data;
            }
            //console.log(obj)
            callback(null, obj);
          }
        });
      },
      KPU: function(callback) {
        request(KPU_URL, {
          json: true,
          strictSSL: false
        }, (err, res, body) => {
          if (err) {
            //console.log(err);
            callback(err, null);
          } else {
            callback(null, body);
          }
        });
      }
    },
    function(err, results) {
      //console.log(results);
      if (!err) {
        client.setex(current_page, 600, JSON.stringify(results));
      }
      render(results, req, res);
    });
}
module.exports = router;