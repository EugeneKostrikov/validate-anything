var client = require('redis').createClient();

module.exports = {
  set: function(key, value, callback){
    client.set(key, value, function(err){
      callback(err);
    });
  },
  get: function(key, callback){
    client.get(key, function(err, value){
      callback(err, JSON.parse(value));
    });
  },
  expire: function(key, ttl, callback){
    client.expire(key, ttl, function(err){
      callback(err);
    });
  },
  del: function(key, callback){
    client.del(key, function(err){
      callback(err);
    });
  }
};