const bodyParser = require('body-parser');
const Verification = require('../helpers').VerificationHelper;
const AuthMiddleware = require('../middlewares/auth.middleware');
const DonationController = require("../controllers/donation.controller");

module.exports = function (app) {

    // create a donation
    app.post("/donation/:idAnnex", bodyParser.json(),AuthMiddleware.isManager(), async (req, res) => {
        try {
            const donation = await DonationController.createDonation(req.body.nom, req.body.description,req.body.productRequests, req.params.idAnnex);
            res.status(201).json(donation);
        } catch (err) {
            res.status(409).json(err);
            console.log(err);
        }
    });

    app.put("/donation/complete/:idDonation", AuthMiddleware.isManager(), async (req, res) => {
        try{
            const donation = await DonationController.completeDonation(req.params.idDonation);
            res.status(200).json(donation);
        }catch(err){
            res.status(409).json(err);
            console.log(err);
        }
    });

    app.put("/annex/donation/delete/:idDonation", AuthMiddleware.isManager(), async (req, res) => {
        try{
            const donation = await DonationController.deleteDonation(req.params.idDonation);
            res.status(200).json(donation);
        }catch(err){
            res.status(409).json(err);
            console.log(err);
        }
    });


    app.get("/donation/:idAnnex/list", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const donations = await DonationController.getDonationList(req.params.idAnnex, user);
            res.status(200).json(donations);
        } catch (e) {
            res.status(400).json(e)
        }
    });

    app.get("/donation/get/:idDonation", AuthMiddleware.auth(), async (req, res) => {
        try {
            const donation = await DonationController.getDonationById(req.params.idDonation);
            res.status(200).json(donation);
        } catch (e) {
            console.log(e)
            res.status(400).json(e)
        }
    });
    app.post("/donation/answer/:idDonation", bodyParser.json(),AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const donation = await DonationController.answerDonation(req.body.donations,user,req.params.idDonation);
            res.status(201).json(donation);
        } catch (err) {
            res.status(409).json(err);
            console.log(err);
        }
    });

    app.get("/donation/get/past/list", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const donation = await DonationController.getPastDonations(user);
            res.status(200).json(donation);
        } catch (e) {
            res.status(400).json(e)
        }
    });
};
