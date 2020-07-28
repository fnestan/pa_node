const bodyParser = require('body-parser');
const SearchController = require('../controllers').SearchController;
const AuthMiddleware = require('../middlewares/auth.middleware');
const {QueryTypes} = require('sequelize');

module.exports = function (app) {

    /* app.get('/search/all/annexes', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
         try {
             const allAnnexes = await SearchController.getAllAnnexes();
             res.status(200).json(allAnnexes);
         } catch (err) {
             console.log(err);
             res.status(409).json(err);
         }
     });

     app.get('/search/all/associations', bodyParser.json(), AuthMiddleware.auth(), async (req, res) => {
         try {
             const allAssociations = await SearchController.getAllAssociations();
             res.status(200).json(allAssociations);
         } catch (err) {
             console.log(err);
             res.status(409).json(err);
         }
     });

     app.get('/search/all/User', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
         try {
             const allUsers = await SearchController.getAllUsers();
             res.status(200).json(allUsers);
         } catch (err) {
             console.log(err);
             res.status(409).json(err);
         }
     });

     app.get('/search/all/AnnexAvailability', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
         try {
             const allAnnexAvailabilities = await SearchController.getAllAnnexAvailabilities();
             res.status(200).json(allAnnexAvailabilities);
         } catch (err) {
             console.log(err);
             res.status(409).json(err);
         }
     });

     app.get('/search/all/Day', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
         try {
             const allDays = await SearchController.getAllDays();
             res.status(200).json(allDays);
         } catch (err) {
             console.log(err);
             res.status(409).json(err);
         }
     });

     app.get('/search/all/Image', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
         try {
             const allImages = await SearchController.getAllImages();
             res.status(200).json(allImages);
         } catch (err) {
             console.log(err);
             res.status(409).json(err);
         }
     });

     app.get('/search/all/Report', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
         try {
             const allReports = await SearchController.getAllReports();
             res.status(200).json(allReports);
         } catch (err) {
             console.log(err);
             res.status(409).json(err);
         }
     });

     app.get('/search/all/Role', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
         try {
             const allRoles = await SearchController.getAllRoles();
             res.status(200).json(allRoles);
         } catch (err) {
             console.log(err);
             res.status(409).json(err);
         }
     });

     app.get('/search/all/Service', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
         try {
             const allServices = await SearchController.getAllServices();
             res.status(200).json(allServices);
         } catch (err) {
             console.log(err);
             res.status(409).json(err);
         }
     });*/

    app.get('/search/all/tables', AuthMiddleware.isAdmin(), async (req, res) => {
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

    app.put('/search/all/:table', bodyParser.json(), AuthMiddleware.isAdmin(), async (req, res) => {
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
                const needList = await SearchController.searchNeed(req.body.name);
                res.status(201).json(needList);
            } catch (err) {
                console.log(err)
                res.status(409).end();
            }
        } else {
            res.status(400).end();
        }
    });
};
