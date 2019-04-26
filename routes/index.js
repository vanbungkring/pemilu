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
const PROVINSI_STATIC = require('../static/provinsi');
const PROVINSI_ID_STATIC = require('../static/provinsiid');
const numeral = require('numeral');
const async = require('async');
const SitemapGenerator = require('sitemap-generator');
/* GET home page. */
router.get('/sitemap',function(req,res){


})
router.get('/provinsi/:id', cached, baseOnProvince)
router.get('/generator', generateProvinsi);

function baseOnProvince(req, res) {
  if (PROVINSI_STATIC[req.params.id] === undefined) {
    res.redirect('/')
  }
  current_page = PROVINSI_STATIC[req.params.id]['id']
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
        request('https://pemilu2019.kpu.go.id/static/json/hhcw/ppwp/' + current_page + '.json', {
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
      if (!err) {
        key = PROVINSI_STATIC[req.params.id]['name']
        client.setex(key, 7200, JSON.stringify(results));
      }
      render2(results, current_page, req, res);
    });
}

function render2(results, current_page, req, res) {

  if (results.KP === undefined || results.KPU === undefined) {
    res.json('err');
  }
  // if (results.KP.parentIds.length === 4 && !req.query.type) {
  //   return res.redirect('/tps/summary/?child=' + req.query.child);
  // }

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
  var title = 'Nasional'
  if (results.KP.name != 'IDN') {
    title = 'Hasil Real count provinsi ' + results.KP.name;
  }
  if (req.query.type == 'json') {
    return res.json({
      title: title,
      data: results,
      kpjs1: kpjs1,
      kpjs2: kpjs2,
      total_cakupan: total_cakupan,
      hotlink: PROVINSI_ID_STATIC,
      numeral: numeral,
      params: req.query.child ? req.query.child : '',
      next: req.query.child ? req.query.child : '',
    });
  }
  res.render(template, {
    title: title,
    data: results,
    kpjs1: kpjs1,
    next: next,
    kpjs2: kpjs2,
    hotlink: PROVINSI_ID_STATIC,
    next: [current_page],
    total_cakupan: total_cakupan,
    numeral: numeral
  });
}

function generateProvinsi(req, res, next) {
  request('https://kawal-c1.appspot.com/api/c/' + current_page + '?' + new Date().getTime(), {
    json: true
  }, (err, resp, body) => {
    if (err) {
      res.json(err)
    } else {
      var array = [];
      for (var i = 0; i < body.children.length; i++) {
        var data = {};
        data.name = body.children[i][1].replace(/ /g, "-").toLowerCase();
        data.id = body.children[i][0]
        data.seo = 'Hasil Real count provinsi ' + body.children[i][1];
        array.push(data);
      }
      var result = {};
      for (var i = 0; i < array.length; i++) {
        result[array[i].id] = array[i];
      }

      //result
      console.log(result);
      res.json(result);
    }
  });
}
router.get('/tps/summary/', function(req, res) {

})

function getTPSSummary(req, res) {
  res.render('tpsDetail', {
    title: 'Detail TPS',
    numeral: numeral,
    params: req.query.child
  });
}
router.get('/', cached, getInformation);
router.get('/:id/:id', cached, getInformation);

function cached(req, res, next) {
  var key = '0'
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
      if (req.params.id) {
        return render2(JSON.parse(data), PROVINSI_STATIC[key]['id'], req, res);
      }
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
  // if (results.KP.parentIds.length === 4 && !req.query.type) {
  //   return res.redirect('/tps/summary/?child=' + req.query.child);
  // }

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
  var title = 'Nasional'
  if (results.KP.name != 'IDN') {
    title = results.KP.name;
  }
  res.render(template, {
    title: title,
    data: results,
    kpjs1: kpjs1,
    next: next,
    hotlink: PROVINSI_ID_STATIC,
    kpjs2: kpjs2,
    next: req.query.child ? JSON.parse(req.query.child) : '',
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
    KP_ONNO = 'https://pantau.kawalpilpres2019.id/api/tps-' + current_page + '.json?nocache=' + new Date().getTime()
  }
  console.log(KPU_URL);
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
      if (!err) {
        var key = '0';
        if (typeof req.query.child != 'undefined') {
          key = req.query.child
        }
        client.setex(key, 7200, JSON.stringify(results));
      }
      console.log(results);
      render(results, req, res);
    });
}
module.exports = router;
