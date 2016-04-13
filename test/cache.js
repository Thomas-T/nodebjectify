'use strict';

const Q = require('q');
const chai = require('chai');
const expect = chai.expect;
const Cache = require('../lib/index')(require('../config.json').LOCAL).Cache;

describe('Cache', function() {

  before(function(done) {

    Q.spawn(function* () {
      yield Cache.set('dummyIntValue', 1);
      //console.log('dummyIntValue', dummyIntValue);
      yield Cache.set('dummyObjectValue', { firstName: 'Boba', lastName: 'Fett' });
      //console.log('dummyObjectValue', dummyObjectValue);
      yield Cache.set('dummyObjectValueToDelete', { firstName: 'Boba', lastName: 'Fett' });
      //console.log('dummyObjectValueToDelete', dummyObjectValueToDelete);
      done();
    });

  });

  describe('#del', function () {
    it('del a null key returns an error', function (done) {
      Cache.del().then(function(data){
          done(data);
      }).catch(function(err){
        done(err);
      });
    });

    it('del a key that has nothing behind returns false', function (done) {
      Cache.del('nothingbehind').then(function(data){
          expect(data).to.equal(false);
          done();
      }).catch(function(err){
        done(err);
      });
    });

    it('del a key that exists returns true', function (done) {
      Cache.del('dummyObjectValueToDelete').then(function(data){
          expect(data).to.equal(true);
          done();
      }).catch(function(err){
        done(err);
      });
    });
  });

  describe('#get', function () {
    it('get a null key returns an nothing in then', function (done) {
      Cache.get().then(function(data){
        done(data);
      }).catch(function(err){
        done(err);
      });
    });

    it('get a key that has nothing behind returns null', function (done) {
      Cache.get('nothingbehind').then(function(data){
          expect(data).to.not.exist;
          done();
      }).catch(function(err){
        done(err);
      });
    });

    it('get a key that has int behind returns it', function (done) {
      Cache.get('dummyIntValue').then(function(data){
          expect(data).to.equal(1);
          done();
      }).catch(function(err){
        done(err);
      });
    });

    it('get a key that has value behind returns it', function (done) {
      Cache.get('dummyObjectValue').then(function(data){
          expect(data).to.exist;
          expect(data.firstName).to.equal('Boba');
          expect(data.lastName).to.equal('Fett');
          done();
      }).catch(function(err){
        done(err);
      });
    });
  });

  describe('#getCacheName', function () {
    it('return a cachename with namespace', function () {
      let cachename = Cache.getCacheName('YODA');
      expect(cachename).to.equal('nodebjectify_YODA');
    });

    it('return a cachename with no namespace', function () {
      Cache.namespacePrefix = null;
      let cachename = Cache.getCacheName('LUKE');
      expect(cachename).to.equal('LUKE');
    });

    it('return a cachename with namespace changing', function () {
      Cache.namespacePrefix = null;
      let cachename = Cache.getCacheName('LUKE');
      expect(cachename).to.equal('LUKE');
      Cache.namespacePrefix = 'STAR';
      cachename = Cache.getCacheName('LUKE');
      expect(cachename).to.equal('STAR_LUKE');
    });

    after(function(){
      Cache.reset();
    });
  });

  describe('#init', function () {
    it('cache returns a good object with default options', function () {

      expect(Cache).to.exist;
      expect(Cache.address).to.equal('localhost');
      expect(Cache.port).to.equal(11211);
      expect(Cache.defaultCacheLifetimeInSeconds).to.equal(60);
      expect(Cache.namespacePrefix).to.equal('nodebjectify');

      expect(Cache.memcached).to.exist;
    });

    it('cache returns a good object with some personalized options', function () {
      Cache.address = 'yourporn';
      Cache.port = 666;

      expect(Cache).to.exist;
      expect(Cache.address).to.equal('yourporn');
      expect(Cache.port).to.equal(666);
      expect(Cache.defaultCacheLifetimeInSeconds).to.equal(60);
      expect(Cache.namespacePrefix).to.equal('nodebjectify');

      expect(Cache.memcached).to.exist;
    });


    it('cache returns a good object with only personalized options', function () {
      Cache.address = 'yourporn2';
      Cache.port = 667;
      Cache.defaultCacheLifetimeInSeconds = 10;
      Cache.namespacePrefix = 'satan';

      expect(Cache).to.exist;
      expect(Cache.address).to.equal('yourporn2');
      expect(Cache.port).to.equal(667);
      expect(Cache.defaultCacheLifetimeInSeconds).to.equal(10);
      expect(Cache.namespacePrefix).to.equal('satan');

      expect(Cache.memcached).to.exist;
    });
  });
});
