const TypeController = require("../controllers/type.controller");
module.exports = function (app) {
    app.get('/types', async (req, res) => {
        const response = await TypeController.getAllTypes();
        res.status(response[1]).json(response[0]);
    });
};
