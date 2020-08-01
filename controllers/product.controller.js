const Sequelize = require('sequelize');
const op = Sequelize.Op;
const models = require('../models');
const Product = models.Product;
const Message = require('../helpers/errormessage');
const Response = require('../helpers/response.js');


class ProductController {

    /**
     * @param id
     * @param name
     * @returns {[*, *]}
     */
    static create(id, name) {
        return Response.sendResponse(Product.create({
            TypeId: id,
            name
        }), 201);
    }

    /**
     * @param name
     * @returns {[*, *]}
     */
    static searchProduct(name) {
        return Response.sendResponse(Product.findAll({
            where: {
                name: {
                    [op.like]: name + '%'
                }
            }
        }), 200);
    }

    /**
     *
     * @param productId
     * @returns {Promise<[*, *]>}
     */
    static async deleteProduct(productId) {
        const product = await Product.update({active: false}, {
            where: {
                id: productId
            }
        });
        return Response.sendResponse(new Message("Le produit a bien été supprimé"), 200)
    }
}

module.exports = ProductController;
