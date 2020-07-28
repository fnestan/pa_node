'use strict';
module.exports = (sequelize, DataTypes) => {
    const Service = sequelize.define('Service', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date_service: DataTypes.DATE,
        nom: DataTypes.STRING,
        description: DataTypes.STRING,
        quantite: DataTypes.INTEGER,
        status: DataTypes.BOOLEAN,
        actif: DataTypes.BOOLEAN,
    }, {});
    Service.associate = function (models) {
        Service.belongsTo(models.Annex);
        Service.belongsToMany(models.User, {through: 'repondre'});
    };
    return Service;
};
