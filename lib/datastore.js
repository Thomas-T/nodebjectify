'use strict';

const Q = require('q');

function Datastore(options) {
  if(!options) {
    throw new Error('no options provided for Datastore init, please use the Nodebjectify handler');
  }
  if(!options.projectId) {
    throw new Error('no projectId options in options for Datastore init, please provide a projectId');
  }
  var self = {};

  self.creds = {
    projectId: options.projectId
  };

  self.namespace = options.namespacePrefix;

  const gcloud = require('gcloud')(self.creds);
  const datastore = gcloud.datastore({
    apiEndpoint: options.apiEndpoint,
    namespace: self.namespace
  });
  //console.log(datastore);



  function getNamespace() {
    return self.namespace;
  }

  function getKey(kind, id) {
    if(!kind) {
      console.log('trying to get a key with kind : ',kind);
    }
    let path = [kind];
    if(id) {
      path[1] = id;
    }
    return datastore.key({
      namespace: self.namespace,
      path: path
    });
  }

  function get(kind, id) {
    var deferred = Q.defer();
    let key = getKey(kind, id);

    datastore.get(key, function(err, entity) {
      if(err) {
        deferred.reject(new Error(err));
      }
      else {
        if(!entity) {
          return deferred.resolve();
        }
        //console.log(entity);
        entity.data.id = entity.key.id;
        deferred.resolve(entity.data);
      }
    });

    return deferred.promise;
  }

  function del(kind, id) {
    var deferred = Q.defer();
    let key = getKey(kind, id);

    datastore.delete(key, function(err) {
      //console.log(apiResponse, key);
      if(err) {
        deferred.reject(new Error(err));
      }
      else {
        deferred.resolve({kind:kind, id: id});
      }
    });
    return deferred.promise;
  }

  function save(kind, entity) {
    var deferred = Q.defer();
    let key = getKey(kind, entity.id);
    //console.log(key, kind, entity);
    //console.log(key);

    let toSave = {};
    Object.keys(entity).forEach(function(key){
      if(key === 'id') {
        return;
      }
      toSave[key] = entity[key];
    });

    datastore.save({
      key: key,
      data: toSave
    }, function(err) {
      //console.log('response from DS');
      //console.log(err);
      if(err) {
        //console.log('err in saving', err);
        deferred.reject(new Error(err));
      }
      else {
        //console.log('saved', key);
        toSave.id = key.id;
        deferred.resolve(toSave);
      }
    });

    return deferred.promise;
  }

  self.getNamespace = getNamespace;
  self.getKey = getKey;

  self.get = get;
  self.del = del;
  self.save = save;


  return self;

}

Datastore.instance = null;
function getInstance(options) {
  if(!Datastore.instance) {
    Datastore.instance = new Datastore(options);
  }
  return Datastore.instance;
}

module.exports = exports = getInstance;
