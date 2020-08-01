const bodyParser = require('body-parser');
const SearchController = require('../controllers').SearchController;
const AuthMiddleware = require('../middlewares/auth.middleware');
const {QueryTypes} = require('sequelize');
const Message = require('../helpers/errormessage');

module.exports = function (app) {


    app.get('/search/all/tableNames', AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const tableNames = await app['s'].query("SELECT table_name FROM information_schema.tables WHERE table_type ='BASE TABLE'", {type: QueryTypes.SELECT});
            res.status(200).json(tableNames);
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });

    app.get('/search/all/:table', AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const columns = await app['s'].query("SHOW COLUMNS FROM `" + req.params.table + "`", {type: QueryTypes.SELECT});
            const tableData = await app['s'].query("SELECT * FROM `" + req.params.table + "`", {type: QueryTypes.SELECT});
            res.status(200).json({columns, data: tableData});
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });

    app.put('/update/:table', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
        try {
            const data = req.body;
            const values = Object.entries(data.values).map(([key, value]) => `${key} = "${value}"`).join(',');
            const tableData = await app['s'].query(`UPDATE ${req.params.table} SET ${values} WHERE id = ${data.id} `, {type: QueryTypes.UPDATE});
            res.status(200).json(tableData);
        } catch (err) {
            console.log(err);
            res.status(409).json(err);
        }
    });

    app.post('/search/all/needs', bodyParser.json(), async (req, res) => {
        if (req.body.name) {
            try {
                const response = await SearchController.searchNeed(req.body.name);
                res.status(response[1]).json(response[0]);
            } catch (err) {
                console.log(err)
                res.status(409).json(new Message(err.toString()));
            }
        } else {
            res.status(400).json(new Message("Veuillez renseigner un nom"));
        }
    });
};
