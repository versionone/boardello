var Board = Backbone.Model.extend({
		initialize: function(){
			_.bindAll(this, 'addCard') // every function that uses 'this' as the current object should be in here

			var cards = new Cards()
			this.set({cards: cards})

      Networking.bind('remote:card-created', this.addCard);
		},

		addCard: function(card){
			this.get('cards').add(card)
      return card;
		}
  })



var BoardView = Backbone.View.extend({
	tagName: 'div',
	className: 'board',

	events: {
		'click .change-title': 'changeTitle',
		'click .add-card': 'addCard'
	},

	initialize: function(){
		_.bindAll(this, 'render', 'unrender', 'changeTitle', 'titleChanged', 'addCard', 'cardAdded', 'newUser', 'renderInitialState') // every function that uses 'this' as the current object should be in here

		var model = this.model

		this.model.bind('change:title', this.titleChanged)
		this.model.get('cards').bind('add', this.cardAdded)

    Networking.bind('remote:new-user', this.newUser);
    Networking.bind('remote:initial-state', this.renderInitialState);
    Networking.bind('remote:cursor-movement', function(data) { console.log(data); });

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
    $(this.el).append('<div class="users"><div>');
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

	addCard: function(){
		var card = new Card();
    card.set({title: 'newcard'});
    this.model.addCard(card);
    Networking.trigger('card-created', card);
	},

	cardAdded: function(card){
		var cardView = new CardView({
			model: card
		})
		$(this.el).append(cardView.render().el)
	},

  newUser: function(name) {
    this.$('.users').append('<div class="user">' + name + '</div>');
  }
})
