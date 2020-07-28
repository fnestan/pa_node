const bodyParser = require('body-parser');
const UserController = require('../controllers').UserController;
const AuthMiddleware = require('../middlewares/auth.middleware');
const Verification = require('../helpers').VerificationHelper;


module.exports = function (app) {
    /**
     *
     */
    app.get("/user/ban/:idUser", AuthMiddleware.isAdmin(),async (req, res) => {
        try {
            const user = await UserController.banUser(+req.params.idUser);
            res.status(200).json(user);
        } catch (err) {
            console.log(err)
            res.status(409).json(err);
        }
    });

    /**
     *
     */
    app.put("/user/validateVolunter/:idUser", AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const user = await UserController.validateVolunteer(+req.params.idUser, req.body.valide);
            res.status(200).json(user);
        } catch (err) {
            res.status(409).json(err);
        }
    });

    /**
     *
     */
    app.put("/user/validateUser/:idUser", AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const user = await UserController.validateUser(+req.params.idUser, req.body.valide);
            res.status(200).json(user);
        } catch (err) {
            res.status(409).json(err);
        }
    });

    app.get('/user/report/:idUser/:idAnnex', AuthMiddleware.isManager(), async (req, res) => {
        try {
            const response = await UserController.reportUser(req.params.idAnnex, req.params.idUser);
            res.status(200).json(response);
        } catch (err) {
            console.log(err)
            res.status(409).json(err);
        }
    });

    app.get('/user/find/currentUser', AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const userFromTOken = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await UserController.getCurrentUser(userFromTOken);
            res.status(200).json(response);
        } catch (err) {
            console.log(err)
            res.status(409).json(err);
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
                    res.status(200).json("nope");
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
                    res.status(400).json("Vous ne pouvez pas être bénévole");
                    return;
                }
                if (userfromId.validForVolunteer === "ATTENTE") {
                    res.status(400).json("Votre validation est en attente");
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
            res.status(200).json(response);
        } catch (err) {
            console.log(err)
            res.status(409).json(err);
        }
    });

    app.get("/user/:idUser/answer/service/:idService", AuthMiddleware.isVolunteer(), async(req, res) =>{
        try {
            const service = await UserController.answerService(req.params.idUser, req.params.idService);
           if (service.message){
               res.status(400).json(service.message);
           } else {
               res.status(200).json(service);
           }
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });

    app.get("/user/get/all", AuthMiddleware.isAdmin(), async(req, res) =>{
        try {
            const users = await UserController.getAllUsers();
            res.status(200).json(users);
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });

    app.get("/user/get/AllActions", AuthMiddleware.auth(), async(req, res) =>{
        try {
            const authorization = req.headers['authorization'];
            const userFromTOken = await Verification.userFromToken(authorization.split(" ")[1]);
            const actions = await UserController.getHomeAnnex(userFromTOken);
            res.status(200).json(actions);
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });
};
