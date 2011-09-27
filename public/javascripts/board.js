var Board = Backbone.Model.extend({

    initialize: function(){
			_.bindAll(this, 'addCard', 'clear', 'newUser'); // every function that uses 'this' as the current object should be in here

			this.set({cards: new Cards(), users: new Users()});

      Networking.bind('remote:new-user', this.newUser);
      Networking.bind('remote:card-created', this.addCard);
		},

		addCard: function(card){
			this.get('cards').add(card)
      return card;
		},

		clear: function() {
			this.get('cards').reset()
		},

    newUser: function(userName) {
    	var user = new User()
    	user.set({name: userName})
			this.get('users').add(user)
			return user;
    }
  });



var BoardView = Backbone.View.extend({
	tagName: 'div',
	className: 'board',

	events: {
		'click .change-title': 'changeTitle',
		'dblclick': 'addCard',
		'click .clear': 'clear'
	},

	initialize: function(){
		_.bindAll(this, 'render', 'unrender', 'changeTitle', 'titleChanged', 'addCard', 'cardAdded', 'renderInitialState', 'clear', 'userAdded')

		var model = this.model

		this.model.bind('change:title', this.titleChanged)
		this.model.get('cards').bind('add', this.cardAdded)
		this.model.get('cards').bind('reset', this.render)

		this.model.get('users').bind('add', this.userAdded)

    Networking.bind('remote:initial-state', this.renderInitialState);
    Networking.bind('remote:cursor-movement', function(data) { console.log(data); });
    Networking.bind('remote:clear-board', function(data) { model.clear(); });


		this.render()
	},

  renderInitialState: function(cards) {
    var model = this.model;
    _.each(cards, function(card) {
      model.addCard(card);
    });
  },

	render: function(){
		$(this.el).html(render('board', this.model.toJSON()))
		_.each(this.model.get('users').models, this.userAdded);

		$('body').append(this.el);

    $(document).mousemove(function(e) {
      Networking.trigger('cursor-movement', { username: 'bob', x: e.pageX, y: e.pageY });
    });

		return this
	},

	unrender: function() {},

	changeTitle: function(){
		var newTitle = prompt('New Title')
		this.model.set({title : newTitle})
	},

	titleChanged: function(){
		$(this.el).find('.title').html(this.model.get('title'))
	},

	addCard: function(e){
		var card = new Card();
    card.set({title: 'newcard', x: e.clientX, y: e.clientY});
    this.model.addCard(card);
    Networking.trigger('card-created', card);
	},

	cardAdded: function(card){
		var cardView = new CardView({ model: card });
		$(this.el).append(cardView.el)
		cardView.render()
	},

	userAdded: function(user){
		var userView = new UserView({ model: user });
		this.$('.users').append(userView.el)
		userView.render()
	},

  clear: function(){
		if (confirm('are you sure?')) {
			this.model.clear();
    	Networking.trigger('clear-board', this.model.toJSON());
  	}
  }
})
