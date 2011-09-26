var Board = Backbone.Model.extend({
		initialize: function(){
			_.bindAll(this, 'addCard') // every function that uses 'this' as the current object should be in here

			var cards = new Cards()
			this.set({cards: cards})
		},

		addCard: function(title){
			var card = new Card()
			card.set({title: title})
			this.get('cards').add(card)

			Networking.trigger('card-created', card)
		}
	})



var BoardView = Backbone.View.extend({
	tagName: 'table',
	className: 'board',
	
	events: {
		'click .change-title': 'changeTitle',
		'click .add-card': 'addCard'
	},

	initialize: function(){
		_.bindAll(this, 'render', 'unrender', 'changeTitle', 'titleChanged', 'addCard', 'cardAdded') // every function that uses 'this' as the current object should be in here

		this.model.bind('change:title', this.titleChanged)
		this.model.get('cards').bind('add', this.cardAdded)
		//this.model.bind('change', this.render)
		//this.model.bind('remove', this.unrender)
		this.render()
	},
	
	render: function(){
		$(this.el).html('<table class="board"><tr><td><span class="title">'+this.model.get('title')+'</span><button class="change-title">change title</button><button class="add-card">add card</button></td></tr><tr><td class="cards"></td></tr></table')
		$('body').append(this.el)
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
		this.model.addCard('new card')
	},

	cardAdded: function(card){
		var cardView = new CardView({
			model: card
		})
		$(this.el).append(cardView.render().el)
	}
})
