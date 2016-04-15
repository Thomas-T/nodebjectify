**An abstraction layer for using Google Appengine Datastore & Memcache with NodeJs**

Appengine is a great plaform for developping applications with (almost) infinite scaling.
The new *Flexible Environment* (previously Managed VM) allow you to run NodeJs and many more langages.

The goal of Nodebjectify is to allow you to store and manipulate data easily, without taking care of such thing as caching.
A short example :

    let hipster = new Hipster({firstName: 'Alfred', lastName: 'Johnson', age: 20, braceColor: '##ffd900'});
    hipster.save().then(function(hipsterSaved){
        console.log('my hipster saved', hipsterSaved);
    });

The hipster is instancied with the data provided (no schema, we keep JS flexibility), then saved to the Datastore and the Cache for later use.

*what Nobjectify doesn't do*
Nobjectify doesn't care about data validation, it is only a layer of abstraction for storing and accessing your data from the Datastore and the Cache.


# Installation

    npm i --save nodebjectify

# Development Environment

You need 2 things to develop your application, a Memcached server and a Datastore.
## Memcached

Go to the [Appengine Doc page](https://cloud.google.com/appengine/docs/flexible/nodejs/caching-application-data) and follow the instructions for your OS at the section *"Testing memcached locally"*

## Datastore
You can use the Appengine Datastore directly, but it will cost you and will not be very efficient for development.
You'd rather use the [Datastore Emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator).

# Production Environment
soon

# Configuration
soon

# The Model concept

Nodebjectify provide you a `Model`class that implements the basic methods to access and manipulate your data, provide your own classes that extends `Model` and let's magic happens.

## Define your class

In a module, define your class `Animal` that extends `Model` :

    class Animal extends Model {
      // here your methods definitions
    }
    module.exports = Animal;

Tadaaa !

## Use your class

Then you can use your new class `Animal` with the basics methods inherited from `Model` :

    new Animal({name: 'Flipper', race: 'dolphin', age: 45}).save().then(function(flipper){
      console.log('here comes flipper', flipper);
      console.log(flipper.id); /// 12345
    });

In the datastore, you can see an new `Entity`of the Kind `Animal` with 3 attributes `name`,`race`,`age`, in the memcache a new entry has been set with the same data.

You can retrieve your created `Animal` with its ID :

    Animal.get(12345).then(function(flipper){
        console.log('flipper is back', flipper);
    });

Nobjectify first look in the memcache to retrieve it fastly, if it's not present, it will load it from the Datastore and store it to Cache for later use.

# Reference

## Static methods

### get(id)
soon
### del(id)
soon
### createQuery()
soon
### runQuery(query)
soon

## Object methods

### save()
soon
### del()
soon
