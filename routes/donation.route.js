const bodyParser = require('body-parser');
const Verification = require('../helpers').VerificationHelper;
const Message = require('../helpers').ErrorMessage;
const AuthMiddleware = require('../middlewares/auth.middleware');
const DonationController = require("../controllers/donation.controller");

module.exports = function (app) {

    // create a donation
    app.post("/donation/:idAnnex", bodyParser.json(), AuthMiddleware.isManager(), async (req, res) => {
        try {
            const response = await DonationController.createDonation(req.body.nom, req.body.description, req.body.productRequests, req.params.idAnnex);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(err);
            console.log(err);
        }
    });

    app.put("/donation/complete/:idDonation", AuthMiddleware.isManager(), async (req, res) => {
        try {
            const response = await DonationController.completeDonation(req.params.idDonation);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.put("/annex/donation/delete/:idDonation", AuthMiddleware.isManager(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await DonationController.deleteDonation(req.params.idDonation, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });


    app.get("/donation/:idAnnex/list", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await DonationController.getDonationList(req.params.idAnnex, user);
            res.status(response[1]).json(response[0]);
        } catch (e) {
            res.status(400).json(new Message(e.toString()));
        }
    });

    app.get("/donation/get/:idDonation", AuthMiddleware.auth(), async (req, res) => {
        try {
            const response = await DonationController.getDonationById(req.params.idDonation);
            res.status(response[1]).json(response[0]);
        } catch (e) {
            res.status(400).json(new Message(e.toString()))
        }
    });
    app.post("/donation/answer/:idDonation", bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await DonationController.answerDonation(req.body.donations, user, req.params.idDonation);
            res.status(response[1]).json(response[0])
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
            console.log(err);
        }
    });

    app.get("/donation/get/past/list", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await DonationController.getPastDonations(user);
            res.status(response[1]).json(response[0]);
        } catch (e) {
            res.status(400).json(new Message(e.toString()))
        }
    });

    app.get("/donation/get/users/list/:idService", async (req, res) => {
        try {
            const response = await DonationController.getUserRegisteredForDonation(req.params.idService);
            res.status(response[1]).json(response[0]);
            console.log(response[0])
        } catch (err) {
            console.log(err)
            res.status(409).json(new Message(err.toString()));
        }
    });
};
