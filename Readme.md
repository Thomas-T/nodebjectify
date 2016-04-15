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

*TO DO*

* prods credentials configuration for the Datastore
* better management for namespaces (default and on operation-only change)
* implementation of all functionnalities for Nodebjectify.Datastore and Nodebjectify.Cache (eg: batch request)

# Installation

    npm i --save nodebjectify

# Development Environment

You need 2 things to develop your application, a Memcached server and a Datastore.
## Memcached

Go to the [Appengine Doc page](https://cloud.google.com/appengine/docs/flexible/nodejs/caching-application-data) and follow the instructions for your OS at the section *"Testing memcached locally"*

## Datastore
You can use the Appengine Datastore directly, but it will cost you and will not be very efficient for development.
You'd rather use the [Datastore Emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator).

## Configuration
You need to connect Nodebjectify to your Datastore and Memcached servers.
For this, you can create a module like this :

    // nodebjectify-instance.js or whatever your want
    const Nodebjectify = require('nodebjectify')(myConf);
    module.exports = Nodebjectify;

You can then require your module every where in your code and keep just your configuration at one place.
E.G in your code :

    const NBJ = require('./nodebjectify-instance');
    // you can now access the Model class
    class SuperHero extends NBJ.Model {

    }
    module.exports = NBJ;

You can also have now access to the `Datastore` and `Cache` layers that Nodebjectify uses :

    NBJ.Datastore;
    NBJ.Cache;   

Note that thiese layers are not direct access to the `Datastore` and the `Memcached`, as they do some treatment to manage things like namespace or data transformations.

The config file is a JSON or Javacript object like the following :

    {
      "cache": { // The cache configuration
        "address": "localhost", // the address of the memcached server, 'localhost' if none provided
        "port": 11211, // the port of the memcached server, 11211 if none provided
        "namespacePrefix": "nodebjectify", // the namespace to prefix your cache entries, 'nodebjectify' if non provided
        "defaultCacheLifetimeInSeconds": 60 // the default lifetime value in second to expires your cache entries, 60 if non provided
      },
      "datastore": {
        "projectId": "allocab-vm-test", // the ID of your GoogleAppengine projet, REQUIRED
        "namespacePrefix": "local-dev", // the namespace used to store your entries in the Datastore
        "apiEndpoint": "localhost:8926" // the address of your local Datastore Instance, if non provided, will target the real Appengine Datastore according to your projet ID
      }
    }    


# Production Environment
soon

# The Model concept

Nodebjectify provide you a `Model`class that implements the basic methods to access and manipulate your data, provide your own classes that extends `Model` and let's magic happens.

## Define your class

In a module, define your class `Animal` that extends `Model` :

    const NBJ = require('./nodebjectify-instance');
    class Animal extends NBJ.Model {
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
