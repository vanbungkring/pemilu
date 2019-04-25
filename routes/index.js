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

router.get('/tps/summary/', getTPSSummary)

function getTPSSummary(req, res) {
  res.render('tpsDetail', {
    title: 'Detail TPS',
    numeral: numeral,
    params: req.query.child
  });
}
router.get('/', getInformation);

function cached(req, res, next) {
  var key = '0'
  if (typeof req.query.child != 'undefined') {
    key = req.query.child
  }
  client.get(key, function(err, data) {
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

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

function render(results, req, res, next) {
  if (results.KP === undefined || results.KPU === undefined) {
    res.json('err');
  }
  if (results.KP.parentIds.length === 4 && !req.query.type) {
    return res.redirect('/tps/summary/?child=' + req.query.child);
  }

  var kpjs1 = 0;
  var kpjs2 = 0;
  var total_cakupan = 0;

  var kp_onno_cakupan = 0;
  var kp_onno_pas1 = 0;
  var kp_onno_pas2 = 0;

  for (var i = 0, len = Object.values(results.KP_ONNO).length; i < len; i++) {
    kp_onno_cakupan = kp_onno_cakupan + parseInt(Object.values(results.KP_ONNO)[i]['tps_masuk'])
    kp_onno_pas1 = kp_onno_pas1 + parseInt(Object.values(results.KP_ONNO)[i]['jokowi_amin'])
    kp_onno_pas2 = kp_onno_pas2 + parseInt(Object.values(results.KP_ONNO)[i]['prabowo_sandi'])
  }
  for (var i = 0, len = results.KP.children.length; i < len; i++) {

    if (results.KP.data[results.KP.children[i][0]] != undefined && results.KP.data[results.KP.children[i][0]]['sum']['cakupan'] != undefined) {
      total_cakupan = total_cakupan + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['cakupan'])
    }
    if (results.KP.data[results.KP.children[i][0]] != undefined && results.KP.data[results.KP.children[i][0]]['sum']['pas1'] != undefined) {
      kpjs1 = kpjs1 + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['pas1'])
    }
    if (results.KP.data[results.KP.children[i][0]] != undefined && results.KP.data[results.KP.children[i][0]]['sum']['pas2'] != undefined) {
      kpjs2 = kpjs2 + parseInt(results.KP.data[results.KP.children[i][0]]['sum']['pas2'])
    }
  }

  if (req.query.type == 'json') {
    return res.json({
      title: KPU,
      data: results,
      kpjs1: kpjs1,
      kpp1: kp_onno_pas1,
      kpp2: kp_onno_pas2,
      kppcakupan: kp_onno_cakupan,
      kpjs2: kpjs2,
      total_cakupan: total_cakupan,
      numeral: numeral,
      next: req.query.child ? req.query.child : '',
    });
  }
  var next;
  var template = 'index'
  var is_tps_detail = false
  if (typeof req.query.child != 'undefined') {
    next = JSON.parse(req.query.child).join();
    if (JSON.parse(req.query.child).length === 4) {
      is_tps_detail = true;
    }
  }
  if (is_tps_detail) {
    template = 'tpsDetail';
  }
  res.render(template, {
    title: 'Detail TPS',
    data: results,
    kpjs1: kpjs1,
    kpp1: kp_onno_pas1,
    next: next,
    kpp2: kp_onno_pas2,
    kppcakupan: kp_onno_cakupan,
    kpjs2: kpjs2,
    total_cakupan: total_cakupan,
    numeral: numeral
  });

}

function getInformation(req, res) {
  var KPU_URL = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp.json'
  current_page = 0;
  if (req.query.child) {
    current_page = JSON.parse(req.query.child)[JSON.parse(req.query.child).length - 1];
    var tps = JSON.parse(req.query.child);
    var url = ''
    for (var i = 0; i < tps.length; i++) {
      if (i == tps.length - 1) {
        url = url.concat(tps[i]);
      } else {
        url = url.concat(tps[i] + '/')
      }
    }
    KPU_URL = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp/' + url + '.json'
    //  https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp/1/1492.json
    KP_ONNO = 'https://pantau.kawalpilpres2019.id/api/tps-' + current_page + '.json?nocache=' + new Date().getTime()
  }
  console.log(KPU_URL);
  async.parallel({
      KP: function(callback) {
        request('https://kawal-c1.appspot.com/api/c/' + current_page + '?' + new Date().getTime(), {
          json: true
        }, (err, res, body) => {
          if (err) {
            callback(err, null);
          } else {
            console.log(body);
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
        var key = '0';
        if (typeof req.query.child != 'undefined') {
          key = req.query.child
        }
        client.setex(key, 600, JSON.stringify(results));
      }
      console.log(results);
      render(results, req, res);
    });
}
module.exports = router;