'use strict';
const Q = require('q');
const chai = require('chai');
const expect = chai.expect;
const Model = require('../lib/index')(require('../config.json').LOCAL).Model;
const Story = require('./models/Story');
const Animal = require('./models/Animal');

let models = [
  { schema: Model, kind: 'Model' },
  { schema: Story, kind: 'Story' },
  { schema: Animal, kind: 'Animal' }
];

models.forEach(function(clz){

  let ModelPatron = clz.schema;
  let kind = clz.kind;



  describe(kind, function() {

    describe('#createQuery', function(){

      it('create query for model return good query', function(){

        let query = ModelPatron.query();
        expect(query).to.exist;

        expect(query.kinds.length).to.equal(1);
        expect(query.kinds[0]).to.equal(kind);
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


    before(function(done) {

      Q.spawn(function* () {
        yield new ModelPatron({ amount:10, name:'to-get' }).save();
        yield new ModelPatron({ amount:10, name:'to-get' }).save();
        yield new ModelPatron({ amount:10, name:'to-get' }).save();
        yield new ModelPatron({ amount:10, name:'to-get' }).save();
        done();
      });

    });

    describe('#runQuery', function(done){
      ModelPatron.runQuery(ModelPatron.query()).then(function(data){
        expect(data).to.exist;
        expect(data.models).to.exist;
        expect(data.models.length).to.be.at.least(4);
        data.models.forEach(function(model){
          expect(model.id).to.exist;
        });
      }).catch(function(err){
        done(err);
      });
    });


    describe('#model lifecycle', function(){

      it('create / get / update / get / del / get', function(done){

        Q.spawn(function* () {
          let hero = {
            firstName: 'Burn',
            lastName: 'Out'
          };

          let model = new ModelPatron(hero);

          let saved = yield model.save();
          expect(saved).to.exist;
          expect(saved.id).to.exist;
          expect(saved.firstName).to.equal(hero.firstName);
          expect(saved.lastName).to.equal(hero.lastName);
          let idSaved = saved.id;

          let modelRetrieved = yield ModelPatron.get(idSaved);
          expect(modelRetrieved).to.exist;
          expect(modelRetrieved.id).to.exist;
          expect(modelRetrieved.firstName).to.equal(hero.firstName);
          expect(modelRetrieved.lastName).to.equal(hero.lastName);
          modelRetrieved.firstName = 'Marcel';
          modelRetrieved.lastName = 'Cerdan';
          yield modelRetrieved.save();

          let modelUpdated = yield ModelPatron.get(idSaved);
          expect(modelUpdated.id).to.exist;
          expect(modelUpdated.firstName).to.equal('Marcel');
          expect(modelUpdated.lastName).to.equal('Cerdan');

          yield modelUpdated.del();
          let modelDeleted = yield ModelPatron.get(idSaved);
          expect(modelDeleted).to.not.exist;

          done();

        });


      });

    });


    describe('#del', function(){

      it('deleting an non existing object must return kind+id', function(done){
        ModelPatron.del(78653).then(function(key){
          expect(key).to.exist;
          expect(key.id).to.equal(78653);
          expect(key.kind).to.equal(kind);
          done();
        }).catch(function(err){
          done(err);
        });
      });

      before(function(done) {

        Q.spawn(function* () {
          yield new ModelPatron({ id: 5456465456, firstName: 'Jar-Jar' }).save();
          done();
        });

      });

      it('deleting an non existing object must return kind+id', function(done){
        ModelPatron.del(5456465456).then(function(key){
          expect(key).to.exist;
          expect(key.id).to.equal(5456465456);
          expect(key.kind).to.equal(kind);
          done();
        }).catch(function(err){
          done(err);
        });
      });

    });

    describe('#save', function(){
      it('saving an new model auto attribute ID', function(done){

        new ModelPatron({firstName: 'Fred', lastName: 'Pierrafeu'}).save().then(function(model){

          expect(model).to.exist;
          expect(model.id).to.exist;
          expect(model.createdAt).to.exist;
          expect(model.updatedAt).to.exist;
          expect(model.firstName).to.equal('Fred');
          expect(model.lastName).to.equal('Pierrafeu');

          done();
        }).catch(function(err){
          done(err);
        });

      });

      it('saving an new model with an ID must keep the ID', function(done){

        new ModelPatron({id:16457,firstName: 'Fred', lastName: 'Pierrafeu'}).save().then(function(model){

          expect(model).to.exist;
          expect(model.id).to.equal(16457);
          expect(model.createdAt).to.exist;
          expect(model.updatedAt).to.exist;
          expect(model.firstName).to.equal('Fred');
          expect(model.lastName).to.equal('Pierrafeu');

          done();
        }).catch(function(err){
          done(err);
        });

      });

    });


    describe('#get', function(){

      it('getting an non existing entity returns null', function(done){
        ModelPatron.get(333).then(function(model){
          //console.log('non existing model', model);
          done(model);
        }).catch(function(err){
          //console.log('error in non existing model', err);
          done(err);
        });
      });

      before(function(done) {

        Q.spawn(function* () {
          yield new ModelPatron({ id: 555, name: 'this is it' }).save();
          done();
        });

      });

      it('getting an existing entity returns object', function(done){
        ModelPatron.get(555).then(function(model){
          expect(model).to.exist;
          expect(model.id).to.equal(555);
          expect(model.name).to.equal('this is it');
          expect(model.createdAt).to.exist;
          expect(model.updatedAt).to.exist;
          done();
        }).catch(function(err){
          done(err);
        });
      });

    });


    describe('#cache lifecycle', function(){

      it('create / get / update / get / del / get', function(done){

        Q.spawn(function* () {
          let hero = {
            id: 456987,
            firstName: 'Georges',
            lastName: 'Abitbol'
          };

          let model = new ModelPatron(hero);

          yield model.setToCache();

          let modelRetrieved = yield ModelPatron.getFromCache(hero.id);
          expect(modelRetrieved).to.exist;
          expect(modelRetrieved.id).to.exist;
          expect(modelRetrieved.firstName).to.equal(hero.firstName);
          expect(modelRetrieved.lastName).to.equal(hero.lastName);
          modelRetrieved.firstName = 'Alice';
          modelRetrieved.lastName = 'Cooper';
          yield modelRetrieved.setToCache();

          let modelUpdated = yield ModelPatron.getFromCache(hero.id);
          expect(modelUpdated.id).to.exist;
          expect(modelUpdated.firstName).to.equal('Alice');
          expect(modelUpdated.lastName).to.equal('Cooper');

          yield modelUpdated.delFromCache();
          let modelDeleted = yield ModelPatron.getFromCache(hero.id);
          expect(modelDeleted).to.not.exist;

          done();

        });


      });

    });


    describe('#datastore lifecycle', function(){

      it('create / get / update / get / del / get', function(done){

        Q.spawn(function* () {
          let hero = {
            firstName: 'Georges',
            lastName: 'Abitbol'
          };

          let model = new ModelPatron(hero);

          let saved = yield model.setToDatastore();
          expect(saved).to.exist;
          expect(saved.id).to.exist;
          expect(saved.firstName).to.equal(hero.firstName);
          expect(saved.lastName).to.equal(hero.lastName);
          let idSaved = saved.id;

          let modelRetrieved = yield ModelPatron.getFromDatastore(idSaved);
          expect(modelRetrieved).to.exist;
          expect(modelRetrieved.id).to.exist;
          expect(modelRetrieved.firstName).to.equal(hero.firstName);
          expect(modelRetrieved.lastName).to.equal(hero.lastName);
          modelRetrieved.firstName = 'Alice';
          modelRetrieved.lastName = 'Cooper';
          yield modelRetrieved.setToDatastore();

          let modelUpdated = yield ModelPatron.getFromDatastore(idSaved);
          expect(modelUpdated.id).to.exist;
          expect(modelUpdated.firstName).to.equal('Alice');
          expect(modelUpdated.lastName).to.equal('Cooper');

          yield modelUpdated.delFromDatastore();
          let modelDeleted = yield ModelPatron.getFromDatastore(idSaved);
          expect(modelDeleted).to.not.exist;

          done();

        });


      });

    });

    describe('#getFromDatastore', function(){

      it('get an non existing key from DS returns null', function(done){
        ModelPatron.getFromDatastore(789).then(function(data){
          done(data);
        }).catch(function(err){
          done(err);
        });
      });

      before(function(done) {

        Q.spawn(function* () {
          yield new ModelPatron({id: 789465, name: 'saved !!!!'}).setToDatastore();
          done();
        });

      });

      it('get an existing key from DS returns object', function(done){
        ModelPatron.getFromDatastore(789465).then(function(data){
          expect(data).to.exist;
          expect(data.id).to.equal(789465);
          expect(data.name).to.equal('saved !!!!');
          done();
        }).catch(function(err){
          done(err);
        });
      });

    });

    describe('#setToDatastore', function(){
      it('saving an object with no id autoattibute id', function(done){
        new ModelPatron({firstName: 'Bruce', lastName: 'Wayne'}).setToDatastore().then(function(model){
          expect(model).to.exist;
          expect(model.id).to.exist;
          expect(model.firstName).to.equal('Bruce');
          expect(model.lastName).to.equal('Wayne');
          done();
        }).catch(function(err){
          done(err);
        });
      });

      it('saving an object with id keeps id', function(done){
        new ModelPatron({id: 13467, firstName: 'Bruce', lastName: 'Banner'}).setToDatastore().then(function(model){
          expect(model).to.exist;
          expect(model.id).to.equal(13467);
          expect(model.firstName).to.equal('Bruce');
          expect(model.lastName).to.equal('Banner');
          done();
        }).catch(function(err){
          done(err);
        });
      });
    });


    describe('#delFromCache', function () {
      it('del from cache with no existing key return null', function (done) {
        ModelPatron.delFromCache(668).then(function(data){
          done(data);
        }).catch(function(err){
          done(err);
        });
      });

      before(function(done) {

        Q.spawn(function* () {
          yield new ModelPatron({id: 4567, name: 'cached'}).setToCache(10);

          done();
        });

      });

      it('del from cache with no key return true', function (done) {
        ModelPatron.delFromCache(4567).then(function(data){
          expect(data).to.equal(true);
          done();
        }).catch(function(err){
          done(err);
        });
      });
    });


    describe('#getFromCache', function () {
      it('static call on getFromCache with no existing key must return null', function (done) {
        ModelPatron.getFromCache(9999).then(function(data){
          done(data);
        }).catch(function(err){
          done(err);
        });
      });

      before(function(done) {

        Q.spawn(function* () {
          yield new ModelPatron({id: 9998, name: 'cached'}).setToCache(10);

          done();
        });

      });

      it('static call on getFromCache with existing key must return object', function (done) {
        ModelPatron.getFromCache(9998).then(function(data){
          expect(data).to.exist;
          expect(data.id).to.equal(9998);
          expect(data.name).to.equal('cached');
          done();
        }).catch(function(err){
          done(err);
        });
      });

    });

    describe('#getCacheName', function () {
      it('static call on getCacheName', function () {
        expect(ModelPatron.getCacheName(1)).to.equal(kind+'_1');
      });
    });

    describe('#getKind', function () {
      it('static call on getKind must return className', function () {
        expect(ModelPatron.getKind()).to.equal(kind);
      });
    });

    describe('#init', function () {
      it('init a model with no data returns model + createdAt', function () {
        let model = new ModelPatron();
        expect(model).to.exist;
        expect(model.createdAt).to.exist;
      });
    });

  });

});
