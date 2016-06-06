// jshint devel:true
'use strict';

//jquery extension for animate.css
$.fn.extend({
  animateCss: function(animationName) {
    var animationEnd =
      'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    $(this).addClass('animated ' + animationName).one(animationEnd,
      function() {
        $(this).removeClass('animated ' + animationName);
      });
  }
});

//click button
var Clicker = Backbone.View.extend({
  // template: _.template($('#buttonTemplate').html()),
  initialize: function() {
    this.render();
  },
  events: {
    'click': 'handleClick'
  },
  handleClick: function() {
    this.model.clickIncrement();
  },
  render: function() {
    //empty the el instead of populating it with a template
    this.$el.empty();
    //because events get effed on re-render
    this.delegateEvents();

    return this;
  }
});

// buy button for click view
var BuyClickView = Backbone.View.extend({
  template: _.template(require(
    '!html!./templates/buyClickDogeTemplate.html')),
  initialize: function() {
    this.render();

    this.listenTo(this.model, 'change:clickerCost', this.render);
  },
  events: {
    "click": "handleClick"
  },
  handleClick: function() {
    this.model.buyClickDoge();
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));

    //re add events on re-render
    this.delegateEvents()
    return this;
  }
});

var UpgradeClickView = Backbone.View.extend({
  template: _.template($('#upgradeClickTemplate').html()),
  initialize: function() {
    this.render();

    //re-render on change
    this.listenTo(this.model, 'change:clickUpgradeCost', this.render);
  },
  events: {
    "click": "handleClick"
  },
  handleClick: function() {
    this.model.upgradeClick();
  },
  render: function() {
    //render template
    this.$el.html(this.template(this.model.toJSON()));

    //re delegate events in case of re-render
    this.delegateEvents();
  }
});


//buy a generator button
var GeneratorView = Backbone.View.extend({
  template: _.template($('#generatorTemplate').html()),
  initialize: function() {

    this.render();

    // re-render on change to model
    this.listenTo(this.model, 'change:generatorCost', this.render);


  },
  events: {
    "click": "handleClick"
  },
  handleClick: function() {
    this.model.buyGenerator();
  },
  render: function() {
    // render template
    this.$el.html(this.template(this.model.toJSON()));

    //re attach events if there are any
    this.delegateEvents();

    return this;
  }
});

// top pic
var DogePic = Backbone.View.extend({
  template: _.template(require('!html!./templates/dogePic.html')),
  render: function() {

    this.$el.html(this.template(this.model.toJSON()));

    this.delegateEvents();

  },
  events: {
    "click": "handleClick"
  },
  handleClick: function() {
    this.$el.find('img').animateCss('bounce');
    this.model.clickIncrement();
  },
  initialize: function() {
    this.render();

    this.listenTo(this.model,
      'change:clickDoges change:timeIncrementer change:clickIncrementer',
      this
      .bounce);

    this.listenTo(this.model, 'change:count', this.changePic);
  },
  changePic: function(obj) {
    var count = obj.attributes.count;
    if (count < 5)
      return

    if (count == 1000) {
      this.$el.find('img').attr('src', "/images/stevie.jpg");
      this.$el.find('#upgradeText').text("STEVIE UPGRADE").animateCss(
        'slideInUp');
      window.setTimeout(function() {
        $('#upgradeText').text("");
      }, 2000);


    }

  },
  bounce: function() {
    this.$el.find('img').animateCss('bounce');
  }
});

var StatsView = Backbone.View.extend({
  template: _.template(require('!html!./templates/stats.html')),
  initialize: function() {
    this.render();

    this.listenTo(this.model, 'change', this.render);
  },
  render: function() {
    //render template
    this.$el.html(this.template(this.model.toJSON()));

    this.delegateEvents();

  }
});

module.exports = {
  Clicker: Clicker,
  BuyClickView: BuyClickView,
  UpgradeClickView: UpgradeClickView,
  GeneratorView: GeneratorView,
  DogePic: DogePic,
  StatsView: StatsView
}
