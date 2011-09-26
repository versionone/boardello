var Cards = Backbone.Collection.extend({
    model: Card,

  });

//http://stackoverflow.com/questions/6416958/how-to-make-backbone-js-collection-items-unique
Cards.prototype.add = function(card) {
	debugger
  var isDupe = this.any(function(_card) { 
  	debugger
      return _card.id === card.id;
  })
  if (isDupe) {
      //Up to you either return false or throw an exception or silently ignore
      return false;
  }
  Backbone.Collection.prototype.add.call(this, card);
}