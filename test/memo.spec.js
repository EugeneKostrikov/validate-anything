var should = require('should');
var Memo = require('../lib/memo');
var storage = require('../lib/storage');
var memoize = new Memo(storage, 10000);
//memoize.set('timeout', 60 * 1000);

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
    var rnd = Math.random();
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
    memoize.validate('test', {rnd: Math.random()}, function(err){
      should.not.exist(err);
      (Date.now() - start).should.greaterThan(100);
      start = Date.now();
      memoize.validate('test', {rnd: Math.random()}, function(err){
        should.not.exist(err);
        (Date.now() - start).should.be.greaterThan(100);
        done();
      });
    });
  });
  it('run validation again if params have changed', function(done){
    var start = Date.now();
    memoize.validate('test', {}, [Math.random()], function(err){
      should.not.exist(err);
      (Date.now() - start).should.greaterThan(100);
      start = Date.now();
      memoize.validate('test', {}, [Math.random()], function(err){
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
  });
  describe('Memo storage interface', function(){
    it('should throw error if storage interface lacks required methods', function(done){
      (function(){
        var testMemo = new Memo({});
      }).should.throw('Storage lacks the following methods: set,get,expire,del');
      done();
    });
  });
});