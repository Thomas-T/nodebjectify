'use strict';

function Nodebjectify(options) {
  options = options || { cache: {}, datastore: {}};

  options.cache.address = options.cache.address || 'localhost';
  options.cache.port = options.cache.port || 11211;
  options.cache.namespacePrefix = options.cache.namespacePrefix || 'nodebjectify';
  options.cache.defaultCacheLifetimeInSeconds = options.cache.defaultCacheLifetimeInSeconds || 60;

  options.datastore.projectId = options.datastore.projectId;
  options.datastore.namespacePrefix = options.datastore.namespacePrefix || 'local-dev';
  options.datastore.apiEndpoint = options.datastore.apiEndpoint;


  let self = {
    config: options
  };

  self.Datastore = require('./datastore')(self.config.datastore);
  self.Cache = require('./cache')(self.config.cache);
  self.Model = require('./model');

  return self;
}

Nodebjectify.getInstance = function(options) {
  if(!Nodebjectify.instance) {
    Nodebjectify.instance = new Nodebjectify(options);
  }
  return Nodebjectify.instance;
};


module.exports = Nodebjectify.getInstance;
