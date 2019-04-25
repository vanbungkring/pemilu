var express = require('express');
var router = express.Router();
var models = require('../model/all-models');
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
router.get('/', cached, get);


function cached(req, res) {
  models.Pilpres.fin
}

function get(req, res,next) {

}

function render(req,res){

}
