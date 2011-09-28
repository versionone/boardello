var express = require('express')
    , app = module.exports = express.createServer()
    , io = require('socket.io').listen(app)
    , _ = require('underscore');
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
  io.set('log level', 2)
});

// Routes

app.get('/', function(req, res){
  res.render('index');
});

app.post('/signup', function(req, res){
  var username = req.param('username');
  var id = 1 + Math.random() * 100000000000000000;
  var user = {id: id, name: username};
  users[id] = user;
  io.sockets.in('app').emit('server:new-user', user);
  req.session.user = user;
  res.redirect('/board');
});

app.get('/board', function(req, res){
  if (!req.session.user)  {
    res.redirect('/');
    return
  }
  res.render('board', { user: req.session.user});
});

var cards = {};
var users = {};

io.sockets.on('connection', function (socket) {

  socket.join('app'); // our app has one channel!

  var state = {
    cards: _.values(cards),
    users: _.values(users)
  }

  socket.emit('server:initial-state', state);

  socket.on('client:card-moving', function (card) {
    cards[card.id] = card;
    socket.broadcast.emit('server:card-moving', card);
  });

  socket.on('client:card-letgo', function(card) {
    cards[card.id] = card;
    socket.broadcast.emit('server:card-letgo', card);
  });

  socket.on('client:card-destroyed', function(card) {
    delete cards[card.id];
    socket.broadcast.emit('server:card-destroyed', card);
  });

  socket.on('client:cursor-movement', function (user) {
    users[user.id] = user;
    socket.broadcast.emit('server:cursor-movement', user);
  });

  socket.on('client:card-created', function(data) {
    cards[data.id] = data;
    socket.broadcast.emit('server:card-created', data);
  });

  socket.on('client:clear-board', function(data) {
    cards = {};
    socket.broadcast.emit('server:clear-board', data);
  });
});


var stitch  = require('stitch');

options = {
  paths : [__dirname + '/views/client'],

  compilers: {
    tmpl: function(module, filename)  {
      var source = require('fs').readFileSync(filename, 'utf8');
      source = source.replace(/\n/g, '').replace(/'/g, "\'")
      source = "module.exports = $.template('" + filename.replace(/.+\//g,'') + "', '" + source +"');";
      module._compile(source, filename);
    }
  }
}

var package = stitch.createPackage(options);

app.get('/templates', package.createServer());





var port = process.env.PORT || 3000;

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
