const Sequelize = require('sequelize');
const op = Sequelize.Op;
const operatorsAliases = {
    $eq: op.eq,
    $or: op.or,
}
const models = require('../models');
const Product = models.Product;


class ProductController {

    /**
     * @param id
     * @param name
     * @returns {Promise<Product>}
     */
    static create(id, name) {
        return Product.create({
            TypeId: id,
            name
        });
    }

    /**
     * @param name
     * @returns {Promise<Product>}
     */
    static searchProduct(name) {
        return Product.findAll({
            where: {
                name: {
                    [op.like]: name+'%'
                }
            }
        })
    }

    /**
     *
     * @param productId
     * @returns {Promise<void>}
     */
    static async banProduct(productId) {
        return Product.update({active: false}, {
            where: {
                id: productId
            }
        });
    }
}

module.exports = ProductController;
