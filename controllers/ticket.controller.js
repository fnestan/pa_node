const models = require('../models');
const Ticket = models.Ticket;
const TicketMessage = models.Message;
const User = models.User;
const Response = require('../helpers/response');
const Message = require('../helpers/errormessage');


class TicketController {

    /**
     *
     * @param label
     * @param user
     * @returns {Promise<Model> | Promise<Product> | Domain | Promise<void> | * | Promise<Credential | null>}
     */
    static async createTicket(label, user) {
        const number = Math.floor(Math.random() * Math.floor(999999));
        return Response.sendResponse(await Ticket.create({
            label: label,
            number: number,
            UserId: user.id,
            active: true,
            creationDate: new Date()
        }), 201);
    }

    /**
     *
     * @param id
     * @param content
     * @param user
     * @returns {Promise<<Model<any, any> | null>|<Model<any, any>>>}
     */
    static async sendMessage(id, content, user) {
        const ticket = await Ticket.findOne({
            where: {
                id: id
            }
        });
        if (!ticket) {
            return Response.sendResponse(await new Message("Ce Ticket n'existe pas"), 400)
        }
        if (!ticket.active) {
            return Response.sendResponse(await new Message("Ce Ticket à été cloture veuillez en créer un nouveau"), 400);

        }
        if (ticket.UserId !== user.id && user.RoleId !== 4) {
            return Response.sendResponse(await new Message("Vous  n'avez pas le droit d'ajouter un message à ce ticket"), 401);
        }
        const message = await TicketMessage.create({
            content: content,
            TicketId: id,
            redactorId: user.id,
            sendDate: new Date()
        });
        return this.getTicket(id, user);
    }

    static async closeTicket(id, user) {
        const ticket = await Ticket.findOne({
            where: {
                id: id
            }
        });
        if (!ticket) {
            return Response.sendResponse(await new Message("Ce Ticket n'existe pas"), 400);
        }
        if (!ticket.active) {
            return Response.sendResponse(await new Message("Ce Ticket à déjà  été cloturer"), 400);
        }
        if (ticket.UserId !== user.id && user.RoleId !== 4) {
            return Response.sendResponse(await new Message("Vous  n'avez pas le droit de clôture ce ticket"), 400);
        }
        const t = await Ticket.update({active: false}, {
            where: {
                id: id
            }
        });
        return Response.sendResponse(await new Message("Le ticket a ete clôturer"), 200);

    }

    static async getMyTickets(user) {
        const tickets = await Ticket.findAll({
            where: {
                UserId: user.id,
                active: true
            }
        });
        return Response.sendResponse(await tickets, 200);
    }

    static async getAllTickets() {
        return Response.sendResponse(await Ticket.findAll(), 200);
    }

    static async getTicket(id, user) {
        const ticket = await Ticket.findOne({
            include: {
                model: TicketMessage,
                include: {model: User, as: 'redactor'},
                separate: true,
                order: [
                    ['id', 'ASC']
                ]
            },
            where: {
                id: id,
                active: true
            }
        });
        if (!ticket) {
            return Response.sendResponse(await new Message("Ce Ticket n'existe pas"), 400);
        }
        if (ticket.UserId !== user.id && user.RoleId !== 4) {
            return Response.sendResponse(await new Message("Vous  n'avez pas le droit de clôture ce ticket"), 400);
        }
        return Response.sendResponse(await ticket, 200);
    }
}

module.exports = TicketController;
