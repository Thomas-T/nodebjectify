'use strict';

const Datastore = require('./datastore')();
const Cache = require('./cache')();
const Q = require('q');

function generateCacheName(kind, id) {
  return kind+'_'+id;
}

class Model {

  constructor(data) {
    data = data || {};
    let _this = this;
    Object.keys(data).forEach(function(key){
      _this[key] = data[key];
    });
    if(!this.createdAt) {
      this.createdAt = new Date();
    }
  }

  // INTROSPECTION

  static getKind() {
    return this.prototype.constructor.name;
  }

  // NODEBJECTIFY
  static get(id) {
    //console.log('get', id);
    let _this = this;
    let deferred = Q.defer();

    Q.spawn(function* () {
      try {
        //console.log('get model from cache');
        let model = yield _this.getFromCache(id);
        //console.log('model from cache', model);
        if(model) {
          //console.log('cache version available');
          return deferred.resolve(model);
        }
        //console.log('cache version NOT available');
        model = yield _this.getFromDatastore(id);
        if(model) {
          yield model.setToCache();
        }
        deferred.resolve(model);
      }
      catch(err) {
        console.log('error in get !!!', err);
        deferred.reject(new Error(err));
      }
    });

    return deferred.promise;
  }
  static del(id) {
    let _this = this;
    let deferred = Q.defer();
    //console.log('del', id);
    Q.spawn(function* () {
      try {
        yield _this.delFromCache(id);
        //console.log('deleted from cache');
        let resp = yield _this.delFromDatastore(id);
        //console.log('deleted from ds');
        deferred.resolve(resp);
      }
      catch(err) {
        deferred.reject(new Error(err));
      }
    });

    return deferred.promise;
  }
  save() {
    let _this = this;
    let deferred = Q.defer();

    Q.spawn(function* () {
      try {
        _this.updatedAt = new Date();
        let model = null;

        let isNew = (typeof _this.id !== 'number') && (typeof _this.id !== 'string');
        //console.log('is new',isNew, _this);

        if(!isNew) {
            yield _this.setToCache();
        }

        model = yield _this.setToDatastore();

        if(isNew) {
            yield _this.setToCache();
        }

        deferred.resolve(model);
      }
      catch(err) {
        deferred.reject(new Error(err));
      }
    });

    return deferred.promise;
  }
  del() {
    //console.log('this.del', this);
    return this.constructor.del(this.id);
  }


  // DATASTORE
  static getFromDatastore(id) {
    let _this = this;
    let deferred = Q.defer();
    Datastore.get(this.getKind(), id).then(function(model){
      if(!model) {
        return deferred.resolve();
      }
      deferred.resolve( new _this.prototype.constructor(model) );
    });
    return deferred.promise;
  }

  static delFromDatastore(id) {
    //console.log('del from DS', this.getKind(), id);
    return Datastore.del(this.getKind(), id);
  }

  setToDatastore() {
    return Datastore.save(this.constructor.getKind(), this);
  }

  delFromDatastore() {
    //console.log('del instance', this);
    return this.constructor.delFromDatastore(this.id);
  }

  // CACHE

  static getCacheName(id) {
    return generateCacheName(this.getKind(),id);
  }

  static getFromCache(id) {
    let _this = this;
    let deferred = Q.defer();
    Cache.get(this.getCacheName(id)).then(function(model){
      //console.log('cache.get', model);
      if(!model) {
        return deferred.resolve();
      }
      deferred.resolve( new _this.prototype.constructor(model) );
    });
    return deferred.promise;
  }

  static delFromCache(id) {
    return Cache.del(this.getCacheName(id));
  }

  setToCache(lifetime) {
    //console.log('set to cache', this);
    //console.log(this);
    return Cache.set(this.constructor.getCacheName(this.id), this, lifetime);
  }

  delFromCache() {
    return this.constructor.delFromCache(this.id);
  }

}

module.exports = Model;
