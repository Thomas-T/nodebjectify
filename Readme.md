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

# Development Environment & Config
soon
# Production Environment & Config
soon
# the Model concept
soon
# static methods
soon
# object methods
soon
