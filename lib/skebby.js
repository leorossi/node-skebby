var request = require('superagent');
var qs = require('querystring');
var parseString = require('xml2js').parseString;
var path = require('path');
var fs = require('fs');
var util = require('util');
var config = {
  secure: true,
  host: "gateway.skebby.it",
  path: '/api/send/smseasy/advanced/rest.php'
};

var Skebby = function() {
  this._config = config;
  try {
    var configFile = JSON.parse(fs.readFileSync(path.resolve('.skebby-config.json')));
  } catch (err) {
    throw new Error('.skebby-config.json not found, should be located in your project root');  
  }
  this._config.charset = configFile.charset || 'UTF-8';
  this._config.method = configFile.method || 'basic';
  this._config.test = (configFile.test) ? true : false;
  if(configFile.username && configFile.password) {
    this._config.username = configFile.username;
    this._config.password = configFile.password;
  } else {
    throw new Error('Please set username and password on .skebby-config.json');  
  }
  if(configFile.sender_number) {
    this._config.sender_number = configFile.sender_number;
  } else {
    if(configFile.sender_string) {
      this._config.sender_string = configFile.sender_string;
    } else {
      throw new Error('Please set sender_string or sender_number on .skebby-config.json');  
    }
  }
  this._recipients = [];
  this._message = "";
};
/**
 * Load the base URL, http or https based on configuration
 * @return {String} 
 */
Skebby.prototype.getBaseUrl = function() {
  var protocol = "http";
  if (this._config.secure) {
    protocol = "https";
  }
  return protocol + "://" + this._config.host;
};

/**
 * Add a recipient to the Skebby object
 * @param {String|Array} recipient Phone number without leading '+' or 00, as required by Skebby.
 */
Skebby.prototype.addRecipient = function(recipient) {
  if (util.isArray(recipient)) {
    this._recipients = this._recipients.concat(recipient);
  } else {
    this._recipients.push(recipient);  
  }
  
};

/**
 * Return all recipients
 * @return {Array} Array of Strings
 */
Skebby.prototype.getRecipients = function() {
  return this._recipients;
};

/**
 * Return message text
 * @return {String} the Message text
 */
Skebby.prototype.getMessage = function() {
  return this._message;
};

/**
 * Set SMS text 
 * @param {String} message The Message text
 */
Skebby.prototype.setMessage = function(message) {
  this._message = message;
};

/**
 * Builds the method name according to the config
 * @return {String} 
 */
Skebby.prototype.getMethod = function() {
  return this._config.method;
  
};


/**
 * Set Method 'classic' or 'basic'
 * @param {String}  methodName
 */
Skebby.prototype.setMethod = function(methodName) {
  this._config.method = string;
};

/**
 * Build the Skebby API method name
 * @return {String}
 */
Skebby.prototype._getSkebbyMethodName = function() {
  return (this._config.test ? "test_" : "") + "send_sms_" + this._config.method;
};
/**
 * Send the SMS through skebby
 * @param  {Function} callback 
 */
Skebby.prototype.send = function(callback) {
  var params = {
    method: this._getSkebbyMethodName(),
    username: this._config.username,
    password: this._config.password,
    recipients: this.getRecipients(),
    text: this.getMessage(),
    charset: this._config.charset
  };
  if(this._config.sender_number) {
    params.sender_number = this._config.sender_number
  } else {
    params.sender_string = this._config.sender_string
  }
  request
    .post(this.getBaseUrl() + this._config.path)
    .type('form')
    .send(qs.stringify(params))
    .end(function(err, res) {
      parseString(res.text, function (err, result) {
        if (err) {
          return callback(err);  
        }
        var res = result.SkebbyApi_Public_Send_SmsEasy_Advanced[params.method][0];
        if (res.status == 'success') {
          return callback(null, res);
        } else {
          var error = new Error(res.response[0].message[0]);
          error.type = res.response[0].code[0];
          return callback(error);
        }
      });
    });
};

module.exports = Skebby;
