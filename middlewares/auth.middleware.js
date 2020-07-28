const VerificationHelper = require('../helpers').VerificationHelper;

class AuthMiddleware {

    static auth() {
        return async function (req, res, next) {
            const authorization = req.headers['authorization'];
            if (!authorization || !authorization.startsWith('Bearer ')) {
                res.status(401).end();
                return;
            }
            const token = authorization.slice(7);
            const user = await VerificationHelper.userFromToken(token);
            if (!user) {
                res.status(403).json("Vous devez être connecter pour créer une association");
                return;
            }
            next();
        };
    }

    static isAdmin() {
        return async function (req, res, next) {
            const authorization = req.headers['authorization'];
            if (!authorization || !authorization.startsWith('Bearer ')) {
                res.status(401).end();
                return;
            }
            const token = authorization.slice(7);
            const user = await VerificationHelper.userFromToken(token);
            if (!user) {
                res.status(403).json("Vous devez être connecter");
                return;
            }
            const role = await user.getRole();
            if (role.name !== "Administrateur") {
                res.status(403).json("Vous n'avez pas le droit pour effectuer cette action");
                return;
            }
            next();
        }
    }

    static isManager() {
        return async function (req, res, next) {
            const authorization = req.headers['authorization'];
            if (!authorization || !authorization.startsWith('Bearer ')) {
                res.status(401).end();
                return;
            }
            const token = authorization.slice(7);
            const user = await VerificationHelper.userFromToken(token);
            if (!user) {
                res.status(403).json("Vous devez être connecter");
                return;
            }
            const role = await user.getRole();
            console.log(role.name !== 'Gerant')
            if (role.name === 'Gerant' || role.name === 'Administrateur') {
                next();
            } else {
                res.status(403).json("Vous n'avez pas le droit pour effectuer cette action");
                return;
            }
        }
    }

    static isVolunteer() {
        return async function (req, res, next) {
            const authorization = req.headers['authorization'];
            if (!authorization || !authorization.startsWith('Bearer ')) {
                res.status(401).end();
                return;
            }
            const token = authorization.slice(7);
            const user = await VerificationHelper.userFromToken(token);
            if (!user) {
                res.status(403).json("Vous devez être connecté");
                return;
            }
            const role = await user.getRole();
            console.log(role.name !== 'Benevole')
            if (role.name === 'Benevole' || role.name === 'Administrateur') {
                next();
            } else {
                res.status(403).json("Vous n'avez pas le droit pour effectuer cette action");
            }
        }
    }
}

module.exports = AuthMiddleware;
