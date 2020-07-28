const models = require('../models');
const Annex = models.Annex;
const Association = models.Association;
const AnnexAvailability = models.AnnexAvailability;
const Day = models.Day;
const Role = models.Role;
const User = models.User;
const MailService = require('../service/mail.service');
const Sequelize = require('sequelize');
const op = Sequelize.Op;
const operatorsAliases = {
    $eq: op.eq,
    $or: op.or,
};


class AssociationController {


    /**
     *
     * @returns {Promise<void>}
     * @param associationId
     */
    static async banAssociation(associationId) {

        const association = await Association.update({active: false}, {
            where: {
                id: associationId
            }
        });
        const annexes = await Annex.findAll({
            where: {
                associationId: associationId
            }
        });
        for (const annex of annexes) {
            await MailService.sendMail(annex.email, "annex");
            annex.active = false;
            await annex.save();
        }
        return association;
    }

    /**
     *
     * @param name
     * @param description
     * @param city
     * @param number
     * @returns {Promise<void>}
     */
    static async updateAssociation(name, description, city, IdAssociation) {
        const association = await Association.update({
            name: name, description: description, city: city
        }, {
            where: {
                id: IdAssociation
            }
        });
        return association;
    }

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
        return {count: va, data: data}
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
        return {count: va, data: data}
    }

    static async getAssociationById(id) {
        return Association.findOne({
            include:{
                model:Annex
            },
            where: {
                id: id
            }
        })
    }

}


module.exports = AssociationController;
