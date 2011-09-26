var Networking = (function() {

  var module = {};

  var clientId = 1 + Math.random() * 100000000000000000;

  _.extend(module, Backbone.Events);

  var url = window.location.origin
      , socket = io.connect(url);

  function sendMessage(topic, data) {
    data = data || {};
    data.clientId = clientId;
    socket.emit(topic, data);
  }

  // private methods
  function sendCardGrabbed (id, user) {
    sendMessage('card-grabbed', {id: id, user: user});
  }

  function sendCardLetGo (id) {
    sendMessage('card-letgo', {id: id});
  }

  function sendCardMoving (id, x, y) {
    sendMessage('card-moving', {id: id, x: x, y: y});
  }

  function sendCardCreated () {
    sendMessage('card-created');
  }

  function sendCardDestroyed(id) {
    sendMessage('card-destroyed', {id: id});
  }

  module.bind('card-grabbed', sendCardGrabbed);
  module.bind('card-letgo', sendCardLetGo);
  module.bind('card-moving', sendCardMoving);
  module.bind('card-created', sendCardCreated);
  module.bind('card-destroyed', sendCardDestroyed);

  function triggerEvent(topic, data) {
    if (data.clientId === clientId) return;
    module.trigger(topic, data);
  }

  socket.on('server:card-moving', function (data) {
    triggerEvent('card-moved', data);
  });

  socket.on('server:new-person', function(data) {
    triggerEvent('user-joined', data);
  });

  socket.on('server:card-created', function(data) {
    triggerEvent('card-created', data);
  });

  return module;

})();
