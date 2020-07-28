const bodyParser = require('body-parser');
const AssoviationController = require('../controllers').AssociationController;
const Verification = require('../helpers').VerificationHelper;
const AuthMiddleware = require('../middlewares/auth.middleware');


module.exports = function (app) {

    /**
     *
     */
    app.get("/association/get/all/:page", AuthMiddleware.auth(), async (req, res) => {
            try {
                const association = await AssoviationController.getAllAssociation(req.params.page);
                res.status(200).json(association);
            } catch (err) {
                res.status(409).json(err);
            }
        }
    );

    app.get("/association/get/:id", AuthMiddleware.auth(), async (req, res) => {
            try {
                const association = await AssoviationController.getAssociationById(req.params.id);
                res.status(200).json(association);
            } catch (err) {
                res.status(409).json(err);
            }
        }
    );
    app.post("/association/get/all/byname", bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
            console.log(req.body.page);
            console.log(req.body.name);
            try {
                const association = await AssoviationController.getAllAssociationByName(req.body.page, req.body.name);
                res.status(200).json(association);
            } catch (err) {
                console.log(err)
                res.status(409).json(err);
            }
        }
    );
    /**
     *
     */
    app.get("/association/ban/:idAssociation", AuthMiddleware.isAdmin(), async (req, res) => {
            try {
                const annex = await AssoviationController.banAssociation(+req.params.idAssociation);
                res.status(200).json(annex);
            } catch (err) {
                res.status(409).json(err);
            }
        }
    );

    app.put("/association/update/:idAssociation", bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
            let {name, description, city} = req.body;
            const allRequireParams = Verification.allRequiredParam(name, description, city, res);
            if (!allRequireParams) {
                return;
            }
            try {
                const annex = await AssoviationController.updateAssociation(name, description, city, +req.params.idAssociation);
                res.status(200).json(annex);
            } catch (err) {
                res.status(409).json(err);
            }
        }
    );

};
