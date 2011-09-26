var express = require('express')
    , app = module.exports = express.createServer()
    , io = require('socket.io').listen(app);
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

// Routes

app.get('/', function(req, res){
  res.render('index');
});

app.post('/signup', function(req, res){
  io.sockets.in('app').emit('new-person', req.param('username'));
  res.redirect('/board');
});

app.get('/board', function(req, res){
  res.render('board');
});

io.sockets.on('connection', function (socket) {
  socket.join('app'); // our app has one channel!
  socket.on('card-moving', function (data) {
    socket.in('app').emit('server:card-moving', data);
  });
  socket.on('card-created', function(data) {
    socket.broadcast.emit('server:card-created', data);
  });
});

var port = process.env.PORT || 3000;

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
