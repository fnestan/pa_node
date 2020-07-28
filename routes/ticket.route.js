const bodyParser = require('body-parser');
const TicketController = require('../controllers').TicketController;
const AuthMiddleware = require('../middlewares/auth.middleware');
const Verification = require('../helpers').VerificationHelper;


module.exports = function (app){


    app.post('/ticket/create', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        console.log(req.body);
        const {label} = req.body;
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const ticket = await TicketController.createTicket(label,user);
            res.status(200).json(ticket);
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });

    app.post('/ticket/:id/message', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        const {message} = req.body;
        console.log(message)
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const ticket = await TicketController.sendMessage(req.params.id,message,user);
            if (ticket.message){
                res.status(400).json(ticket.message);
            } else {
                res.status(200).json(ticket);
            }
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });

    app.get('/ticket/:id/close', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const ticket = await TicketController.closeTicket(req.params.id,user);
            if (ticket.message !== "Le ticket a ete clôturer"){
                res.status(400).json(ticket.message);
            } else {
                res.status(200).json(ticket);
            }
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });

    app.get('/ticket/myTickets', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const tickets = await TicketController.getMyTickets(user);
            console.log(tickets)
            res.status(200).json(tickets);
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });

    app.get('/ticket/all', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const tickets = await TicketController.getAllTickets();
            res.status(200).json(tickets);
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });

    app.get('/ticket/:id/', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
        try {
            const authorization = req.headers['authorization'];
            const user = await Verification.userFromToken(authorization.split(" ")[1]);
            const ticket = await TicketController.getTicket(req.params.id,user);
           if (ticket.message){
               res.status(400).json(ticket.message);
           } else {
               res.status(200).json(ticket);
           }
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });
};
