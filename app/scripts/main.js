// jshint devel:true
'use strict';
window.App = window.App || {};

//import scripts
App.Dogs = require('./model.js').Dogs;
App.Views = require('./Views.js');

//main app view
App.MainView = Backbone.View.extend({
  el: $('#backboneEl'),
  template: _.template($('#template').html()),
  initialize: function() {
    this.render();

    //clicker buying button
    this.buyClick = new App.Views.BuyClickView({
      el: $('#buyClickDoge'),
      model: this.model
    });

    //doge pic and button
    this.dogePic = new App.Views.DogePic({
      el: $('#dogepicContainer'),
      model: this.model
    });

    //button to buy generators
    this.generatorView = new App.Views.GeneratorView({
      el: $('#dogeGenerator'),
      model: this.model
    });

    this.stats = new App.Views.StatsView({
      el: $('#stats'),
      model: this.model
    });

    this.upgradeClick = new App.Views.UpgradeClickView({
      el: $('#upgradeClick'),
      model: this.model
    });

    this.upgradeAlert = new App.Views.UpgradeView({
      el: $('#upgradeContainer'),
      model: this.model
    });

  },
  render: function() {
    //render template
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});



$(document).ready(function() {

  console.log("doc loaded");

  App.dogs = new App.Dogs();

  // run the view and insert the model
  App.main = new App.MainView({
    model: App.dogs
  });

});
