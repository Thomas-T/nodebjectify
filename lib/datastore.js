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
  const datastore = gcloud.datastore;
  const dataset = datastore.dataset({
    apiEndpoint: options.apiEndpoint,
    namespace: self.namespace
  });
  //console.log(datastore);


  function getNamespace() {
    return self.namespace;
  }

  function createQuery(kind) {
    return dataset.createQuery(kind);
  }

  function runQuery(query) {
    //console.log('runQuery', datastore.runQuery);
    var deferred = Q.defer();

    dataset.runQuery(query, function(err, entities, nextQuery){
      //console.log('runQuery', err, entities);
      if(err) {
        return deferred.reject(new Error(err));
      }
      let ents = [];

      entities.forEach(function(entity){
        entity.data.id = entity.key.id;
        ents.push(entity.data);
      });

      deferred.resolve({
        entities: ents,
        nextQuery: nextQuery
      });
    });

    return deferred.promise;
  }

  function getKey(kind, id) {
    if(!kind) {
      console.log('trying to get a key with kind : ',kind);
    }
    let path = [kind];
    if(id) {
      path[1] = id;
    }
    return dataset.key({
      namespace: self.namespace,
      path: path
    });
  }

  function get(kind, id) {
    var deferred = Q.defer();
    let key = getKey(kind, id);

    dataset.get(key, function(err, entity) {
      if(err) {
        return deferred.reject(new Error(err));
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

    dataset.delete(key, function(err) {
      //console.log(apiResponse, key);
      if(err) {
        return deferred.reject(new Error(err));
      }
      deferred.resolve({kind:kind, id: id});
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

    dataset.save({
      key: key,
      data: toSave
    }, function(err) {
      //console.log('response from DS');
      //console.log(err);
      if(err) {
        //console.log('err in saving', err);
        return deferred.reject(new Error(err));
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

  self.createQuery = createQuery;
  self.runQuery = runQuery;


  self.ds = datastore;

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
