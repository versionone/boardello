var Networking = (function() {

  var module = {};

  _.extend(module, Backbone.Events);

  var url = window.location.origin
      , socket = io.connect(url);

  // private methods
  function sendCardGrabbed (id, user) {
    socket.emit('card-grabbed', {id: id, user: user});
  }

  function sendCardLetGo (id) {
    socket.emit('card-letgo', {id: id});
  }

  function sendCardMoving (id, x, y) {
    socket.emit('card-moving', {id: id, x: x, y: y});
  }

  function sendCardCreated () {
    console.log('sending card-created')
    socket.emit('card-created');
  }

  function sendCardDestroyed(id) {
    socket.emit('card-destroyed', {id: id});
  }

  module.bind('card-grabbed', module.sendCardGrabbed);
  module.bind('card-letgo', module.sendCardLetGo);
  module.bind('card-moving', module.sendCardMoving);
  module.bind('card-created', module.sendCardCreated);
  module.bind('card-destroyed', module.sendCardDestroyed);

  socket.on('server/card-moving', function (data) {
    module.trigger('card-moved', data);
  });

  socket.on('server/new-person', function(data) {
    module.trigger('user-joined', data);
  });

  return module;

})();
