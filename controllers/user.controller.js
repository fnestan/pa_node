const models = require('../models');
const User = models.User;
const Report = models.Report;
const Role = models.Role;
const Service = models.Service;
const Donation = models.Donation;
const Annex = models.Annex;
const UserDonation = models.UserDonation;
const MailService = require('../service/mail.service');

class UserController {

    /**
     *
     * @param userId
     * @returns {Promise<void>}
     */
    static async banUser(userId) {

        const user = await User.update({active: false, validForVolunteer: "REFUSE", validForUser: "REFUSE"}, {
            where: {
                id: userId
            }
        });
        const u = await User.findOne({
            where: {
                id: userId
            }
        });
        await MailService.sendMail(u.email, 'user');
    }

    /**
     *
     * @param userId
     * @param response
     * @returns {Promise<void>}
     */
    static async validateVolunteer(userId, response) {
        let RoleId = 2;
        if (response === "REFUSE") {
            RoleId = 1
        }
        const user = await User.update({validForVolunteer: response, RoleId: RoleId}, {
            where: {
                id: userId
            }
        });
        return user;
    }

    static async validateUser(userId, response) {
        let active = true;
        if (response === "REFUSE") {
            active = false;
        }
        const user = await User.update({validateUser: response, active: active}, {
            where: {
                id: userId
            }
        });
        this.banUser()
        return user;
    }

    static async reportUser(idAnnex, idUser) {
        const user = await User.findOne({
            where: {
                id: idUser
            }
        });
        const annex = await Annex.findOne({
            where: {
                id: idAnnex
            }
        });
        if (annex && user) {
            const reportExist = await Report.findOne({
                reporter: "annex",
                annex: annex,
                user: user
            });
            if (reportExist) {
                return "Vous avez déjà reporter " + user.firstname + " " + user.lastname;
            }
            const report = await Report.create({
                reporter: "annex"
            });
            report.setAnnex(annex);
            report.setUser(user);
            return "Vous venez de reporter l'utilisateur " + user.firstname + " " + user.lastname;
        }
        return "Vous ne pouvez pas reporter l'utilisateur ";
    }

    static async updateUser(validForVolunteer, login, firstname, email, lastname, street, zipCode, city, phone, roleId, birthdate, idUser) {
        const role = await Role.findOne({
            where: {
                id: roleId
            }
        });
        const user = await User.update({
            login: login, firstname: firstname, email: email,
            lastname: lastname, street: street, zipCode: zipCode, city: city,
            phone: phone, birthdate: birthdate, validForVolunteer: validForVolunteer, RoleId: role.id,
        }, {
            where: {
                id: idUser
            }
        });
        return User.findOne({
            where: {
                id: idUser
            }
        });
    }


    /**
     * @param idUser
     * @param idService
     * @returns {Promise<void>}
     */
    static async answerService(idUser, idService) {
        const service = await Service.findOne({
            where: {
                id: idService
            }
        });
        const user = await User.findOne({
            where: {
                id: idUser
            }
        });
        if (user) {
            if (user.RoleId === 1) {
                return {message: "Vous n'avez pas le droit de répondre aà un service"}
            }
            service.addUser(user)
        }
        return service;
    }

    static async getAllUsers() {
        return User.findAll({
            include: Role
        });
    }

    static async getCurrentUser(userFromTOken) {
        return User.findOne({
            where: {
                id: userFromTOken.id
            }
        });
    }

    static async getHomeAnnex(user) {
        const helpedAnnexes = [];
        helpedAnnexes.push(...await this.getAnnexHelpedByServices(user.id));
        const us = await this.getUserDonationList(user.id);

        for (let i = 0; i < us.length; i++) {
            const donation = await this.getDonationList(us[i].DonationId);
            for (let val = 0; val < donation.length; val++) {
                const annex = await this.getAnnex(donation[val].AnnexId);
                if (!helpedAnnexes.some(a => a.id === annex.id)) {
                    helpedAnnexes.push(annex);
                }
            }
        }
        const pendingDonations = [];
        const pendingServices = [];
        pendingServices.push(...await this.getPendingServices(user.id));
        pendingDonations.push(...await this.getPendingDonation(user.id));
        return {helpedAnnexes: helpedAnnexes, pendingDonations: pendingDonations, pendingServices: pendingServices}
    }

    static async getAnnexHelpedByServices(idUser) {
        const array = [];
        const services = await Service.findAll({
            where: {
                status: true,
                actif: true
            }
        });
        const myServices = [];
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            const users = await service.getUsers();
            if (users.some(user => user.id === idUser)) {
                myServices.push(service);
            }
        }
        for (let i = 0; i < myServices.length; i++) {
            const annex = await this.getAnnex(myServices[i].AnnexId);
            if (!array.some(a => a.id === annex.id)) {
                array.push(annex);
            }
        }
        return array;
    }

    static async getPendingServices(idUser) {
        const services = await Service.findAll({
            where: {
                status: false,
                actif: true
            }
        });
        const myServices = [];
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            const users = await service.getUsers();
            if (users.some(user => user.id === idUser)) {
                myServices.push(service);
            }
        }
        return myServices;
    }

    static async getPendingDonation(idUser) {
        const us = await UserDonation.findAll({
            where: {
                UserId: idUser,
                give: false
            }
        });
        const myDonations = [];
        for (let i = 0; i < us.length; i++) {
            const donation = await Donation.findOne({
                where: {
                    id: us[i].DonationId,
                    actif: true
                }
            });

            if (!myDonations.some(d => d.id === donation.id)) {
                myDonations.push(donation);
            }
        }
        return myDonations;
    }

    static async getUserDonationList(id) {
        return UserDonation.findAll({
            attributes: ['DonationId'],
            where: {
                give: true,
                UserId: id
            },
            group: ['UserDonation.DonationId']
        });
    }

    static async getDonationList(idDonation) {
        return Donation.findAll({
            attributes: ['AnnexId'],
            where: {
                id: idDonation,
                actif: true
            },
            group: ['Donation.AnnexId']
        });
    }

    static async getAnnex(idAnnex) {
        return Annex.findOne({
            where: {
                id: idAnnex,
                active: true,
                valid: true
            }
        });
    }
}

module.exports = UserController;
