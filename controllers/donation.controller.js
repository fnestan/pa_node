const models = require('../models');
const Annex = models.Annex;
const User = models.User;
const UserDonation = models.UserDonation;
const Donation = models.Donation;
const Report = models.Report;
const Product = models.Product;
const Requerir = models.Requerir;
const Stock = models.Stock;
const Response = require('../helpers').Response;
const Message = require('../helpers').ErrorMessage;
const Type = models.Type;
const Sequelize = require('sequelize');

class DonationController {
    /**
     *
     * @param name
     * @param description
     * @param products
     * @param idAnnex
     * @returns {Promise<[*, *]>}
     */
    static async createDonation(name, description, products, idAnnex) {
        const newDonation = await Donation.create({
            nom: name,
            description: description,
            status: false,
            actif: true
        });
        for (let i = 0; i < products.length; i++) {
            const stock = await Stock.findOne({
                where: {
                    ProductId: products[i].idProduct,
                    AnnexId: idAnnex
                }
            });
            if (!stock) {
                const s = await Stock.create({
                    quantity: 0,
                    AnnexId: idAnnex,
                    ProductId: products[i].idProduct
                });
            }
            const productRequest = await Product.findOne({
                where: {
                    id: products[i].idProduct
                }
            });
            if (productRequest) {
                const requerir = await Requerir.create({
                    quantity: products[i].quantity,
                    quantityLeft: products[i].quantity,
                    DonationId: newDonation.id,
                    ProductId: productRequest.id
                })
            }
        }
        newDonation.setAnnex(idAnnex);
        return Response.sendResponse(await newDonation, 201);
    }


    /**
     * @param idDonation
     * @param quantityDonation
     * @returns {Promise<[*, *]>}
     */
    static async completeDonation(idDonation, quantityDonation) {
        return Response.sendResponse(await Donation.update({status: true}, {
            where: {
                id: idDonation,
                quantity: quantityDonation
            }
        }), 200);
    }

    /**
     * @param idDonation
     * @returns {Promise<[*, *]>}
     */
    static async deleteDonation(idDonation, user) {
        const donation = await Donation.update({actif: false}, {
            where: {
                id: idDonation
            }
        });
        const d = await Donation.findOne({
            where: {
                id: idDonation
            }
        });
        return await this.getDonationList(d.AnnexId, user);
    }

    static async getDonationList(idAnnex, user) {
        const role = await user.getRole();
        if (role.id === 4) {
            return Response.sendResponse(await Donation.findAll({
                where: {
                    AnnexId: idAnnex,
                    actif: true
                }
            }), 200);
        }
        return Response.sendResponse(await Donation.findAll({
            where: {
                AnnexId: idAnnex
            }
        }), 200);
    }

    static async getDonationById(idDonation) {
        return Response.sendResponse(await Donation.findOne({
            include: [{
                model: Requerir,
                include: {
                    model: Product,
                    include: {
                        model: Type
                    }
                },
            },
                {model: Annex}],
            where: {
                id: idDonation
            }
        }), 200);
    }

    static async answerDonation(donations, user, idDonation) {
        for (let i = 0; i < donations.length; i++) {
            const donation = await UserDonation.create({
                UserId: user.id,
                quantity: donations[i].quantity,
                ProductId: donations[i].productId,
                DonationId: idDonation,
                give: false
            });
            const d = Donation.findOne({
                where: {
                    id: idDonation
                }
            });
            const requerir = await Requerir.update({quantity: Sequelize.literal('quantityLeft -' + donations[i].quantity)}, {
                where: {
                    DonationId: idDonation,
                    ProductId: donations[i].productId
                }
            });
        }
        return Response.sendResponse(await new Message("Votre donation a bien été enregistré"), 200);
    }

    static async getPastDonations(user) {
        const response = [];
        const donationList = await Donation.findAll({
            where: {
                actif: true

            }
        });
        for (let i = 0; i < donationList.length; i++) {
            let don = {};
            const userDonation = await UserDonation.findAll({
                include: {
                    model: Product,
                    include: {
                        model: Type
                    }
                },
                where: {
                    DonationId: donationList[i].id,
                    UserId: user.id
                }
            });
            if (userDonation.length > 0) {
                don = {donation: donationList[i], gift: userDonation};
                response.push(don)
            }
        }
        return Response.sendResponse(await {donationHistory: response}, 200);
    }

    static async getUserRegisteredForDonation(idDonation) {
        const donation = await Donation.findOne({
            where: {
                id: idDonation,
                actif: true
            }
        });
        const userDonation = await UserDonation.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('UserId')), 'UserId'],
            ],
            where: {
                DonationId: idDonation,
            },
        });
        const users = [];
        for (let i = 0; i < userDonation.length; i++) {
            const user = await User.findOne({
                where: {
                    id: userDonation[i].UserId,
                    active: true
                }
            });
            if (user) {
                const us = user.dataValues;
                const report = Report.findOne({
                    where: {
                        reporter: "annex",
                        AnnexId: donation.AnnexId,
                        UserId: user.id
                    }
                });
                if (report) {
                    us.isReported = true;
                } else {
                    us.isReported = false;
                }
                users.push(us);
            }
        }
        return Response.sendResponse(users, 200);
    }

    static async getDonOfUser(idDonation, idUser) {
        const usDonation = await UserDonation.findAll({
            include: [{
                model: Product,
                include: {
                    model: Type
                }
            }],
            where: {
                DonationId: idDonation,
                UserId: idUser
            }
        })
        return Response.sendResponse(usDonation, 200);
    }

    static async setUserDonationGive(idUserDonation) {
        const usDonation = await UserDonation.update({give: true}, {
            where: {
                id: idUserDonation
            }
        });
        const usDon = await UserDonation.findOne({
            where: {
                id: idUserDonation
            }
        });
        const donation = await Donation.findOne({
            where: {
                id: usDon.DonationId
            }
        });
        const stock = await Stock.update({quantity: Sequelize.literal('quantity +' + usDon.quantity)}, {
            where: {
                ProductId: usDon.ProductId,
                AnnexId: donation.AnnexId
            }
        });
        return Response.sendResponse(await new Message("La donation est passée en statut donnée"), 200);
    }
}

module.exports = DonationController;
