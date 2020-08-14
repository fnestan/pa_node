const bodyParser = require('body-parser');
const AnnexController = require('../controllers').AnnexController;
const Verification = require('../helpers').VerificationHelper;
const Message = require('../helpers').ErrorMessage;
const AuthMiddleware = require('../middlewares/auth.middleware');


module.exports = function (app) {


    /**
     *
     */
    app.get("/annex/getannex/:id", async (req, res) => {
        try {
            const response = await AnnexController.getAnnexByAId(req.params.id);
            res.status(response[1]).json(response[0]);
        } catch (e) {
            const message = new Message(e.toString());
            res.status(400).json(message)
        }
    });

    /**
     * json example
     {
        name:annex
        email:annex@gmail.com
        street:221 baker street
        zipCode:87014
        city:Londres
        phone:0504020104
        associationId:1,
        "horaires":[
		{
			"idJour":1,
			"openingTime":"08:30",
			"closingTime":"11:30"
		},
		{
			"idJour":1,
			"openingTime":"08:30",
			"closingTime":"11:30"
		},
		{
			"idJour":1,
			"openingTime":"08:30",
			"closingTime":"11:30"
		},
		{
			"idJour":1,
			"openingTime":"08:30",
			"closingTime":"11:30"
		}
	]
        }
     */
    app.post('/annex/create', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        const {name, email, street, zipCode, city, phone, associationId, horaires, description} = req.body;
        const allRequireParams = Verification.allRequiredParam(name, description, email, street, zipCode, city, phone, associationId, res);
        if (!allRequireParams) {
            return;
        }
        const emailAlreadyExist = await Verification.emailAlreadyExiest(email, "annex", res);
        if (!emailAlreadyExist) {
            return;
        }
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await AnnexController.createAnnex(name, description, email, street, zipCode, city, phone, associationId, horaires, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });

    /**
     *
     */
    app.get("/annex/validate/:idAnnex", AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const response = await AnnexController.validateAnnex(+req.params.idAnnex);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });
    app.post("/annex/availability/create/:idAnnex", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const {openingTime, closingTime, dayId} = req.body;
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await AnnexController.createAvailability(+req.params.idAnnex, openingTime, closingTime, dayId, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
            console.log(err);
        }
    });

    app.post("/annex/:idAnnex/availability/update/:idavailability", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const {openingTime, closingTime} = req.body;
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await AnnexController.updateAvailability(+req.params.idAnnex, +req.params.idavailability, openingTime, closingTime, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });


    app.delete("/annex/deleteAvailable/:idAvailable", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await AnnexController.deleteAvailable(+req.params.idAvailable, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.post("/annex/:idAnnex/addmanager", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const {email} = req.body;
            const authorization = req.headers['authorization'];
            console.log(authorization)
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await AnnexController.addManager(+req.params.idAnnex, email, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            console.log(err)
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.get("/annex/:idAnnex/removeManager/:idUser", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await AnnexController.removeManager(+req.params.idAnnex, +req.params.idUser, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });
    /**
     *
     */
    app.get('/annex/myannexes', AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await AnnexController.getMyAnnexes(user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });
    app.get('/annex/report/:id', AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await AnnexController.reportAnnex(user, req.params.id);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.put('/annex/update/:id', AuthMiddleware.isManager(), bodyParser.json(), async (req, res) => {
        console.log(req.body)
        const {name, email, street, zipCode, city, phone, description} = req.body;
        const allRequireParams = Verification.allRequiredParam(name, description, email, street, zipCode, city, phone, res);
        if (!allRequireParams) {
            return;
        }
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await AnnexController.updateAnnex(name, description, email, street, zipCode, city, phone, user, req.params.id);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            console.log(err)
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.post('/annex/searchAnnex', bodyParser.json(), async (req, res) => {
        if (req.body.name) {
            try {
                const response = await AnnexController.searchAnnex(req.body.name);
                res.status(response[1]).json(response[0]);
            } catch (err) {
                res.status(409).json(new Message(err.toString()));
            }
        } else {
            res.status(400).json(new Message("veuillez renseignez un nom"));
        }
    });

    app.post('/annex/sendMail', bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        console.log("dededededee=================================================================")
        if (req.body.email && req.body.object && req.body.message) {
            try {
                const response = await AnnexController.sendMail(req.body.email, req.body.object, req.body.message);
                res.status(response[1]).json(response[0]);
            } catch (err) {
                res.status(409).json(new Message(err.toString()));
            }
        } else {
            res.status(400).json(new Message("veuillez renseignez les données"));
        }
    });
};
