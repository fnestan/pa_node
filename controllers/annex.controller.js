const models = require('../models');
const MailService = require('../service/mail.service');
const Annex = models.Annex;
const Association = models.Association;
const AnnexAvailability = models.AnnexAvailability;
const Day = models.Day;
const Role = models.Role;
const User = models.User;
const Report = models.Report;
const Service = models.Service;
const Sequelize = require('sequelize');
const op = Sequelize.Op;
const Response = require('../helpers/response');
const Message = require('../helpers/errormessage');

class AnnexController {

    /**
     * @param name
     * @param email
     * @param street
     * @param zipCode
     * @param city
     * @param phone
     * @param associationId
     * @returns {Promise<[*, *]>}
     */
    static async createAnnex(name, description, email, street, zipCode, city, phone, associationId, horaire, user) {

        const association = await Association.findOne({
            where: {
                id: associationId
            }
        });
        const annex = await Annex.create({
            name,
            email,
            description,
            street,
            zipCode,
            city,
            phone,
            active: true,
            valid: false,
        });
        await annex.setAssociation(association);
        await annex.addUser(user);
        if (horaire) {
            for (let i = 0; i < horaire.length; i++) {
                const day = await Day.findOne({
                    where: {
                        id: horaire[i].idJour
                    }
                });
                const annexAvailability = await AnnexAvailability.create({
                    openingTime: horaire[i].openingTime,
                    closingTime: horaire[i].closingTime
                });
                await annexAvailability.setDay(day);
                await annexAvailability.setAnnex(annex);
            }
        }
        await MailService.sendMail(ann.email, "Création", "Votre inscription  bien été enregistrer. Vous devez attendre la validation de l'administrateur")
        return Response.sendResponse(await await annex, 201);
    }

    /**
     *
     * @param annexId
     * @returns {Promise<[*, *]>}
     */
    static async validateAnnex(annexId) {
        const annexSearch = await Annex.findOne({
            where: {
                id: annexId
            }
        });
        if (annexSearch) {
            const role = await Role.findOne({
                where: {
                    id: 4
                }
            });
            const users = await annexSearch.getUsers();
            for (let i = 0; i < users.length; i++) {
                await users[i].setRole(role);
            }
            const annex = await Annex.update({valid: true}, {
                where: {
                    id: annexId
                }
            });
            await MailService.sendMail(annexSearch.email, "Inscription Validée", "Nous avons le plaisir de vous annoncer que l'inscription de votre annexe a été accetée.")
            const message = new Message(`L'annexe à bien été Validée`);
            return Response.sendResponse(await await message, 200);
        }

    }

    /**
     *
     * @param annexId
     * @param openingTime
     * @param closingTime
     * @param dayId
     * @param user
     * @returns {Promise<*[]|[*, *]>}
     */
    static async createAvailability(annexId, openingTime, closingTime, dayId, user) {
        const annex = await Annex.findOne({
            where: {
                id: annexId,
                valid: true
            }
        });
        const users = await annex.getUsers();
        const u = users.find(element => element.id === user.id);
        const role = await user.getRole();
        if (u || role.id === 3) {
            const day = await Day.findOne({
                where: {
                    id: dayId
                }
            });
            const annexAvailability = await AnnexAvailability.create({
                openingTime: openingTime,
                closingTime: closingTime
            });
            await annexAvailability.setDay(day);
            await annexAvailability.setAnnex(annex);
            await annexAvailability.save();
            return this.getAnnexByAId(annexId);
        }
        return Response.sendResponse(await new Message("Vous n'avez pas le droit d'effectuer cette action"), 401);
    }

    /**
     *
     * @param idAnnex
     * @param idavailability
     * @param openingTime
     * @param closingTime
     * @param user
     * @returns {Promise<string|*>}
     */
    static async updateAvailability(idAnnex, idavailability, openingTime, closingTime, user) {

        const annex = await Annex.findOne({
            where: {
                id: idAnnex,
                valid: true,
                active: true
            }
        });
        const users = await annex.getUsers();
        const u = users.find(element => element.id === user.id);
        const role = await user.getRole();
        if (u || role.id === 3) {
            const h = await AnnexAvailability.update({openingTime: openingTime, closingTime: closingTime}, {
                where: {
                    id: idavailability
                }
            });

            return Response.sendResponse(await new Message("L'annexe à bien été modifiée"), 200);
        }
        return Response.sendResponse(await new Message("Vous n'avez pas le droit de modifier des disponibilité pour cette Annexe"), 401)
    }

    static async deleteAvailable(idavailability, user) {
        const availability = await AnnexAvailability.findOne({
            where: {
                id: idavailability
            }
        });
        const annex = await availability.getAnnex();
        const users = await annex.getUsers();
        const u = users.find(element => element.id === user.id);
        const role = await user.getRole();
        if (u || role.id === 3) {
            await availability.destroy();
            return this.getAnnexByAId(annex.id);
        }
        return Response.sendResponse(await new Message("Vous n'avez pas le droit de supprimer des disponibilité pour cette Annexe"), 401)
    }

