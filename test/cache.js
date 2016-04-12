'use strict';

const Q = require('q');
const chai = require('chai');
const expect = chai.expect;
const Cache = require('../lib/cache');

describe('Cache', function() {

  before(function(done) {

    Q.spawn(function* () {
      let dummyIntValue = yield new Cache().set('dummyIntValue', 1);
      console.log('dummyIntValue', dummyIntValue);
      let dummyObjectValue = yield new Cache().set('dummyObjectValue', { firstName: 'Boba', lastName: 'Fett' });
      console.log('dummyObjectValue', dummyObjectValue);
      done();
    });

  });

  describe('#get', function () {
    it('get a null key returns an error', function (done) {
      new Cache().get().then(function(data){
          console.log('data must not exists');
          done(data);
      }).catch(function(){
        done();
      });
    });

    it('get a key that has nothing behind returns null', function (done) {
      new Cache().get('nothingbehind').then(function(data){
          expect(data).to.not.exist;
          done();
      }).catch(function(err){
        done(err);
      });
    });

    it('get a key that has int behind returns it', function (done) {
      new Cache().get('dummyIntValue').then(function(data){
          expect(data).to.equal(1);
          done();
      }).catch(function(err){
        done(err);
      });
    });

    it('get a key that has value behind returns it', function (done) {
      new Cache().get('dummyObjectValue').then(function(data){
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
      let cache = new Cache();
      let cachename = cache.getCacheName('YODA');
      expect(cachename).to.equal('nodebjectify_YODA');
    });

    it('return a cachename with no namespace', function () {
      let cache = new Cache();
      cache.namespacePrefix = null;
      let cachename = cache.getCacheName('LUKE');
      expect(cachename).to.equal('LUKE');
    });

    it('return a cachename with namespace changing', function () {
      let cache = new Cache();
      cache.namespacePrefix = null;
      let cachename = cache.getCacheName('LUKE');
      expect(cachename).to.equal('LUKE');
      cache.namespacePrefix = 'STAR';
      cachename = cache.getCacheName('LUKE');
      expect(cachename).to.equal('STAR_LUKE');
    });
  });

  describe('#init', function () {
    it('cache returns a good object with default options', function () {
      let cache = new Cache();
      expect(cache).to.exist;
      expect(cache.address).to.equal('localhost');
      expect(cache.port).to.equal(11211);
      expect(cache.defaultCacheLifetimeInSeconds).to.equal(60);
      expect(cache.namespacePrefix).to.equal('nodebjectify');

      expect(cache.memcached).to.exist;
    });

    it('cache returns a good object with some personalized options', function () {
      let cache = new Cache({
        address: 'yourporn',
        port: 666
      });
      expect(cache).to.exist;
      expect(cache.address).to.equal('yourporn');
      expect(cache.port).to.equal(666);
      expect(cache.defaultCacheLifetimeInSeconds).to.equal(60);
      expect(cache.namespacePrefix).to.equal('nodebjectify');

      expect(cache.memcached).to.exist;
    });


    it('cache returns a good object with only personalized options', function () {
      let cache = new Cache({
        address: 'yourporn2',
        port: 667,
        defaultCacheLifetimeInSeconds: 10,
        namespacePrefix: 'satan'
      });
      expect(cache).to.exist;
      expect(cache.address).to.equal('yourporn2');
      expect(cache.port).to.equal(667);
      expect(cache.defaultCacheLifetimeInSeconds).to.equal(10);
      expect(cache.namespacePrefix).to.equal('satan');

      expect(cache.memcached).to.exist;
    });
  });
});
