const TypeController = require("../controllers/type.controller");
module.exports = function (app) {
    app.post('/create', async (req, res) => {

    });

    app.get('/types', async (req, res) => {
        const types = await TypeController.getAllTypes();
        res.status(200).json(types);
    });
};
