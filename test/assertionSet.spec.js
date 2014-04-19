var should = require('should');
var AssertionSet = require('../lib');
var testSet = new AssertionSet();

describe('AsserionsSet class', function(){
  describe('addAssert public method', function(){
    it('Should store assertion function', function(done){
      function test(){
        var callback = arguments[arguments.length - 1];
        callback(null, true);
      }
      testSet.addAssert('read', test);
      var thisSet = testSet.listAsserts('read');
      thisSet.should.be.an.Array;
      (thisSet.length).should.equal(1);
      done();
    });
    it('Should fail to add non-funciton to set', function(done){
      (function(){
        testSet.addAssert('throws', 'string');
      }).should.throw('Assert should be a function');
      (function(){
        testSet.addAssert('throws', 100500);
      }).should.throw('Assert should be a function');
      (function(){
        testSet.addAssert('throws', {});
      }).should.throw('Assert should be a function');
      (function(){
        testSet.addAssert('throws', []);
      }).should.throw('Assert should be a function');
      (function(){
        testSet.addAssert('throws', new Buffer('blahblah'));
      }).should.throw('Assert should be a function');
      (function(){
        testSet.addAssert('throws', new Date());
      }).should.throw('Assert should be a function');
      done();
    });
  });
  describe('validate public method', function(){
    it('should return true if all assertions pass', function(done){
      var newSet = new AssertionSet();
      newSet.addAssert('test', function(){
        var callback = arguments[arguments.length - 1];
        callback(null, true);
      });
      newSet.validate('test', this, [], function(err, ok){
        should.not.exist(err);
        ok.should.be.ok;
        done();
      });
    });
    it('should return false if any assertion fails', function(done){
      var newSet = new AssertionSet();
      newSet.addAssert('test', function(){
        var callback = arguments[arguments.length - 1];
        callback(null, false);
      });
      newSet.validate('test', this, [], function(err, ok){
        should.not.exist(err);
        ok.should.not.be.ok;
        done();
      });
    });
    it('should keep function scope', function(done){
      var newSet = new AssertionSet();
      var called = false;
      function callMe(){
        called = true;
      }
      function test(){
        var cb = arguments[arguments.length - 1];
        callMe();
        cb(null, true);
      }
      newSet.addAssert('test', test);
      newSet.validate('test', this, [], function(err, ok){
        should.not.exist(err);
        ok.should.be.ok;
        called.should.be.ok;
        done();
      });
    });
    it('should pass context to assertion function', function(done){
      var newSet = new AssertionSet();
      newSet.addAssert('test', function(){
        var cb = arguments[arguments.length - 1];
        cb(null, this.value);
      });
      newSet.validate('test', {value: true}, [], function(err, ok){
        should.not.exist(err);
        ok.should.be.exactly(true);
        done();
      });
    });
    it('should pass privided arguments to assertion fn', function(done){
      var newSet = new AssertionSet();
      newSet.addAssert('test', function(arg){
        var cb = arguments[arguments.length - 1];
        cb(null, arg);
      });
      newSet.validate('test', this, [true], function(err, ok){
        should.not.exist(err);
        ok.should.be.exactly(true);
        done();
      });
    });
    it('should immediately callback with error if any assert calls back with error', function(done){
      var newSet = new AssertionSet();
      newSet.addAssert('test', function(){
        var cb = arguments[arguments.length - 1];
        try{
          throwMePlease();
        }catch(e){
          cb(e);
        }
      });
      newSet.validate('test', this, [], function(err, ok){
        should.exist(err);
        ok.should.be.not.ok;
        done();
      });
    });
    it('context and args params should be optional', function(done){
      testSet.validate('read', function(err, ok){
        should.not.exist(err);
        ok.should.be.ok;
        testSet.validate('read', {}, function(err, ok){
          should.not.exist(err);
          ok.should.be.ok;
          done();
        });
      });
    });
  });
});