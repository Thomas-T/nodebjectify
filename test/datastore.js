'use strict';
const Q = require('q');
const chai = require('chai');
const expect = chai.expect;
const Datastore = require('../lib/index')(require('../config.json').LOCAL).Datastore;

describe('Datastore', function() {

  before(function(done) {

    Q.spawn(function* () {
      yield Datastore.save('Thing',{ id: 666, amount:10, name:'to-get' });
      yield Datastore.save('Thing',{ id: 777, amount:10, name:'to-delete' });
      done();
    });

  });

  describe('#createQuery', function () {
    it('create a query with no kind returns a query object with no kinds', function () {
      let query = Datastore.createQuery();
      expect(query).to.exist;
      expect(query.kinds.length).to.equal(0);
    });

    it('create a query with on kind returns a query object with one kind', function () {
      let query = Datastore.createQuery('Thing');
      expect(query).to.exist;
      expect(query.kinds.length).to.equal(1);
      expect(query.kinds[0]).to.equal('Thing');
      expect(query.namespace).to.equal('local-dev');
      expect(query.orders.length).to.equal(0);
      expect(query.groupByVal.length).to.equal(0);
      expect(query.filters.length).to.equal(0);
      expect(query.selectVal.length).to.equal(0);
      expect(query.autoPaginateVal).to.equal(true);
      expect(query.startVal).to.not.exist;
      expect(query.endVal).to.not.exist;
      expect(query.limitVal).to.equal(-1);
      expect(query.offsetVal).to.equal(-1);
    });
  });

  describe('#runQuery', function () {

    this.timeout(5000);

    it('run a query with kind NoData returns no entities', function (done) {
      Datastore.runQuery(Datastore.createQuery('NoData')).then(function(data){
        expect(data).to.exist;
        expect(data.entities).to.exist;
        expect(data.entities.length).to.equal(0);
        setTimeout(done, 1000);
      }).catch(function(err){
        done(err);
      });
    });

    const TempKind = 'Data'+new Date().getTime();

    before(function(done) {
      Q.spawn(function* () {
        yield Datastore.save(TempKind,{ amount:10, name:'to-get' });
        yield Datastore.save(TempKind,{ amount:10, name:'to-get' });
        yield Datastore.save(TempKind,{ amount:10, name:'to-get' });
        yield Datastore.save(TempKind,{ amount:10, name:'to-get' });
        yield Datastore.save(TempKind,{ amount:10, name:'to-get' });
        yield Datastore.save(TempKind,{ amount:10, name:'to-get' });
        yield Datastore.save(TempKind,{ amount:10, name:'to-get' });
        yield Datastore.save(TempKind,{ amount:10, name:'to-get' });
        yield Datastore.save(TempKind,{ amount:10, name:'to-get' });
        yield Datastore.save(TempKind,{ amount:10, name:'to-get' });
        console.log('DATA inserted');
        setTimeout(done, 2000);
      });
    });

    it('run a query with kind Data returns 10 entities', function (done) {
      Datastore.runQuery(Datastore.createQuery(TempKind)).then(function(data){
        expect(data).to.exist;
        expect(data.entities).to.exist;
        expect(data.entities.length).to.equal(10);

        let first  = data.entities[0];
        expect(first).to.exist;
        expect(first.id).to.exist;
        expect(first.amount).to.equals(10);
        expect(first.name).to.equals('to-get');

        done();
      }).catch(function(err){
        done(err);
      });
    });

  });

  describe('#del', function () {
    it('deleting an non existing key returns the kind and id', function (done) {
      Datastore.del('Thing', 778).then(function(key){
        expect(key).to.exist;
        expect(key.kind).to.equal('Thing');
        expect(key.id).to.equal(778);
        done();
      }).catch(function(err){
        done(err);
      });
    });

    it('deleting an existing key returns the kind and id', function (done) {
      Datastore.del('Thing', 777).then(function(key){
        expect(key).to.exist;
        expect(key.kind).to.equal('Thing');
        expect(key.id).to.equal(777);
        done();
      }).catch(function(err){
        done(err);
      });
    });

    it('getting the deletedKey returns nothing', function (done) {
      Datastore.get('Thing', 777).then(function(thing){
        expect(thing).to.not.exist;
        done();
      }).catch(function(err){
        done(err);
      });
    });
  });

  describe('#save', function () {
    it('saving a new object must attribute an id', function (done) {
      Datastore.save('Thing',{ amount:10, name:'bitoku' }).then(function(thing){
        expect(thing).to.exist;
        expect(thing.id).to.exist;
        expect(thing.amount).to.equal(10);
        expect(thing.name).to.equal('bitoku');
        done();
      }).catch(function(err){
        done(err);
      });
    });

    it('saving a new object with id must keep the id', function (done) {
      Datastore.save('Thing',{ id:987564321, amount:10, name:'bitoku' }).then(function(thing){
        expect(thing).to.exist;
        expect(thing.id).to.exist;
        expect(thing.id).to.equal(987564321);
        expect(thing.amount).to.equal(10);
        expect(thing.name).to.equal('bitoku');
        done();
      }).catch(function(err){
        done(err);
      });
    });
  });

  describe('#get', function () {
    it('getting an existing key returns the object', function (done) {
      Datastore.get('Thing', 666).then(function(data){
        expect(data).to.exist;
        expect(data.id).to.equal(666);
        expect(data.amount).to.equal(10);
        expect(data.name).to.equal('to-get');
        done();
      }).catch(function(err){
        done(err);
      });
    });

    it('getting an none existing key returns null', function (done) {
      Datastore.get('Thing', 667).then(function(data){
        expect(data).to.not.exist;
        done();
      }).catch(function(err){
        done(err);
      });
    });
  });

  describe('#init', function () {
    it('datastore returns a good object with default options', function () {
      expect(Datastore).to.exist;
    });
  });




});
