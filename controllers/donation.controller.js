const models = require('../models');
const Annex = models.Annex;
const Association = models.Association;
const UserDonation = models.UserDonation;
const Donation = models.Donation;
const Product = models.Product;
const Requerir = models.Requerir;
const Response = require('../helpers').Response;
const Message = require('../helpers').Response;
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
            const productRequest = await Product.findOne({
                where: {
                    id: products[i].idProduct
                }
            })
            if (productRequest) {
                const requerir = await Requerir.create({
                    quantity: products[i].quantity,
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
        return Response.sendResponse(await await Donation.update({status: true}, {
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
    static async deleteDonation(idDonation) {
        return Response.sendResponse(await Donation.update({actif: false}, {
            where: {
                id: idDonation
            }
        }), 200);
    }

    static async getDonationList(idAnnex, user) {
        const role = await user.getRole();
        if (role.id === 4) {
            return Response.sendResponse(await await Donation.findAll({
                where: {
                    AnnexId: idAnnex,
                    actif: true
                }
            }), 200);
        }
        return Response.sendResponse(await await Donation.findAll({
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
            console.log(donations[i].productId)
            const donation = await UserDonation.create({
                UserId: user.id,
                quantity: donations[i].quantity,
                ProductId: donations[i].productId,
                DonationId: idDonation,
                give: false
            });
            const requerir = await Requerir.update({quantity: Sequelize.literal('quantity -' + donations[i].quantity)}, {
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
}

module.exports = DonationController;
