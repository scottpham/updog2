var Dogs = Backbone.Model.extend({
  fetch: function() {
    console.log("fetched");
    this.set(JSON.parse(localStorage.getItem(this.id)));
  },
  save: function() {
    console.log("saved");
    localStorage.setItem(this.id, JSON.stringify(this.toJSON()));
  },
  defaults: function() {
    return {
      timeIncrementer: 1,
      clickDoges: 0,
      clickIncrementer: 1,
      count: 0,
      clickerCost: 5,
      generatorCost: 50,
      dps: 0,
      generators: 0,
      clickUpgradeCost: 100,
      upgrade: ''
    }
  },
  autoClicker: {},
  autoGenerator: {},
  buyGenerator: function() {
    var dogs = this.get('count');
    var cost = this.get('generatorCost');
    //dump out if cost is too much
    if (dogs < cost) {
      alert('Not enough Doges');
      return;
    } else {
      //take the doges
      this.set('count', dogs - cost);

      //increment click doge count
      var newCount = this.get('generators') + 1;

      //set new click doge value
      this.set({
        "generators": newCount
      });

      //fire off new incrementer
      this.setGenerator();

      //reset the cost of click doges
      this.increaseCost('generatorCost');
    }
  },
  stopAutoClick: function() {
    try {
      window.clearInterval(this.autoClicker);
    } catch (e) {
      console.log(e);
    }
  },
  calculateDPS: function(miliseconds) {
    var dps = this.get('dps');
    var timeIncrementer = this.get('timeIncrementer');
    var clickIncrementer = this.get('clickIncrementer');
    var clickers = this.get('clickDoges');
    var generators = this.get('generators');

    var clickDps = (clickIncrementer * clickers) / 10;
    var generatorDps = (timeIncrementer * generators);

    this.set('dps', clickDps + generatorDps);

  },
  formatter: function(num) {
    //this just rounds down
    return Math.floor(num);
  },
  increaseCost: function(buyable) {
    var cost = this.get(buyable);
    var newCost = cost * (1.3);

    this.set(buyable, this.formatter(newCost));
  },
  setGenerator: function() {
    var generators = this.get('generators');
    //base interval is 1 second per generator
    var interval = 1000 / generators;

    // clear out old interval
    try {
      window.clearInterval(this.autoGenerator);
    } catch (e) {
      console.log(e);
    }


    //set interval to run local function timeIncrement
    this.autoGenerator = window.setInterval(this.timeIncrement.bind(this),
      interval);

    this.calculateDPS(interval);
  },
  setClickDoge: function() {

    var clickers = this.get('clickDoges');
    var interval = 10000 / clickers;
    // clear out old interval
    this.stopAutoClick();
    //set interval to 10 seconds
    this.autoClicker = window.setInterval(this.clickIncrement.bind(this),
      interval);

    console.log("doges are clicking every " + interval + " miliseconds");
    this.calculateDPS(interval);
  },
  //return true if user can afford the buyable
  //buyable should be a cost attribute
  checkCost: function(buyable) {
    console.log("checked cost");

    var dogs = this.get('count');
    var cost = this.get(buyable);
    //dump out if cost is too much

    if (dogs < cost) {
      alert('Not enough Doges');
      return false;
    } else {
      //take the doges
      this.set('count', dogs - cost);
      return true;
    }
  },
  buyClickDoge: function() {
    console.log("buy click doge ran");

    //check if user can afford
    if (!this.checkCost('clickerCost')) {
      return;
    }
    //increment click doge count
    var newCount = this.get('clickDoges') + 1;

    //set new click doge value
    this.set({
      "clickDoges": newCount
    });

    //fire off new incrementer
    this.setClickDoge();

    //reset the cost of click doges
    this.increaseCost('clickerCost');
  },
  timeIncrement: function() {
    console.log('time increment fired');
    var newCount = this.get('count') + this.get('timeIncrementer');

    this.set({
      'count': newCount
    });

  },
  clickIncrement: function() {
    console.log('clickIncrement fired');
    var newCount = this.get('count') + this.get('clickIncrementer');

    this.set({
      'count': newCount
    });
  },
  upgradeClick: function() {
    //check if user can afford
    if (!this.checkCost('clickUpgradeCost')) {
      return;
    }

    console.log("click upgraded");

    //increase click incrementer
    var increment = this.get('clickIncrementer');
    this.set('clickIncrementer', increment + 1);

    //increase the cost of this item
    this.increaseCost('clickUpgradeCost');

    this.calculateDPS();
  },
  initialize: function() {

    // get data from localStorage
    this.fetch();
    var that = this;
    // save to storage
    window.setInterval(function() {
      that.save();
    }, 60000);
    // events for upgrade
    this.on('change:count', function(model, count) {
      var currentUpgrade = this.get('upgrade');
      // triggers event on 1000
      if (currentUpgrade != 'stevie' && count > 1000) {
        this.set('upgrade', 'stevie');
        Backbone.trigger('upgrade:stevie', this);
      }
    });
  }

});

module.exports = {
  Dogs: Dogs
};
