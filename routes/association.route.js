const bodyParser = require('body-parser');
const AssoviationController = require('../controllers').AssociationController;
const Message = require('../helpers').ErrorMessage;
const Verification = require('../helpers').VerificationHelper;
const AuthMiddleware = require('../middlewares/auth.middleware');


module.exports = function (app) {

    /**
     *
     */
    app.get("/association/get/all/:page", AuthMiddleware.auth(), async (req, res) => {
            try {
                const response = await AssoviationController.getAllAssociation(req.params.page);
                res.status(response[1]).json(response[0]);
            } catch (err) {
                res.status(409).json(new Message(err.toString()));
            }
        }
    );

    app.get("/association/get/:id", AuthMiddleware.auth(), async (req, res) => {
            try {
                const response = await AssoviationController.getAssociationById(req.params.id);
                res.status(response[1]).json(response[0]);
            } catch (err) {
                res.status(409).json(new Message(err.toString()));
            }
        }
    );
    app.post("/association/get/all/byname", bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
            try {
                const response = await AssoviationController.getAllAssociationByName(req.body.page, req.body.name);
                res.status(response[1]).json(response[0]);
            } catch (err) {
                res.status(409).json(new Message(err.toString()));
            }
        }
    );
};
