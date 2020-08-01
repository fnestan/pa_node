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