    /**
     *
     * @param idAnnex
     * @param email
     * @param user
     * @returns {Promise<[*, *]>}
     */
    static async addManager(idAnnex, email, user) {
        const annex = await Annex.findOne({
            where: {
                id: idAnnex,
                active: true,
                valid: true
            }
        });
        const users = await annex.getUsers();
        const u = users.find(element => element.id === user.id);
        const role = await user.getRole();
        if (u || role.id === 3) {
            const manager = await User.findOne({
                where: {
                    email: email,
                    validForUser: "ACCEPTE"
                }
            });
            if (manager) {
                await manager.setRole(role);
                await manager.save();
                await annex.addUser(manager);
                return Response.sendResponse(await new Message("Le manager à bien été ajouter"), 200);
            }
            return Response.sendResponse(await new Message("Cet utilisateur n'existe pas"), 400);
        }
        return Response.sendResponse(await new Message("Vous n'avez pas le droit d'ajouter des gérant pour cette Annexe"), 401);
    }

    static async removeManager(idAnnex, idUser, user) {
        const annex = await Annex.findOne({
            where: {
                id: idAnnex,
                valid: true,
                active: true
            }
        });
        const users = await annex.getUsers();
        const u = users.find(element => element.id === user.id);
        const role = await user.getRole();
        if (u || role.id === 3) {
            const manager = await User.findOne({
                where: {
                    id: idUser
                }
            });
            if (manager) {
                annex.removeUser(manager);
                return Response.sendResponse(await new Message("Le manager à bien été supprimer"), 200);
            }
            return Response.sendResponse(await new Message("Cet utilisateur n'existe pas"), 400);
        }
        return Response.sendResponse(await new Message("Vous n'avez pas le droit de supprimer pour cette Annexe"), 401);

    }

    static async getMyAnnexes(user) {
        const annexList = await user.getAnnexes();
        return Response.sendResponse(await annexList.filter(annex => annex.active), 200);
    }

    /**
     *
     * @param id
     * @returns {Promise<[*, *]>}
     */
    static async getAnnexByAId(id) {
        let annex = await Annex.findOne({
            include: [{
                model: AnnexAvailability,
                include: Day
            }, User],
            where: {
                id: id,
                valid: true,
                active: true
            }
        });
        if (annex) {
            return Response.sendResponse(await annex, 200);
        }
        const message = new Message("Cette Annex n'existe pas")
        return Response.sendResponse(await message, 400)
    }

    /**
     *
     * @param user
     * @param id
     * @returns {Promise<[*, *]>}
     */
    static async reportAnnex(user, id) {
        let annex = await Annex.findOne({
            where: {
                id: id,
                valid: true,
                active: true
            }
        });
        if (annex) {
            const reportExist = await Report.findOne({
                reporter: "user",
                annex: annex,
                user: user
            });
            if (reportExist) {
                return Response.sendResponse(await new Message("Vous avez déjà reporté " + annex.name), 400);
            }
            const report = await Report.create({
                reporter: "user"
            });
            report.setAnnex(annex);
            report.setUser(user);
            return Response.sendResponse(await new Message("Vous venez reporter l'annexe " + annex.name), 200);
        }
        return Response.sendResponse(await new Message("Vous ne pouvez pas reporter l'annexe, elle n'existe pas"), 400);

    }


    static async updateAnnex(name, description, email, street, zipCode, city, phone, user, id) {
        let annex = await Annex.findOne({
            where: {
                id: id,
                valid: true,
                active: true
            }
        });
        const userManageers = await annex.getUsers();
        const response = userManageers.find(element => element.id === user.id);
        if (response) {
            const annexUpdate = await Annex.update({
                name: name,
                email: email,
                street: street,
                zipCode: zipCode,
                description: description,
                city: city,
                phone: phone
            }, {
                where: {
                    id: id,
                    valid: true,
                    active: true
                }
            });
            return Response.sendResponse(new Message("L'annexe " + name + " a bien été modifiée"), 200);
        }
        return Response.sendResponse(new Message("Vous n'êtes pas manager de cette annexe"), 403)
    }

    /**
     *
     * @param name
     * @returns {Promise<*>}
     */
    static async searchAnnex(name) {
        return Response.sendResponse(await Annex.findAll({
            where: {
                name: {
                    [op.like]: name + '%',
                },
                valid: true,
                active: true
            }
        }), 200);
    }

    static async sendMail(email, lobject, message) {
        await MailService.sendMail(email, lobject, message);
        return Response.sendResponse(await new Message("Le mail a été envoyé"), 200)
    }


}


module.exports = AnnexController;
