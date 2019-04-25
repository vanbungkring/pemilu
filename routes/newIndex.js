var express = require('express');
var router = express.Router();
const redis = require('redis');
const client = redis.createClient();
var current_page = 0;
var KP = 'https://kawal-c1.appspot.com/api/c/' + current_page + '?' + new Date().getTime()
var KPU = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp.json'
var KP_ONNO = 'https://pantau.kawalpilpres2019.id/api/tps.json'
var KPU_DET = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp/' + current_page + '.json'
const request = require('request');
const numeral = require('numeral');
const async = require('async');
router.get('/', get);


function cached(req, res) {

}

function get(req, res, next) {
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
    if (current_page == -99) {

    }
    KP_ONNO = 'https://pantau.kawalpilpres2019.id/api/tps-' + current_page + '.json?nocache=' + new Date().getTime()
  }
  async.series({
    KP: function(callback) {
      setTimeout(function() {
        callback(null, 1);
      }, 200);

    },
    KP_ONNO: function(callback) {
      request(KP_ONNO, {
        json: true,
        strictSSL: false
      }, (err, res, body) => {
        if (err) {
          callback(err, null);
        } else {
          console.log(body);
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
  }, function(err, results) {
    res.json(results);
    // results is now equal to: {one: 1, two: 2}
  });
}

function render(req, res) {

}
module.exports = router;