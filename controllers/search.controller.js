const models = require('../models');
const Annex = models.Annex;
const Association = models.Association;
const User = models.User;
const AnnexAvailability = models.AnnexAvailability;
const Day = models.Day;
const Image = models.Image;
const Report = models.Report;
const Role = models.Role;
const Service = models.Service;
const Donation = models.Donation;
const Sequelize = require('sequelize');
const op = Sequelize.Op;
const operatorsAliases = {
    $eq: op.eq,
    $or: op.or,
};


class SearchController {

    /**
     * @returns {Promise<any>}
     */
    static async getAllAnnexes() {
        return await Annex.findAll();
    }

    /**
     * @returns {Promise<any>}
     */
    static async getAllAssociations() {
        return await Association.findAll();
    }

    /**
     * @returns {Promise<any>}
     */
    static async getAllUsers() {
        return await User.findAll();
    }

    /**
     * @returns {Promise<any>}
     */
    static async getAllAnnexAvailabilities() {
        return await AnnexAvailability.findAll();
    }

    /**
     * @returns {Promise<any>}
     */
    static async getAllDays() {
        return await Day.findAll();
    }

    /**
     * @returns {Promise<any>}
     */
    static async getAllImages() {
        return await Image.findAll();
    }

    /**
     * @returns {Promise<any>}
     */
    static async getAllReports() {
        return await Report.findAll();
    }

    /**
     * @returns {Promise<any>}
     */
    static async getAllRoles() {
        return await Role.findAll();
    }

    /**
     * @returns {Promise<any>}
     */
    static async getAllServices() {
        return await Service.findAll();
    }

    static async searchNeed(name) {
        const data = {don: [], service: []};
        const don = await Donation.findAll({
            where: {
                nom: {
                    [op.like]: name + '%'
                },
                actif: true
            }
        });
        data.don.push(...don);
        const services = await Service.findAll({
            where: {
                nom: {
                    [op.like]: name + '%'
                },
                actif: true
            }
        });
        data.service.push(...services);
        return data;
    }


}

module.exports = SearchController;
