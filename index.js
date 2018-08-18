/*
* Primary file for the API
* Author: Charmie Q
*
*/

// Dependencies
var http = require('http'),
    https = require('https'),
    url = require('url'),
    StringDecoder = require('string_decoder').StringDecoder,
    config = require('./config'),
    fs = require('fs');

// Instantiate the HTTP server
var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});

// start the http server
httpServer.listen(config.httpPort, function() {
  console.log("The server is listening to port " + config.httpPort);
});

// Instantiate the HTTPS server
var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});

// start the https server
httpsServer.listen(config.httpsPort, function() {
  console.log("The server is listening to port " + config.httpsPort);
});

// Unified server to handle http and https

var unifiedServer = function(req, res) {

  // get the url and parse it
  var parsedUrl = url.parse(req.url, true);

  // get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // get the query string as an object
  var queryStringObject = parsedUrl.query;

  // get the http method
  var method = req.method.toLowerCase();

  // Get the headers as an object
  var headers = req.headers;

  // get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function() {
    buffer += decoder.end();

    // choose the handler this request should go to. If none is found then use notfound handler
    var chooseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler

    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };

    // Route the request to the handler specified in the router
    chooseHandler(data, function(statusCode, payload) {
      // Use the status code called back by the handler or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload called back by the handler or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert payload to a string
      var payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the return response
      console.log('Return response', statusCode, payloadString);
    });
  });
}

// Define the handlers
var handlers = {};

// ping handler
handlers.ping = function(data, callback) {
  callback(200);
};

// handler to send a 'hello world' message
handlers.sayhi = function(data, callback) {
  var message = {};
  if(data.method == 'post') {
    message.say = 'Hello World!';
    callback(200, message);
  } else {
    message.say = 'Not using the correct method for this';
    callback(404, message);
  }
};

// not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};

// Define a request router
var router = {
  'ping' : handlers.ping,
  'hello': handlers.sayhi
};


