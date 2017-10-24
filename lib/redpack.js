
var xml2js = require('xml2js');
var md5 = require('MD5');
var request = require('request');

exports.Redpack = Redpack;
exports.sendRedpack = sendRedpack;
exports.getRedPackInfo = getRedPackInfo;

function Redpack(opts) {

  var redpack = function (opts) {
    this._paymentOptions = opts || {};
  };
  _mix(redpack.prototype, {
    send: function (opts, fn) {
      sendRedpack(this._paymentOptions, opts, fn);
    },
    getInfo: function (opts, fn) {
      getRedPackInfo(this._paymentOptions, opts, fn);
    }
  });

  return new redpack(opts);
};

function getRedPackInfo(params, opts, fn) {
  var SEND_REDPACK_URL = "https://api.mch.weixin.qq.com/mmpaymkttransfers/gethbinfo";
  var pfx = params.pfx;
  var passphrase = params.mch_id;
  var agent = params.agent;
  var partner_key = params.partner_key;

  opts.appid = params.wxappid;
  opts.mch_id = params.mch_id;
  opts.nonce_str = _generateNonceString(32);
  opts.max_value = opts.min_value = opts.total_amount;
  opts.sign = _sign(opts, partner_key);

  var body = new xml2js.Builder().buildObject({ xml: opts });

  request.post(SEND_REDPACK_URL, {
    body: body,
    pfx: pfx,
    passphrase: passphrase,
    agent: agent
  }, function (err, response, body) {
    if (err) {
      return (fn || function (err, result) { })(err);
    }
    var parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
    parser.parseString(body, fn || function (err, result) { });
  });
}

function sendRedpack(params, opts, fn) {

  var SEND_REDPACK_URL = "https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack";
  var pfx = params.pfx;
  var passphrase = params.mch_id;
  var agent = params.agent;
  var partner_key = params.partner_key;


  opts.wxappid = params.wxappid;
  opts.mch_id = params.mch_id;
  opts.nonce_str = _generateNonceString(32);
  opts.max_value = opts.min_value = opts.total_amount;
  opts.sign = _sign(opts, partner_key);

  var body = new xml2js.Builder().buildObject({ xml: opts });

  request.post(SEND_REDPACK_URL, {
    body: body,
    pfx: pfx,
    passphrase: passphrase,
    agent: agent
  }, function (err, response, body) {
    if (err) {
      return (fn || function (err, result) { })(err);
    }
    var parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
    parser.parseString(body, fn || function (err, result) { });
  });
}

var _sign = function (obj, PARTNER_KEY) {

  var querystring = Object.keys(obj).filter(function (key) {
    return obj[key] !== undefined && obj[key] !== '';
  }).sort().map(function (key) {
    return key + '=' + obj[key];
  }).join('&') + "&key=" + PARTNER_KEY;

  return md5(querystring).toUpperCase();
};

var _generateNonceString = function (length) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var maxPos = chars.length;
  var noceStr = "";
  for (var i = 0; i < (length || 32); i++) {
    noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return noceStr;
};

var _mix = function () {
  var root = arguments[0];
  if (arguments.length == 1) { return root; }
  for (var i = 1; i < arguments.length; i++) {
    for (var k in arguments[i]) {
      root[k] = arguments[i][k];
    }
  }
  return root;
};
