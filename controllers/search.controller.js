const models = require('../models');
const Service = models.Service;
const Donation = models.Donation;
const Sequelize = require('sequelize');
const Response = require('../helpers/response');
const op = Sequelize.Op;

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
        return Response.sendResponse(data, 200);
    }


}

module.exports = SearchController;
