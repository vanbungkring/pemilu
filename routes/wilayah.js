var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const redis = require('redis');
const client = redis.createClient();
var current_page = 0;
var KP = 'https://kawal-c1.appspot.com/api/c/' + current_page + '?' + new Date().getTime()
var KPU = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp.json'
var KP_ONNO = 'https://pantau.kawalpilpres2019.id/api/tps.json'
var KPU_DET = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp/' + current_page + '.json'
const request = require('request');
const PROVINSI_STATIC = require('../static/provinsi');
const PROVINSI_ID_STATIC = require('../static/provinsiid');
const numeral = require('numeral');
const async = require('async');

router.get('/:id/:hashed', getInfo);
router.get('/:id/:id2/:hashed', getInfo);
router.get('/:id/:id2/:id3/:hashed', getInfo);

function cached(req, res, next) {
  var key = req.params.hashed
  if (typeof req.query.child != 'undefined') {
    key = req.query.child
  }
  if (typeof req.params.id != 'undefined') {
    key = req.params.id
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

function getInfo(req, res) {
  jwt.verify(req.params.hashed, 'VANBUNGKRING', function(err, decoded) {
    if (!err) {
      console.log(decoded);
      // res.json(decoded.data.split(','));v
      var array = decoded.data.split(',');
      current_page = array[array.length - 1];
      var tps = array;
      var url = ''
      for (var i = 0; i < tps.length; i++) {
        if (i == tps.length - 1) {
          url = url.concat(tps[i]);
        } else {
          url = url.concat(tps[i] + '/')
        }
      }
      KPU_URL = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp/' + url + '.json'
      async.series({
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
          client.setex(req.params.hashed, 7200, JSON.stringify(results));
          render(results, req, res);
        });
    }
  })

}

function render(results, req, res) {
  var kpjs1 = 0;
  var kpjs2 = 0;
  var total_cakupan = 0;

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
  var next;
  jwt.verify(req.params.hashed, 'VANBUNGKRING', function(err, decoded) {
    next = decoded.data.split(',');
  })
  if (req.query.type == 'json') {
    return res.json({
      title: KPU,
      data: results,
      kpjs1: kpjs1,
      kpjs2: kpjs2,
      total_cakupan: total_cakupan,
      hotlink: PROVINSI_ID_STATIC,
      numeral: numeral,
      params: req.query.child ? req.query.child : '',
      next: next,
    });
  }

  var template = 'index'
  var is_tps_detail = false
  if (is_tps_detail) {
    template = 'tpsDetail';
  }
  var title = 'Nasional'
  if (results.KP.name != 'IDN') {
    title = results.KP.name;
  }
  if (req.params.id3) {
    res.render('tpssummary', {
      title: title,
      data: results,
      kpjs1: kpjs1,
      next: next,
      hotlink: PROVINSI_ID_STATIC,
      kpjs2: kpjs2,
      next: next,
      total_cakupan: total_cakupan,
      numeral: numeral
    });
  } else {
    res.render(template, {
      title: title,
      data: results,
      kpjs1: kpjs1,
      next: next,
      hotlink: PROVINSI_ID_STATIC,
      kpjs2: kpjs2,
      next: next,
      total_cakupan: total_cakupan,
      numeral: numeral
    });
  }
}

module.exports = router;