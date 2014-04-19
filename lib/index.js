//Define storage class
//Define check methods

var AssertionSet = function(){
  this._sets = {};
};

AssertionSet.prototype.addAssert = function(assertSet, fn){
  //ensure fn has a callback as last argument
  if (typeof fn !== 'function') throw new Error('Assert should be a function');
  //instantiate set
  if (!this._sets[assertSet]) this._sets[assertSet] = [];
  //push fn to array

  this._sets[assertSet].push(fn);
};

AssertionSet.prototype.listAsserts = function(assertSet){
  return this._sets[assertSet];
};

AssertionSet.prototype.validate = function(assertSet, context, args, callback){
  var assertionsSet = this._sets[assertSet];
  var results = [];
  args.push(done);
  assertionsSet.forEach(function(fn){
    fn.apply(context, args);
  });

  function done(err, ok){
    if (err) return callback(err, false);
    results.push(ok);
    if (results.length !== assertionsSet.length) return;
    var passed = results.every(function(elt){
      return elt === true;
    });
    callback(null, passed);
  }
};

module.exports = AssertionSet;