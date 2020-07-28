const models = require('../models');
const Type = models.Type;

class TypeController {

     static getAllTypes(){
        return Type.findAll();
    }
}

module.exports = TypeController;
