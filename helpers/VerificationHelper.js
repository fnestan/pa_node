const models = require('../models');
const Response = require('../helpers/response');
const Message = require('../helpers/errormessage');
const User = models.User;
const Annex = models.Annex;

class VerificationHelper {

    static async emailAlreadyExiest(email, table, res) {
        try {
            let response;
            if (table == "user") {
                response = await this.userFromEmail(email);
            } else {
                response = await this.annexFromEmail(email);
            }
            if (response) {
                try {
                    res.status(400).json(new Message("Cet email existe déjà"));
                } catch (e) {
                    console.log(e);
                }
                return false;
            }
        } catch (e) {
            console.log(e)
        }
        return true;
    }

    static async loginAlreadyExiest(login, res) {
        try {
            const user = await this.userFromLogin(login);
            if (user) {
                try {
                    res.status(400).json(new Message("Ce login existe déjà"));

                } catch (e) {
                    console.log(e);
                }
                return false;
            }
        } catch (e) {
            console.log(e)
        }
        return true;
    }

    static async userFromId(id) {
        return User.findOne({
            where: {
                id: id
            }
        });
    }

    static async userFromEmail(email) {
        return User.findOne({
            where: {
                email: email
            }
        });
    }

    static async userFromToken(token) {
        return User.findOne({
            where: {
                token
            }
        });
    };

    static async userFromLogin(login) {
        return User.findOne({
            where: {
                login: login
            }
        });
    }

    static async annexFromEmail(email) {
        return Annex.findOne({
            where: {
                email: email
            }
        });
    }

    static allRequiredParam(...args) {
        for (let i = 0; i < args.length - 1; i++) {
            if (!args[i] && typeof args[i] !== "boolean") {
                const res = args[args.length - 1];
                try {
                    res.status(400).json(new Message("Certains Champs obligatoires ne  sont pas renseignés"));

                } catch (e) {
                    console.log(e);
                }
                return false;
            }
        }
        return true;
    }

    static passwordCormimationGood(password, passwordConfirm, res) {
        if (password !== passwordConfirm) {
            try {
                res.status(400).json(new Message("Le mot de passe de doit être similaire à celui de la confirmation"));
            } catch (e) {
                console.log(e);
            }
            return false;
        }
        return true
    }

}

module.exports = VerificationHelper;
