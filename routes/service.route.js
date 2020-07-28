const bodyParser = require('body-parser');
const ServiceController = require('../controllers').ServiceController;
const Verification = require('../helpers').VerificationHelper;
const AuthMiddleware = require('../middlewares/auth.middleware');


module.exports = function (app) {


    app.post("/annex/service/:idAnnex", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const service = await ServiceController.createService(req.params.idAnnex, req.body.nom, req.body.date_service, req.body.description,
                req.body.quantite, req.body.status, req.body.actif);
            res.status(201).json(service);
        } catch (err) {
            res.status(409).json(err);
            console.log(err);
        }
    });

    app.put("/annex/service/complete/:idService", AuthMiddleware.isManager(), async (req, res) => {
        try {
            const service = await ServiceController.completeService(req.params.idService);
            res.status(200).json(service);
        } catch (err) {
            res.status(409).json(err);
            console.log(err);
        }
    });

    app.put("/annex/service/delete/:idService", AuthMiddleware.isManager(), async (req, res) => {
        try {
            const service = await ServiceController.deleteService(req.params.idService);
            res.status(200).json(service);
        } catch (err) {
            res.status(409).json(err);
            console.log(err);
        }
    });
    app.get("/annex/:idAnnex/service/list", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const services = await ServiceController.getSeviceList(req.params.idAnnex, user);
            res.status(200).json(services);
        } catch (e) {
            res.status(400).json(e)
        }
    });

    app.get("/service/get/:idService", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const services = await ServiceController.getSeviceById(req.params.idService, user);
            res.status(200).json(services);
        } catch (e) {
            console.log(e)
            res.status(400).json(e)
        }
    });

    app.get("/user/answer/service/:idService", AuthMiddleware.isVolunteer(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const service = await ServiceController.answerService(user, req.params.idService);
            if (service.message) {
                res.status(400).json({mesage: service.message});
            } else {
                res.status(201).json(service);
            }
        } catch (err) {
            res.status(409).json(err);
        }
    });

    app.get("/service/get/past/list", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const services = await ServiceController.getPastServices(user);
            res.status(200).json(services);
        } catch (e) {
            res.status(400).json(e)
        }
    });
};
