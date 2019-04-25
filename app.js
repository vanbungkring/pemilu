var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Sentry = require('@sentry/node');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var legislatif = require('./routes/electoral');
var visual = require('./routes/visual');
Sentry.init({ dsn: 'https://e63bdf329ff54f3693cc109a28b50587@sentry.io/1446312' });

var app = express();
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/visual', visual);
app.use('/dapil3', usersRouter);
app.use('/legislatif/', legislatif);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
