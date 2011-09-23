var url = window.location.protocol + '//' + window.location.hostname
var socket = io.connect(url);

socket.on('card-moved', function (data) {
//  var card = cards[data.id]
//  var currentBoundingBox = card.getBBox();
//  card.translate(data.x - currentBoundingBox.x , data.y - currentBoundingBox.y );
});

socket.on('new-person', function(data) {
  alert('say howdy to ' + data);
});


function sendCardMoved(id, x, y) {
  socket.emit('card-moved', {id: id, x: x, y: y});
}
