const bodyParser = require('body-parser');
const StockController = require('../controllers').StockController;
const AuthMiddleware = require('../middlewares/auth.middleware');
const Verification = require('../helpers').VerificationHelper;
const Message = require("../helpers/errormessage");


module.exports = function (app) {
    /**
     *
     */
    app.get("/stock/get/list/:idAnnex", AuthMiddleware.isManager(), async (req, res) => {
        try {
            const response = await StockController.getStock(+req.params.idAnnex);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });

    /**
     *
     */
    app.put("/stock/update/:id",bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const response = await StockController.updateQuantity(+req.params.id, +req.body.quantity);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });
};
