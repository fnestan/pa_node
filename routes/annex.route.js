const bodyParser = require('body-parser');
const AnnexController = require('../controllers').AnnexController;
const Verification = require('../helpers').VerificationHelper;
const AuthMiddleware = require('../middlewares/auth.middleware');


module.exports = function (app) {


    /**
     *
     */
    app.get("/annex/getannex/:id", async (req, res) => {
        try {
            const annex = await AnnexController.getAnnexByAId(req.params.id);
            res.status(200).json(annex);
        } catch (e) {
            console.log(e)
            res.status(400).json(e)
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
            const annex = await AnnexController.createAnnex(name, description, email, street, zipCode, city, phone, associationId, horaires, user);
            res.status(201).json(annex);
        } catch (err) {
            res.status(409).json(err);
        }
    });

    /**
     *
     */
    app.get("/annex/ban/:idAnnex", AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const annex = await AnnexController.banAnnex(+req.params.idAnnex);
            res.status(200).json(annex);
        } catch (err) {
            res.status(409).json(err);
        }
    });

    /**
     *
     */
    app.put("/annex/validate/:idAnnex", AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const annex = await AnnexController.validateAnnex(+req.params.idAnnex);
            res.status(200).json(annex);
        } catch (err) {
            res.status(409).json(err);
        }
    });
    app.post("/annex/availability/create/:idAnnex", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const {horaires} = req.body;
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const annex = await AnnexController.createAvailability(+req.params.idAnnex, horaires, user);
            res.status(200).json(annex);
        } catch (err) {
            res.status(409).json(err);
            console.log(err);
        }
    });

    app.post("/annex/:idAnnex/availability/update/:idavailability", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const {openingTime, closingTime} = req.body;
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const annex = await AnnexController.updateAvailability(+req.params.idAnnex, +req.params.idavailability, openingTime, closingTime, user);
            res.status(200).json(annex);
        } catch (err) {
            res.status(409).json(err);
            console.log(err);
        }
    });

    app.post("/annex/:idAnnex/addmanager", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const {email} = req.body;
            const authorization = req.headers['authorization'];
            console.log(authorization)
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const annex = await AnnexController.addManager(+req.params.idAnnex, email, user);
            res.status(200).json(annex);
        } catch (err) {
            res.status(409).json(err);
            console.log(err);
        }
    });

    app.get("/annex/:idAnnex/removeManager/:idUser", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const annex = await AnnexController.removeManager(+req.params.idAnnex, +req.params.idUser, user);
            res.status(200).json(annex);
        } catch (err) {
            res.status(409).json(err);
            console.log(err);
        }
    });
    /**
     *
     */
    app.get('/annex/myannexes', AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const annex = await AnnexController.getMyAnnexes(user);
            res.status(201).json(annex);
        } catch (err) {
            res.status(409).json(err);
        }
    });
    app.get('/annex/report/:id', AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const annex = await AnnexController.reportAnnex(user, req.params.id);
            res.status(201).json(annex);
        } catch (err) {
            console.log(err)
            res.status(409).json(err);
        }
    });

    app.put('/annex/update/:id', AuthMiddleware.isManager(), async (req, res) => {
        const {name, email, street, zipCode, city, phone} = req.body;
        const allRequireParams = Verification.allRequiredParam(name, email, street, zipCode, city, phone, res);
        if (!allRequireParams) {
            return;
        }
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const annex = await AnnexController.updateAnnex(name, description, email, street, zipCode, city, phone, user, req.params.id);
            res.status(201).json(annex);
        } catch (err) {
            console.log(err)
            res.status(409).json(err);
        }
    });

    app.post('/annex/searchAnnex', bodyParser.json(), async  (req, res) => {
        if(req.body.name) {
            try {
                const AnnexList = await AnnexController.searchAnnex(req.body.name);
                res.status(201).json(AnnexList);
            } catch (err) {
                res.status(409).end();
            }
        } else {
            res.status(400).end();
        }
    });
};
