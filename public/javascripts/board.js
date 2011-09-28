var Board = Backbone.Model.extend({
  defaults: {
    top: 0,
    left: 0
  },

  initialize: function(){
    var model = this;
		_.bindAll(this, 'addCard', 'clear', 'addUser', 'remoteInitialize');
    if (!model.id) model.set({id: 1 + Math.random() * 100000000000000000})

		model.set({ cards: new Cards(), users: new Users(), boards: new Boards() });

    Networking
      .bind('remote:initial-state', model.remoteInitialize)
      .bind('remote:new-user', model.addUser)
      .bind('remote:clear-board', function() { model.clear(true); })
      .bind('remote:card-created', function(card){ model.addCard(card, true) })

    model.get('cards')
      .bind('reset', function(collection, options){
        if (!options.remote)
          Networking.trigger('clear-board', model.toJSON());
      })
      .bind('add', function(card, collection, options){
        if (!options.remote)
          Networking.trigger('card-created', card.toJSON());
      })
      .bind('convertToBoard', function(card, collection, options) {
        var board = new Board({
          left: card.get('left'),
          top: card.get('top'),
          title: card.get('title')
        });

        model.get('boards').add(board);

        var movingCard = collection.get(options.cardId);
        var movingCardCopy = movingCard.clone();
        board.addCard(movingCardCopy);
        movingCard.delete();

        card.delete();
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

	clear: function(remote) {
		this.get('cards').reset([], { remote: remote })
	},

  addUser: function(user, remote){
    var users = this.get('users');
    users.add(user, { remote: remote });
    return user;
  }
});

var Boards = Backbone.Collection.extend({
  model: Board
});

var BoardView = Backbone.View.extend({
	tagName: 'div',
	className: 'board',

	events: {
		'dblclick': 'addCard',
		'click .clear': 'clear'
	},

	initialize: function(){
		_.bindAll(this, 'render', 'addCard', 'cardAdded', 'userAdded', 'clear', 'boardAdded', 'isNested')

		var model = this.model
      , cards = model.get('cards')
      , users = model.get('users')
      , boards = model.get('boards');

		cards
      .bind('add', this.cardAdded)
		  .bind('reset', this.render);

		users.bind('add', this.userAdded)

    boards.bind('add', this.boardAdded)
	},

	render: function(){
    //wtf is this doing here??
		_.each(this.model.get('users').models, this.userAdded);

    var $el = $(this.el)
      , model = this.model
      , view = this;

    if (view.isNested()) {
      $el
        .data('id', model.id)
        .css({
          left: model.get('left'),
          top: model.get('top')
        })
        .draggable({
          start: function(){
            //return model.grab();
          },
          drag: function(event, ui){
            //model.move(ui.position.left, ui.position.top);
          },
          stop: function() {
            //model.letGo()
          },
          grid: [10,10]
        })
        .droppable({
          drop: function(event, ui){
            //var $dropped = ui.draggable;
            //model.convertToBoard($dropped.data().id)
          }
        });
      }

		return this
	},

	addCard: function(e){
		var card = new Card();
    var left = this.findNearestGridCoordinate(e.clientX, 10);
    var top = this.findNearestGridCoordinate(e.clientY, 10);
    card.set({title: 'newcard', left: left, top: top});
    this.model.addCard(card);
	},

	cardAdded: function(card){
    if (this.isNested()) return;
		var cardView = new CardView({ model: card });
		$(this.el).append(cardView.el)
    cardView.render();
	},

	userAdded: function(user){
    if (this.isNested()) return;
		var userView = new UserView({ model: user });
		$(this.el).append(userView.el);
    userView.render();
	},

  clear: function(){
		if (confirm('are you sure?')) {
			this.model.clear();
  	}
  },

  boardAdded: function(board) {
    if (this.isNested()) return;
    var boardView = new BoardView({ model: board });
    $(this.el).append(boardView.el)
    boardView.render();
  },

  findNearestGridCoordinate: function(position, gridSize) {
    if (position % gridSize === 0) return position;
    if (position % gridSize < gridSize / 2) return position - (position % gridSize);
    return position + (gridSize - position % gridSize);
  },

  isNested: function(){
    return !!this.model.collection;
  }
});
