'use strict';

const Q = require('q');
const Memcached = require('memcached');

let Cache = function(options) {
  if(!options) {
    options = {};
  }

  options.address = process.env.MEMCACHE_PORT_11211_TCP_ADDR || options.address || 'localhost';
  options.port = process.env.MEMCACHE_PORT_11211_TCP_PORT || options.port || 11211;

  let self = {};

  Object.keys(options).forEach(function(key){
    self[key] = options[key];
  });

  self.memcached = new Memcached(options.address + ':' + options.port);

  function reset(options) {
    if(!options) {
      options = {};
    }
    self.defaultCacheLifetimeInSeconds = options.defaultCacheLifetimeInSeconds || 60;
    self.namespacePrefix = options.namespacePrefix || 'nodebjectify';
  }

  function getCacheName(key) {
    if(self.namespacePrefix) {
      return self.namespacePrefix+'_'+key;
    }
    else {
      return key;
    }
  }

  function set(key, value, lifetime) {
    //console.log('Cache.set', key, value);
    lifetime = lifetime || self.defaultCacheLifetimeInSeconds;
    var deferred = Q.defer();
    self.memcached.set(getCacheName(key), value, lifetime, function (err) {
      //console.log('put to cache', cacheName, value, lifetime);
      if(err) {
        deferred.reject(new Error(err));
      }
      else {
        deferred.resolve('OK');
      }
    });
    return deferred.promise;
  }

  function get(key) {
    if(!key) {
      console.log('trying to call get on cache with key :', key);
    }
    var deferred = Q.defer();
    self.memcached.get(getCacheName(key), function (err, data) {
      //console.log('Cache.get', key, err, data);
      if(err) {
        console.log(err);
        deferred.reject(new Error(err));
      }
      else {
        deferred.resolve(data);
      }
    });
    return deferred.promise;
  }

  function del(key) {
    if(!key) {
      console.log('trying to call del on cache with key :', key);
    }
    var deferred = Q.defer();
    self.memcached.del(getCacheName(key), function (err, data) {
      if(err) {
        console.log(err);
        deferred.reject(new Error(err));
      }
      else {
        deferred.resolve(data);
      }
    });
    return deferred.promise;
  }

  self.reset = reset;
  self.getCacheName = getCacheName;
  self.get = get;
  self.set = set;
  self.del = del;

  reset(options);

  return self;
};

Cache.instance = null;
function getInstance(options) {
  if(!Cache.instance) {
    Cache.instance = new Cache(options);
  }
  return Cache.instance;
}

module.exports = exports = getInstance;
