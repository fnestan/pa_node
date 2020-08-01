const bodyParser = require('body-parser');
const ProductController = require('../controllers').ProductController;
const AuthMiddleware = require('../middlewares/auth.middleware');
const Message = require('../helpers/errormessage');


module.exports = function (app) {

    // create a product
    app.post('/product/create', AuthMiddleware.isManager(), bodyParser.json(), async (req, res) => {
        if (req.body.name && req.body.TypeId) {
            try {
                const response = await ProductController.create(req.body.TypeId, req.body.name);
                res.status(response[1]).json(response[0]);
            } catch (err) {
                res.status(409).json(new Message(err.toString()));
            }
        } else {
            res.status(400).json(new Message("Veuillez renseignez les champs"));
        }
    });

    app.post('/product/searchProduct', bodyParser.json(), async (req, res) => {
        if (req.body.name) {
            try {
                const response = await ProductController.searchProduct(req.body.name);
                res.status(response[1]).json(response[0]);
            } catch (err) {
                res.status(409).json(new Message(err.toString()));
            }
        } else {
            res.status(400).json(new Message("Veuillez renseignez les champs"));
        }
    });

    /**
     *
     */
    app.get("/product/ban/:idProduct", AuthMiddleware.isAdmin(), bodyParser.json(), async (req, res) => {
        try {
            const response = await ProductController.deleteProduct(req.params.id);
            res.status(response[1]).json(response[0]);
        } catch (err) {
            res.status(409).json(err);
        }
    });
};
