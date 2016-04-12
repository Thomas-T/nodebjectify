'use strict';

const Q = require('q');
const Memcached = require('memcached');

let Cache = function(options) {
  if(!options) {
    options = {};
  }

  options.address = process.env.MEMCACHE_PORT_11211_TCP_ADDR || options.address || 'localhost';
  options.port = process.env.MEMCACHE_PORT_11211_TCP_PORT || options.port || 11211;
  options.defaultCacheLifetimeInSeconds = options.defaultCacheLifetimeInSeconds || 60;
  options.namespacePrefix = options.namespacePrefix || 'nodebjectify';

  let self = {};

  Object.keys(options).forEach(function(key){
    self[key] = options[key];
  });

  self.memcached = new Memcached(options.address + ':' + options.port);

  function getCacheName(key) {
    if(self.namespacePrefix) {
      return self.namespacePrefix+'_'+key;
    }
    else {
      return key;
    }
  }

  function set(key, value, lifetime) {
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

  self.getCacheName = getCacheName;
  self.get = get;
  self.set = set;


  return self;
};

module.exports = Cache;
