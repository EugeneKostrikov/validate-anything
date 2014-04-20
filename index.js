var Storage = require('./lib/storage');
var Memo = require('./lib/memo');
var Container = require('./lib');
module.exports = {
  Container: Container,
  Memo: Memo,
  Storage: Storage,
  bundle: function(prefix, ttl, client, hash){
    var storage;
    if (client){
      storage = new Storage(client, prefix);
    }else{
      storage = new Storage(prefix);
    }
    return new Memo(storage, ttl, hash);
  }
};