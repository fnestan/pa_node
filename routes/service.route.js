const bodyParser = require('body-parser');
const ServiceController = require('../controllers').ServiceController;
const Verification = require('../helpers').VerificationHelper;
const Message = require('../helpers').ErrorMessage;
const AuthMiddleware = require('../middlewares/auth.middleware');


module.exports = function (app) {


    app.post("/annex/service/:idAnnex", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const response = await ServiceController.createService(req.params.idAnnex,
                req.body.nom,
                req.body.date_service,
                req.body.description,
                req.body.quantite,
                req.body.status,
                req.body.actif);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.put("/annex/service/complete/:idService", AuthMiddleware.isManager(), async (req, res) => {
        try {
            const response = await ServiceController.completeService(req.params.idService);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.put("/annex/service/delete/:idService", AuthMiddleware.isManager(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await ServiceController.deleteService(req.params.idService, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });
    app.get("/annex/:idAnnex/service/list", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await ServiceController.getSeviceList(req.params.idAnnex, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.get("/service/get/:idService", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await ServiceController.getSeviceById(req.params.idService, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.get("/user/answer/service/:idService", AuthMiddleware.isVolunteer(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await ServiceController.answerService(user, req.params.idService);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.get("/service/get/past/list", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await ServiceController.getPastServices(user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.get("/service/get/users/list/:idService", AuthMiddleware.isManager(), async (req, res) => {
        try {
            const response = await ServiceController.getUserRegisteredForService(req.params.idService);
            res.status(response[1]).json(response[0]);
            console.log(response[0])
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });
};
