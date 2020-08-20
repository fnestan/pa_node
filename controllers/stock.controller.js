const models = require('../models');
const Stock = models.Stock;
const Product = models.Product;
const Annex = models.Annex;
const Type = models.Type;
const Sequelize = require('sequelize');
const Response = require('../helpers/response');
const Message = require('../helpers/errormessage');

const util = require('util')

class StockController {

    static async getStock(annexId) {
        const stock = await Stock.findAll({

            include: [
                {
                    model: Product,
                    include: Type
                },
                {model: Annex}
            ],
            where: {
                AnnexId: annexId
            }
        })
        return Response.sendResponse(stock, 200);
    }


    static async updateQuantity(id, quantity) {
        const stock = await Stock.update({quantity: quantity}, {
            where: {
                id: id
            }
        });
        return Response.sendResponse(await new Message("La quantité de produit à été modifié"), 200);
    }


}


module.exports = StockController;
