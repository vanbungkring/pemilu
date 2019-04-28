var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const redis = require('redis');
const client = redis.createClient();
var current_page;
var KP = 'https://kawal-c1.appspot.com/api/c/' + current_page + '?' + new Date().getTime()
var KPU = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp.json'
var KP_ONNO = 'https://pantau.kawalpilpres2019.id/api/tps.json'
var KPU_DET = 'https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp/' + current_page + '.json'
const request = require('request');
const PROVINSI_STATIC = require('../static/provinsi');
const PROVINSI_ID_STATIC = require('../static/provinsiid');
const numeral = require('numeral');
const async = require('async');

router.get('/:id/:id2/:hashed', getInfo);
router.get('/:id/:id2/:id3/:hashed',cached, getInfo);

function cached(req, res, next) {
  var key = req.params.hashed
  client.get(key, function(err, data) {
    if (err) {
      next();
    };
    if (data != null) {
      var page;
      jwt.verify(req.params.hashed, 'VANBUNGKRING', function(err, decoded) {
        if (!err) {
          page = decoded.data.split(',')
          console.log(data);
          page = data
        }
      })
      return render(JSON.parse(data),page, req, res)
    } else {
      next();
    }
  });
}

function getInfo(req, res) {
  var data;
  jwt.verify(req.params.hashed, 'VANBUNGKRING', function(err, decoded) {
    if (!err) {
      data = decoded.data.split(',')
      console.log(data);
      current_page = data
    }
  })
  var url = ''
  for (var i = 0; i < data.length; i++) {
    if (i == data.length - 1) {
      url = url.concat(data[i]);
    } else {
      url = url.concat(data[i] + '/')
    }
  }
  async.series({
      KP: function(callback) {
        request('https://kawal-c1.appspot.com/api/c/' + req.params.id + '?' + new Date().getTime(), {
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
        request('https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp/' + url + '.json', {
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

      if (req.query.type && req.query.type === 'json') {
        return res.json({
          title: 'Rekapitulasi TPS nomor' + req.params.id2 + ' daerah ' + results.KP.name,
          data: results,
          next: data,
          tps_kp: req.params.id2,
          tps_hash:"https://pemilu2019.kpu.go.id/img/c/"+req.params.id3.substring(0,3)+'/'+req.params.id3.substring(3,6)+'/'+req.params.id3,
          hotlink: PROVINSI_ID_STATIC
        })
      }
      if (!err) {
        client.setex(req.params.hashed, 3600, JSON.stringify(results));
      }

      render(results,data,req,res);

      // if (!err) {
      //   key = PROVINSI_STATIC[req.params.id]['name']
      //   client.setex(key, 7200, JSON.stringify(results));
      // }
      // render2(results, current_page, req, res);
    });

}
function render(results,data,req,res){
  res.render('superdetailtps', {
    title: 'Rekapitulasi TPS nomor ' + req.params.id2 + ' daerah ' + results.KP.name,
    data: results,
    tps_kp: req.params.id2,
    tps_hash:"https://pemilu2019.kpu.go.id/img/c/"+req.params.id3.substring(0,3)+'/'+req.params.id3.substring(3,6)+'/'+req.params.id3,
    next: data,
    hotlink: PROVINSI_ID_STATIC
  })
}
module.exports = router;
