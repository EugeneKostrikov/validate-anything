Validate anything.
=====================

Sometimes you have to check something asyncronously say
check if a user has access to a blogpost depending on something stored in database.

This library aims to help you. It stores your asyncronous validation functions and runs
them all when you need the result. If all validations passed you receive `true` in callback.
If any of validations fails you receive `false` immediately. If an error happens you get the
error and `false`.

## Install:
    npm install validate-anything

## Use:
```js
  //Creates new Memo with all defaults
  var mySet = require('validate-anything').bundle();

  function validator(userName){
    //NB! Callback is provided by validate method and should be referred to like this.
    var callback = arguments[arguments.length - 1];
    setTimeout(function(){
      callback(null, true);
    }, 1000);
  }

  mySet.addAssert('readBlogpost', validator);
  mySet.validate('readBlogpost', function(err, pass){
    //pass === true, fires after 1 second
    mySet.validate('readBlogpost', function(err, pass){
      //pass === true, fires after some milliseconds
    });
  });
```


## Shortcut:
The validate-anything module exports three constructors and a shortcut factory.
The constructors API is described below. Shortcut creates new default Storage and returns new Memo
configured to use this storage.

- **bundle** `function([prefix], [ttl], [client], [hash]){}`: All arguments are optional.
They are passed to corresponding constructors.

## AssertionContainer API:
This is the base class the system is built on.

###Methods:
- **addAssert** `function(setName, fn){}`: Registers validator scoped to assertion set
- **listAsserts** `function(setName){}`: Returns list of assertion functions for the specified set
- **validate** `function(setName, [context], [args], callback){}`: Calls each function from assertion set
passing it context and args. Note that you cannot pass different args to single set.
Use two or more sets for this case.

####More on **validate**:
- **setName** `{String}`: selects set to iterate over
- **context** `{Object}`: will be available to validation function as `this`
- **args** `{Array}`: arguments to pass to validation function
- **callback** `{function(error, boolean)}`: will be called once all functions in set finish or any of them calls back with error.
Boolean is `true` if every validation fn calls back with `true` and `false` if any of them fails or returns error.

##Memo API:
It is a wrapper around AssertionContainer class.
It decorates AssertionContainer validate method and storage del methods.

### Constructor arguments:
- **storage** `{Object}`: Object that handles memoization
- **ttl** `{Number || String}`: Timeout to expire results of validation.
In seconds if you use default storage.
Set to 'persist' to make results persistent, but be sure to handle expiration
yourself.
- **hashAlgorithm** `{String}`: What algorithm to use calculating hash for context and args. Defaults to MD5.

###Methods:
- all inherited from AssertionContainer
- **drop** `{function(callback){}`: just a bridge to storage drop method
- **del** `{function(context, args, callback)}`: calculates hash for context and args and calls storage del method

## Storage API:
Module has Redis storage out of the box.
###Constructor arguments:
- **client** `{Object}`: Redis client. If omitted new [node-redis](https://github.com/mranney/node_redis) client is created for you.
- **prefix** `{String}`: Namespaces the storage. You'd better set different prefix for every
 storage instance you have so `drop` method will not drop keys of other storage. Defaults to 'valany:'.

###Creating your own storage:
As long as you storage object corresponds to the interface you should be able to
use them interchangeably. All methods should be asyncronous.

- **get** `function(key, callback){}`: Should callback with possible error and stored result.
Memo first queries storage with hash and if it returns `null` proceeds to validation.
- **set** `function(key, value, callback){}`: Should store result.
Memo calls it with `key = hash` and `value = passed` once validation is complete without error.
- **expire** `function(key, ttl, callback){}`: Should expire result in specified ttl.
Memo calls it with `ttl` passed to the constructor or skips this step if `ttl` equals to 'persistent'.
- **del** `function(key, callback){}`: Should delete provided key.
Memo decorates it and passes `key = hash`
- **drop** `function(callback){}`: Should delete all results scoped to this storage.
Memo exposes it with no modification.


## License: MIT

