const VerificationHelper = require('../helpers').VerificationHelper;
const Message = require("../helpers/errormessage");

/**
 * todo la calsse authmiddelware est corrigé
 */
class AuthMiddleware {

    static auth() {
        return async function (req, res, next) {
            const authorization = req.headers['authorization'];
            let message;
            if (!authorization || !authorization.startsWith('Bearer ')) {
                message = new Message("vous devez être connecter pour accéder à cette ressource");
                res.status(401).json(message);
                return;
            }
            const token = authorization.slice(7);
            const user = await VerificationHelper.userFromToken(token);
            if (!user) {
                message = new Message("vous devez être connecter pour accéder à cette ressource");
                res.status(403).json(message);
                return;
            }
            next();
        };
    }

    static isAdmin() {
        return async function (req, res, next) {
            let message;
            const authorization = req.headers['authorization'];
            if (!authorization || !authorization.startsWith('Bearer ')) {
                message = new Message("vous devez être connecter pour accéder à cette ressource");
                res.status(401).json(message);
                return;
            }
            const token = authorization.slice(7);
            const user = await VerificationHelper.userFromToken(token);
            if (!user) {
                message = new Message("vous devez être connecter pour accéder à cette ressource");
                res.status(403).json(message);
                return;
            }
            const role = await user.getRole();
            if (role.name !== "Administrateur") {
                message = new Message("vous n'avez pas le droit d'effectuer cette action");
                res.status(403).json(message);
                return;
            }
            next();
        }
    }

    static isManager() {
        return async function (req, res, next) {
            const authorization = req.headers['authorization'];
            let message;
            if (!authorization || !authorization.startsWith('Bearer ')) {
                message = new Message("vous devez être connecter pour accéder à cette ressource");
                res.status(401).json(message);
                return;
            }
            const token = authorization.slice(7);
            const user = await VerificationHelper.userFromToken(token);
            if (!user) {
                message = new Message("vous devez être connecter pour accéder à cette ressource");
                res.status(403).json(message);
                return;
            }
            const role = await user.getRole();
            console.log(role.name !== 'Gerant')
            if (role.name === 'Gerant' || role.name === 'Administrateur') {
                next();
            } else {
                message = new Message("Vous n'avez pas le droit pour effectuer cette action");
                res.status(403).json(message);
                return;
            }
        }
    }

    static isVolunteer() {
        return async function (req, res, next) {
            let message;
            const authorization = req.headers['authorization'];
            if (!authorization || !authorization.startsWith('Bearer ')) {
                message = new Message("vous devez être connecter pour accéder à cette ressource");
                res.status(401).json(message);
                return;
            }
            const token = authorization.slice(7);
            const user = await VerificationHelper.userFromToken(token);
            if (!user) {
                message = new Message("vous devez être connecter pour accéder à cette ressource");
                res.status(403).json(message);
                return;
            }
            const role = await user.getRole();
            console.log(role.name !== 'Benevole')
            if (role.name === 'Benevole' || role.name === 'Administrateur') {
                next();
            } else {
                message = new Message("Vous n'avez pas le droit pour effectuer cette action");
                res.status(403).json(message);
            }
        }
    }
}

module.exports = AuthMiddleware;
