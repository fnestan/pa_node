const bodyParser = require('body-parser');
const AuthController = require('../controllers').AuthController;
const Verification = require('../helpers').VerificationHelper;
const ErrorMessage = require('../helpers').ErrorMessage;


module.exports = function (app) {
    /**
     * json example
     {
        login:fnestan
        firstname:frantz
        email:frantzunestan@gmail.com
        lastname:nestan
        password:password
        passwordConfirm:password
        street:221 baker street
        zipCode:87014
        city:Londre
        phone:0504020104
        birthdate:1996-09-19
        roleId:1
        }
     */
    app.post('/auth/subscribe', bodyParser.json(), async (req, res) => {
        let {login, firstname, email, lastname, password, passwordConfirm, street, zipCode, city, phone, roleId, birthdate} = req.body;
        const allRequireParams = Verification.allRequiredParam(login, birthdate, firstname, email, lastname, password, passwordConfirm, street, zipCode, city, phone, roleId, res);
        if (!allRequireParams) {
            return;
        }
        const emailAlreadyExist = await Verification.emailAlreadyExiest(email, "user", res);
        if (!emailAlreadyExist) {
            return;
        }
        const loginAllreadyExist = await Verification.loginAlreadyExiest(login, res);
        if (!loginAllreadyExist) {
            return;
        }
        const passwordConfirmationIsGoog = Verification.passwordCormimationGood(password, passwordConfirm, res);
        if (!passwordConfirmationIsGoog) {
            return;
        }
        if (+roleId === 3 || +roleId === 4) {
            const message = new ErrorMessage("vous ne pouvez pas choisir un de ces rôle");
            res.status(400).json(message);
            return;
        }
        if (+roleId > 4 || +roleId < 1) {
            const message = new ErrorMessage("Ce rôle n'existe pas");
            res.status(400).json(message)
            return;
        }
        try {
            const response = await AuthController.subscribe(login, firstname, email, lastname, password, street, zipCode, city, phone, roleId, birthdate);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new ErrorMessage(err.toString());
            res.status(409).json(message);
        }
    });

    /**
     *
     {
        login:fnestan
        password:password
     }
     */
    app.post('/auth/login', bodyParser.json(), async (req, res) => {
        const allRequiredParams = Verification.allRequiredParam(req.body.login, req.body.password, res);
        if (!allRequiredParams) return;
        try {
            const response = await AuthController.login(req.body.login, req.body.password);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new ErrorMessage(err.toString());
            res.status(409).end(message);
        }
    });
};
