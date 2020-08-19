const models = require('../models');
const Service = models.Service;
const Report = models.Report;
const Annex = models.Annex;
const Sequelize = require('sequelize');
const Response = require('../helpers/response');
const Message = require('../helpers/errormessage');

const util = require('util')

class ServiceController {

    /**
     * @param idUser
     * @param idService
     * @returns {Promise<[*, *]>}
     */
    static async answerService(user, idService) {
        const service = await Service.findOne({
            where: {
                id: idService
            }
        });
        await Service.update({quantite: Sequelize.literal('registered +' + 1)}, {
            where: {
                id: idService
            }
        });
        if (user) {
            if (user.RoleId === 1) {
                return Response.sendResponse(await new Message("Vous n'avez pas le droit de répondre à un service en tant que donateur"), 401)
            }
        }
        service.addUser(user);
        return Response.sendResponse(await service, 200);
    }

    /**
     * @param date_service
     * @param nom
     * @param description
     * @param quantite
     * @param idAnnex
     * @returns {Promise<[*, *]>}
     */
    static async createService(idAnnex, nom, date_service, description, quantite) {
        const newService = await Service.create({
            nom: nom,
            date_service: date_service,
            description: description,
            quantite: quantite,
            registered: 0,
            status: false,
            actif: true
        });
        newService.setAnnex(idAnnex);
        return Response.sendResponse(await newService, 200);
    }

    /**
     * @param idService
     * @returns {Promise<[*, *]>}
     */
    static async completeService(idService) {
        const service = await Service.update({status: true}, {
            where: {
                id: idService
            }
        });
        return Response.sendResponse(await new Message("Le service vient d'être complété"), 200)
    }

    /**
     * @param idService
     * @returns {Promise<[*, *]>}
     */
    static async deleteService(idService, user) {
        const service = await Service.update({actif: false}, {
            where: {
                id: idService
            }
        });
        const s = await Service.findOne({
            where: {
                id: idService
            }
        });
        return this.getSeviceList(s.AnnexId, user);
    }


    /**
     *
     * @param idAnnex
     * @param user
     * @returns {Promise<[*, *]>}
     */
    static async getSeviceList(idAnnex, user) {
        const role = user.getRole();
        if (role.id === 4) {
            return Service.findAll({
                where: {
                    AnnexId: idAnnex,
                    actif: true
                }
            });
        }
        return Response.sendResponse(await Service.findAll({
            where: {
                AnnexId: idAnnex,
                actif: true
            }
        }), 200);
    }

    /**
     *
     * @param idAnnex
     * @returns {Promise<[*, *]>}
     */
    static async getSeviceById(idService, user) {
        const service = await Service.findOne({
            include: {
                model: Annex
            },
            where: {
                id: idService
            }
        });
        if (service) {
            let isAnswer
            const users = await service.getUsers();
            if (users.some(vol => vol.id === user.id)) {
                isAnswer = true;
            } else {
                isAnswer = false
            }
            return Response.sendResponse({service: service, isAnswer: isAnswer}, 200);
        }
    }

    static async getPastServices(user) {
        const serviceList = await Service.findAll({
            where: {
                status: true,
                actif: true
            }
        });
        const myServices = [];
        for (let i = 0; i < serviceList.length; i++) {
            const service = serviceList[i];
            const users = await serviceList.getUsers();
            if (users.some(user => user.id === user.id)) {
                myServices.push(service);
            }
        }
        return Response.sendResponse(await myServices, 200);
    }

    static async getUserRegisteredForService(idService) {
        const service = await Service.findOne({
            where: {
                id: idService,
                actif: true
            }
        });
        const users = await service.getUsers();
        const volunteers = [];
        for (let i = 0; i < users.length; i++) {
            const user = users[i].dataValues;
            const report = await Report.findOne({
                where: {
                    reporter: "annex",
                    AnnexId: service.AnnexId,
                    UserId: users[i].id
                }
            });
            if (report) {
                user.isReported = true;
            } else {
                user.isReported = false;
            }
            volunteers.push(user);
        }
        return Response.sendResponse(volunteers, 200);
    }

}


module.exports = ServiceController;
