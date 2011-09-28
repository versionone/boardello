var Board = Backbone.Model.extend({

    initialize: function(){
      var model = this;
			_.bindAll(this, 'addCard', 'clear', 'addUser', 'remoteInitialize'); // every function that uses 'this' as the current object should be in here
      
			model.set({cards: new Cards(), users: new Users()});

      Networking.bind('remote:new-user', model.addUser);
      Networking.bind('remote:initial-state', model.remoteInitialize);
      Networking.bind('remote:clear-board', model.clear);
      Networking.bind('remote:card-created', function(card){
       model.addCard(card, true) 
      });

      model.get('cards')
        .bind('reset', function(){
          Networking.trigger('clear-board', model.toJSON());
        })
        .bind('add', function(card, collection, options){
          if (!options.remote)
            Networking.trigger('card-created', card.toJSON());
        });

		},

    remoteInitialize: function(state) {
      var model = this;

      _.each(state.cards, function(card) {
        model.addCard(card, true);
      });
      
      _.each(state.users, function(user) {
        model.addUser(user, true);
      });
    },

		addCard: function(card, remote){
			this.get('cards').add(card, { remote: remote })
      return card;
		},

		clear: function() {
			this.get('cards').reset()
		},

    addUser: function(user, remote){
      var users = this.get('users');
      users.add(user, { remote: remote });
      return user;
    }
  });



var BoardView = Backbone.View.extend({
	tagName: 'div',
	className: 'board',

	events: {
		'dblclick': 'addCard',
		'click .clear': 'clear'
	},

	initialize: function(){
		_.bindAll(this, 'render', 'addCard', 'cardAdded', 'userAdded', 'clear')

		var model = this.model

		this.model.get('cards').bind('add', this.cardAdded)
		this.model.get('cards').bind('reset', this.render)
		this.model.get('users').bind('add', this.userAdded)
	},

	render: function(){
		$(this.el).html(render('board', this.model.toJSON()))
		_.each(this.model.get('users').models, this.userAdded);

		return this
	},

	addCard: function(e){
		var card = new Card();
    var x = this.findNearestGridCoordinate(e.clientX, 10);
    var y = this.findNearestGridCoordinate(e.clientY, 10);
    card.set({title: 'newcard', x: x, y: y});
    this.model.addCard(card);
	},

	cardAdded: function(card){
		var cardView = new CardView({ model: card });
		$(this.el).append(cardView.el)
    cardView.render();
	},

	userAdded: function(user){
		var userView = new UserView({ model: user });
		$(this.el).append(userView.el);
    userView.render();
	},

  clear: function(){
		if (confirm('are you sure?')) {
			this.model.clear();
  	}
  },

  findNearestGridCoordinate: function(position, gridSize) {
    if (position % gridSize === 0) return position;
    if (position % gridSize < gridSize / 2) return position - (position % gridSize);
    return position + (gridSize - position % gridSize);
  }
})
