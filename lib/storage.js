var Storage = function(client, prefix){
  client = client || require('redis').createClient();
  this.client = client;
  this.prefix = prefix || 'valany:';
};

Storage.prototype.set = function(key, value, callback){
  this.client.set(this.prefix + key, value, function(err){
    callback(err);
  });
};
Storage.prototype.get = function(key, callback){
  this.client.get(this.prefix + key, function(err, value){
    callback(err, parse(value));
  });
};
Storage.prototype.expire = function(key, ttl, callback){
  this.client.expire(this.prefix + key, ttl, function(err){
    callback(err);
  });
};
Storage.prototype.del = function(key, callback){
  this.client.del(this.prefix + key, function(err, count){
    callback(err, count);
  });
};
Storage.prototype.drop = function(callback){
  var that = this;
  this.client.keys(this.prefix + '*', function(err, keys){
    var count = 0;
    keys.forEach(function(k){
      that.client.del(k, done);
    });

    function done(err){
      count++;
      if (err && callback) return callback(err);
      if (count !== keys.length) return;
      if (callback) return callback(null);
    }
  });
};

module.exports = Storage;

function parse(str){
  try{
    return JSON.parse(str);
  }catch(e){
    return str;
  }
}