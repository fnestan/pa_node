const models = require('../models');
const Ticket = models.Ticket;
const Message = models.Message;
const User = models.User;


class TicketController {

    /**
     *
     * @param label
     * @param user
     * @returns {Promise<Model> | Promise<Product> | Domain | Promise<void> | * | Promise<Credential | null>}
     */
    static createTicket(label, user) {
        const number = Math.floor(Math.random() * Math.floor(9999999));
        return Ticket.create({
            label: label,
            number: number,
            UserId: user.id,
            active: true,
            creationDate: new Date()
        });
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
            return {
                message: "Ce Ticket n'existe pas"
            }
        }
        if (!ticket.active) {
            return {
                message: "Ce Ticket à été cloture veuillez en créer un nouveau"
            }
        }
        if (ticket.UserId !== user.id && user.RoleId !== 4) {
            return {
                message: "Vous  n'avez pas le droit d'ajouter un message à ce ticket"
            }
        }
        const message = await Message.create({
            content: content,
            TicketId: id,
            redactorId: user.id,
            sendDate: new Date()
        });
        return this.getTicket(id, user)
    }

    static async closeTicket(id, user) {
        const ticket = await Ticket.findOne({
            where: {
                id: id
            }
        });
        if (!ticket) {
            return {
                message: "Ce Ticket n'existe pas"
            }
        }
        if (!ticket.active) {
            return {
                message: "Ce Ticket à déjà  été cloturer"
            }
        }
        if (ticket.UserId !== user.id && user.RoleId !== 4) {
            return {
                message: "Vous  n'avez pas le droit de clôture ce ticket"
            }
        }
        const t = await Ticket.update({active: false}, {
            where: {
                id: id
            }
        });
        return {
            message: "Le ticket a ete clôturer"
        }
    }

    static async getMyTickets(user) {
        const tickets = await Ticket.findAll({
            where: {
                UserId: user.id,
                active: true
            }
        });
        return tickets;
    }

    static async getAllTickets() {
        return Ticket.findAll();
    }

    static async getTicket(id, user) {
        const ticket = await Ticket.findOne({
            include: {
                model: Message,
                include: {model: User, as: 'redactor'},
                separate: true,
                order: [
                    ['id', 'ASC']
                ]

            },

            where: {
                id: id
            }
        });
        if (!ticket) {
            return {
                message: "Ce Ticket n'existe pas"
            }
        }
        if (!ticket.active) {
            return {
                message: "Ce Ticket à été cloturer"
            }
        }
        if (ticket.UserId !== user.id && user.RoleId !== 4) {
            return {
                message: "Vous  n'avez pas le droit de clôture ce ticket"
            }
        }
        return ticket;
    }
}

//getMyTickets
module.exports = TicketController;
