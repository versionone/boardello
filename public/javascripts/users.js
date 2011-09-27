var User = Backbone.Model.extend({
  defaults: {
    name: ''
  }
})

var Users = Backbone.Collection.extend({
  model: User
});

var UserView = Backbone.View.extend({

	tagName: 'div',
	className: 'user',

  render: function() {
    $el = $(this.el);
    $el.html(this.model.get('name'));
    return this;
  }

});
