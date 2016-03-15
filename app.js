// Core Modules
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// keys and secrets
var configData = require('./config.json');
//these are pulling from my environment variables in config.json
//Heroku
process.env['CONSUMER_KEY'] = configData['consumer_key'];
process.env['CONSUMER_SECRET'] = configData['consumer_secret'];

// Routes I have created
var routes = require('./routes/index');
var home = require('./routes/home');
var getAccessToken = require('./routes/getAccessToken');
var getUserAccount = require('./routes/getUserAccount');
var createBooking = require('./routes/createBooking');
var cancelBooking = require('./routes/cancelBooking');
var intervalCheck = require('./routes/intervalCheck');
var getCarData = require('./routes/getCarData');

// instance of express
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//checks if user is signed in
if(process.env.ACCOUNT_ID) {
  console.log('It is set!');
}
else {
  //console.log('Not set!');
}


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.use('/home', home);
app.use('/getAccessToken', getAccessToken);
app.use('/getUserAccount', getUserAccount);
app.use('/createBooking', createBooking);
app.use('/cancelBooking', cancelBooking);
app.use('/intervalCheck', intervalCheck);
app.use('/getCarData', getCarData);

//activate when not using intellij
//app.listen(3000, function () {
//console.log("express has started on port 3000");
//});

//// lets the port be set up by Heroku
//var port = process.env.PORT || 3000;
//app.listen(port);

// lets the port be set up by Heroku
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
