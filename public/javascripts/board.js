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
        model.convertCardToBoard(message.convertId, message.moveId, message.board)
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
      })
      .bind('remote:card-transfered', function(data){
        model.get('cards').get(data.cardId).delete(true);
        model.get('boards').get(data.boardId).addCard(data.card, true);
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
        message.board = model.convertCardToBoard(message.convertId, message.moveId).toJSON();
        Networking.trigger('card-converted', message);
      });

    model.get('boards')
      .bind('card-transfered', function(board, collection, options) {
        //TODO move to a model method....
        var cards = model.get('cards')
          , transfer = cards.get(options.cardId)

        var transfered = new Card({
          left: transfer.get('left'),
          top: transfer.get('top'),
          title: transfer.get('title')
        });

        board.addCard(transfered, true);
        transfer.delete(true);
        
        var message = { boardId: board.id, cardId: transfer.id, card: transfered.toJSON() };
        Networking.trigger('card-transfered', message);

      })
      .bind('board-transfered', function(board, collection, options) {
        // var boards = model.get('boards')
        //   , transfer = boards.get(options.boardId)

        // var transfered = new Board({
        //   left: transfer.get('left'),
        //   top: transfer.get('top'),
        //   title: transfer.get('title')
        // });

        // board.get('boards').add(transfered);
        // transfer.delete();
      })

    model
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

    _.each(state.boards, function(board) {
      model.addBoard(board, true);
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

  convertCardToBoard: function(convertId, moveId, board) {
    var model = this
      , cards = model.get('cards')
      , convert = cards.get(convertId)
      , move = cards.get(moveId);

    //convert to board
    var boardId = board ? board.id : null;
    var converted = new Board({
      id: boardId,
      left: convert.get('left'),
      top: convert.get('top'),
      title: convert.get('title')
    });

    model.addBoard(converted, true);
    convert.delete(true);

    //move dragged card to board
    var moved = new Card({
      left: move.get('left'),
      top: move.get('top'),
      title: move.get('title')
    });

    converted.addCard(moved, true);
    move.delete(true);

    return converted;
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
  },

  transferCard: function(cardId) {
    this.trigger('card-transfered', this, this.collection, { cardId: cardId });
  },

  transferBoard: function(boardId) {
    this.trigger('board-transfered', this, this.collection, { boardId: boardId });
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

		var view = this
      , model = view.model
      , cards = model.get('cards')
      , users = model.get('users')
      , boards = model.get('boards');

    model
      .bind('change:top', view.render)
      .bind('change:left', view.render);

		cards
      .bind('add', view.cardAdded)
		  .bind('reset', view.render);

		users.bind('add', view.userAdded)

    boards.bind('add', view.boardAdded)
	},

	render: function(){
    //wtf is this doing here??
		_.each(this.model.get('users').models, this.userAdded);

    var $el = $(this.el)
      , model = this.model
      , view = this;

    if (view.isNested()) {
      $el
        .html('<div class="title">'+model.get('title')+'</title>')
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
            var $dropped = ui.draggable
              , itemId = $dropped.data().id;

            if ($dropped.is('.card')) model.transferCard(itemId);
            if ($dropped.is('.board')) model.transferBoard(itemId);
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
