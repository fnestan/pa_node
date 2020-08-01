const models = require('../models');
const Annex = models.Annex;
const Association = models.Association;
const AnnexAvailability = models.AnnexAvailability;
const Day = models.Day;
const Role = models.Role;
const User = models.User;
const MailService = require('../service/mail.service');
const Message = require('../helpers/errormessage');
const Response = require('../helpers/response.js');
const Sequelize = require('sequelize');
const op = Sequelize.Op;
const operatorsAliases = {
    $eq: op.eq,
    $or: op.or,
};


class AssociationController {


    static async getAllAssociation(page) {
        const va = await Association.count({
            where: {
                active: true
            }
        });
        const element = 0 + (page - 1) * 10;
        const data = await Association.findAll({
            where: {
                active: true
            },
            limit: 10,
            offset: element
        })
        return Response.sendResponse({count: va, data: data}, 200);
    }

    static async getAllAssociationByName(page, name) {
        const va = await Association.count({
            where: {
                name: {
                    [op.like]: name + '%',
                },
                active: true
            }
        });
        const element = 0 + (page - 1) * 10;
        const data = await Association.findAll({
            where: {
                name: {
                    [op.like]: name + '%',
                },
                active: true
            },
            limit: 10,
            offset: element
        });
        return Response.sendResponse({count: va, data: data}, 200);
    }

    static async getAssociationById(id) {
        return Response.sendResponse(Association.findOne({
            include: {
                model: Annex
            },
            where: {
                id: id
            }
        }), 200);
    }

}


module.exports = AssociationController;
