const bodyParser = require('body-parser');
const UserController = require('../controllers').UserController;
const AuthMiddleware = require('../middlewares/auth.middleware');
const Verification = require('../helpers').VerificationHelper;
const Message = require("../helpers/errormessage");


module.exports = function (app) {
    /**
     *
     */
    app.get("/user/ban/:idUser", AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const response = await UserController.banUser(+req.params.idUser);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });

    /**
     *
     */
    app.put("/user/validateVolunter/:idUser", bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const user = await UserController.validateVolunteer(+req.params.idUser, req.body.valide);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });

    /**
     *
     */
    app.put("/user/validateUser/:idUser", bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const user = await UserController.validateUser(+req.params.idUser, req.body.valide);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });

    app.get('/user/report/:idUser/:idAnnex', AuthMiddleware.isManager(), async (req, res) => {
        try {
            const response = await UserController.reportUser(req.params.idAnnex, req.params.idUser);
            console.log(response[0])
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });

    app.get('/user/find/currentUser', AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const userFromTOken = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await UserController.getCurrentUser(userFromTOken);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });

    app.put('/user/update/:idUser', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        let {login, firstname, email, lastname, street, zipCode, city, phone, roleId, birthdate} = req.body;
        try {
            const allRequireParams = Verification.allRequiredParam(login, firstname, email, lastname, street, zipCode, city, phone, roleId, birthdate, res);
            if (!allRequireParams) {
                return;
            }

            const authorization = req.headers['authorization'];
            const userfromId = await Verification.userFromId(req.params.idUser);
            const userFromTOken = await Verification.userFromToken(authorization.split(" ")[1]);
            if (userFromTOken && userfromId) {
                if (userFromTOken.id !== userfromId.id && userFromTOken.RoleId !== 3) {
                    const message = new Message(err.toString());
                    res.status(200).json(message);
                    return;
                }
            }
            let loginAllreadyExist;
            if (login !== userfromId.login) {
                loginAllreadyExist = await Verification.loginAlreadyExiest(login, res);
                if (!loginAllreadyExist) {
                    return;
                }
            }
            let emailAlreadyExist;
            if (email !== userfromId.email) {
                emailAlreadyExist = await Verification.emailAlreadyExiest(email, "user", res);
                if (!emailAlreadyExist) {
                    return;
                }
            }
            let validForVolunteer = null;
            if (userfromId.RoleId == 1 && roleId == 2) {
                if (userfromId.validForVolunteer === "REFUSE") {
                    const message = new Message("Vous ne pouvez pas être bénévole");
                    res.status(400).json(message);
                    return;
                }
                if (userfromId.validForVolunteer === "ATTENTE") {
                    const message = new Message("Votre validation est en attente");
                    res.status(400).json(message);
                    return;
                }
                roleId = roleId;
                validForVolunteer = "ATTENTE";
            } else {
                if (userfromId.RoleId == 2 && roleId !== 1 || roleId === 2) {
                    roleId = userfromId.RoleId;
                }
                if (userFromTOken.RoleId == 3) {
                    roleId = roleId;
                }
                if (userfromId.RoleId == 4) {
                    roleId = 4;
                } else {
                    roleId = 1;
                }
                validForVolunteer = userfromId.validForVolunteer
            }

            const response = await UserController.updateUser(validForVolunteer, login, firstname, email, lastname, street, zipCode, city, phone, roleId, birthdate, req.params.idUser);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });

    app.get("/user/:idUser/answer/service/:idService", AuthMiddleware.isVolunteer(), async (req, res) => {
        try {
            const response = await UserController.answerService(req.params.idUser, req.params.idService);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });

    app.get("/user/get/all", AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const response = await UserController.getAllUsers();
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });

    app.get("/user/get/AllActions", AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const userFromTOken = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await UserController.getHomeAnnex(userFromTOken);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            const message = new Message(err.toString());
            res.status(409).json(message);
        }
    });
};
