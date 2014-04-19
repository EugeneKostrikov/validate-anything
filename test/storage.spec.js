var should = require('should');
var client = require('redis').createClient();
var Storage = require('../lib/storage');
var storage = new Storage(client, 'prefix:');

describe('Default storage', function(){
  beforeEach(function(done){
    client.set('prefix:test', 'hello', function(err){
      should.not.exist(err);
      done();
    });
  });
  it('should be able to store values', function(done){
    storage.set('test', 'hello', function(err){
      should.not.exist(err);
      client.get('prefix:test', function(err, value){
        should.not.exist(err);
        value.should.equal('hello');
        done();
      });
    });
  });
  it('should be able to get values', function(done){
    storage.get('test', function(err, value){
      should.not.exist(err);
      value.should.equal('hello');
      done();
    });
  });
  it('should be able to set ttl for key', function(done){
    storage.expire('test', 1, function(err){
      should.not.exist(err);
      setTimeout(function(){
        client.get('prefix:test', function(err, value){
          should.not.exist(err);
          should.not.exist(value);
          done();
        });
      }, 1001);
    });
  });
  it('should be able to delete keys', function(done){
    storage.del('test', function(err){
      should.not.exist(err);
      client.get('prefix:test', function(err, value){
        should.not.exist(err);
        should.not.exist(value);
        done();
      });
    });
  });
  it('should be able to drop all stored keys', function(done){
    storage.drop();
    setTimeout(function(){
      client.keys('prefix:*', function(err, keys){
        should.not.exist(err);
        (keys.length).should.equal(0);
        done();
      });
    }, 200);
  });
  it('should return boolean when stores a boolean', function(done){
    storage.set('bool', true, function(err){
      should.not.exist(err);
      storage.get('bool', function(err, value){
        should.not.exist(err);
        value.should.be.a.Boolean;
        value.should.be.exactly(true);
        done();
      });
    });
  });
  after(function(){
    storage.drop();
  });
});