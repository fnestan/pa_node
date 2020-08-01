const bodyParser = require('body-parser');
const TicketController = require('../controllers').TicketController;
const AuthMiddleware = require('../middlewares/auth.middleware');
const Verification = require('../helpers').VerificationHelper;
const Message = require('../helpers').ErrorMessage;


module.exports = function (app) {


    app.post('/ticket/create', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        const {label} = req.body;
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await TicketController.createTicket(label, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.post('/ticket/:id/message', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        const {message} = req.body;
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await TicketController.sendMessage(req.params.id, message, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.get('/ticket/:id/close', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await TicketController.closeTicket(req.params.id, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.get('/ticket/myTickets', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await TicketController.getMyTickets(user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.get('/ticket/all', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const response = await TicketController.getAllTickets();
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });

    app.get('/ticket/:id/', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const response = await TicketController.getTicket(req.params.id, user);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(new Message(err.toString()));
        }
    });
};
