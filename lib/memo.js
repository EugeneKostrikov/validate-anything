var crypto = require('crypto');
var util = require('util');
var Set = require('./index');

var Memo = function(storage, ttl, hashAlgo){
  validateStorage(storage);
  Set.call(this);
  this.assertionSet = new Set();
  this.storage = storage;
  this.ttl = ttl || 1000;
  this.hash = hashAlgo || 'md5';
};

util.inherits(Memo, Set);

Memo.prototype.validate = function(assertSet, context, args){
  //Make context and args optional
  var callback = arguments[arguments.length - 1];

  //Mock callback
  var _arguments = Array.prototype.slice.call(arguments);
  _arguments[_arguments.length - 1] = done;

  var that = this;
  var hash = crypto.createHash(that.hash)
    .update(inspect(context))
    .update(inspect(args))
    .digest('hex');

  that.storage.get(hash, function(err, value){
    if (err) return callback(err);
    if (value !== null) return callback(null, value);
    that.assertionSet.validate.apply(that, _arguments);
  });

  function done(err, passed){
    if (err) return callback(err);
    that.storage.set(hash, passed, function(err){
      if (err) return callback(err);
      that.storage.expire(hash, that.ttl, function(err){
        callback(err, passed);
      });
    });
  }
};

function inspect(obj){
  return util.inspect(obj, {depth: null});
}


function validateStorage(storage){
  var methods = ['set', 'get', 'expire', 'del'];
  for (var m in storage){
    if(storage.hasOwnProperty(m)){
      if (methods.indexOf(m) !== -1 && typeof storage[m] === 'function'){
        methods.splice(methods.indexOf(m), 1);
      }
    }
  }
  if (methods.length !== 0) throw new Error('Storage lacks the following methods: ' + methods);
}

module.exports = Memo;