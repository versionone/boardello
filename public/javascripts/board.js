var Board = Backbone.Model.extend({
  defaults: {
    top: 0,
    left: 0,
    title: 'New Board',
    grabbed: false
  },

  initialize: function(){
    var model = this;
		_.bindAll(this, 'addCard', 'clear', 'addUser', 'remoteInitialize', 'grab', 'move', 'letGo');
    if (!model.id) model.set({id: 1 + Math.random() * 100000000000000000})

		model.set({ cards: new Cards(), users: new Users(), boards: new Boards() });

    Networking
      .bind('remote:initial-state', model.remoteInitialize)
      .bind('remote:new-user', model.addUser)
      .bind('remote:clear-board', function() { model.clear(true); })
      .bind('remote:card-created', function(card){ model.addCard(card, true) })
      .bind('remote:card-converted', function(message){ 
        model.convertCardToBoard(message.convertId, message.moveId)
      })
      .bind('remote:board-moving', function(data) {
        if (data.id == model.id) {
          model.move(data.left, data.top, true)
        }
      })
      .bind('remote:board-grabbed', function(data) {
        if (data.id == model.id) {
          model.grab(true);
        }
      })
      .bind('remote:board-letgo', function(data) {
        if (data.id == model.id) {
          model.letGo(true);
        }
      });

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
        var message = { convertId: card.id, moveId: options.cardId };
        model.convertCardToBoard(message.convertId, message.moveId);
        Networking.trigger('card-converted', message);
      })
      .bind('change:left', function(_board, value, options) {
        if (!options.remote)
          Networking.trigger('board-moving', model.toJSON());
      })
      .bind('change:top', function(_board, value, options) {
        if (!options.remote)
          Networking.trigger('board-moving', model.toJSON());
      })
      .bind('change:grabbed', function(_board, value, options) {
        if (!options.remote) {
          var eventName = model.get('grabbed') ? 'board-grabbed' : 'board-letgo';
          Networking.trigger(eventName, model.toJSON());
        }
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
  },

  convertCardToBoard: function(convertId, moveId) {
    //the ids for the new card and the new board must be returned, and sent to server
    var model = this
      , cards = model.get('cards')
      , convert = cards.get(convertId)
      , move = cards.get(moveId);

    //convert to board
    var board = new Board({
      left: convert.get('left'),
      top: convert.get('top'),
      title: convert.get('title')
    });

    model.addBoard(board, true);
    convert.delete(true);

    //move dragged card to board
    var moved = new Card({
      left: move.get('left'),
      top: move.get('top'),
      title: move.get('title')
    });

    board.addCard(moved, true);
    move.delete(true);
  },

  addBoard: function(board, remote) {
    var model = this
      , boards = model.get('boards');

      boards.add(board, { remote: remote });
      return board;
  },

  grab: function(remote) {
    var grabbed = this.get('grabbed');
    if (!grabbed) this.set({grabbed: true}, { remote: remote });

    return !grabbed;
  },

  move: function(left, top, remote){
    this.set({left: left, top: top}, { remote: remote });
    if (remote) this.set({ remoteMoving: true });
  },

  letGo: function(remote) {
    this.set({grabbed: false}, { remote : remote });
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
            return model.grab();
          },
          drag: function(event, ui){
            model.move(ui.position.left, ui.position.top);
          },
          stop: function() {
            model.letGo();
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
