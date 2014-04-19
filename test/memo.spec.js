var should = require('should');
var Memo = require('../lib/memo');
var Storage = require('../lib/storage');
var storage = new Storage();
var memoize = new Memo(storage);

describe('Memoize', function(){
  before(function(){
    memoize.addAssert('test', function(){
      var callback = arguments[arguments.length - 1];
      callback(null, true);
    });
    memoize.addAssert('test', function(){
      var callback = arguments[arguments.length - 1];
      setTimeout(function(){
        callback(null, true);
      }, 100);
    });
  });
  it('should run assertions with the same params only once', function(done){
    var start = Date.now();
    var rnd = 'params';
    memoize.validate('test', {rnd: rnd}, function(err){
      should.not.exist(err);
      (Date.now() - start).should.greaterThan(100);
      start = Date.now();
      memoize.validate('test', {rnd: rnd}, function(err){
        should.not.exist(err);
        (Date.now() - start).should.be.lessThan(100);
        done();
      });
    });
  });
  it('run validation again if context has changed', function(done){
    var start = Date.now();
    memoize.validate('test', {rnd: 'first param'}, function(err){
      should.not.exist(err);
      (Date.now() - start).should.greaterThan(100);
      start = Date.now();
      memoize.validate('test', {rnd: 'second param'}, function(err){
        should.not.exist(err);
        (Date.now() - start).should.be.greaterThan(100);
        done();
      });
    });
  });
  it('run validation again if params have changed', function(done){
    var start = Date.now();
    memoize.validate('test', {}, ['first param'], function(err){
      should.not.exist(err);
      (Date.now() - start).should.greaterThan(100);
      start = Date.now();
      memoize.validate('test', {}, ['second param'], function(err){
        should.not.exist(err);
        (Date.now() - start).should.be.greaterThan(100);
        done();
      });
    });
  });
  describe('Memo class public interface', function(){
    it('should have AssertionSet class methods', function(done){
      (memoize.addAssert).should.be.a.Function;
      (memoize.validate).should.be.a.Function;
      done();
    });
    it('should expose storage drop method', function(done){
      memoize.drop(function(err){
        should.not.exist(err);
        done();
      });
    });
    it('should expose storage del method', function(done){
      memoize.validate('test', {param: 1}, ['two'], function(err){
        should.not.exist(err);
        memoize.del({param: 1}, ['two'], function(err, count){
          should.not.exist(err);
          (count).should.equal(1);
          done();
        });
      });
    });
  });
  describe('Memo storage interface', function(){
    it('should throw error if storage interface lacks required methods', function(done){
      (function(){
        var testMemo = new Memo({});
      }).should.throw('Storage lacks the following methods: set,get,expire,del,drop');
      done();
    });
  });
  after(function(){
    storage.drop();
  });
});