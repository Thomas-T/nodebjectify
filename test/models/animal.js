'use strict';

const Model = require('../../lib/index')(require('../../config.json').TRAVIS).Model;

class Animal extends Model {

}

module.exports = Animal;
