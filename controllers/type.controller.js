const models = require('../models');
const Response = require('../helpers/response');
const Type = models.Type;

class TypeController {

    static async getAllTypes() {
        return Response.sendResponse(await Type.findAll(), 200);
    }
}

module.exports = TypeController;
