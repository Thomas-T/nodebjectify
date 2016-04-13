'use strict';

const Model = require('../../lib/index')(require('../../config.json').LOCAL).Model;

class Animal extends Model {

}

module.exports = Animal;
