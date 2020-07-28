'use strict';
module.exports = (sequelize, DataTypes) => {
    const Annex  = sequelize.define('Annex', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        zipCode: DataTypes.STRING,
        street: DataTypes.STRING,
        city: DataTypes.STRING,
        description: DataTypes.STRING,
        phone: DataTypes.INTEGER,
        active: DataTypes.BOOLEAN,
        valid: DataTypes.BOOLEAN,
    }, {});
    Annex.associate = function (models) {
        Annex.belongsTo(models.Association);
        Annex.hasMany(models.AnnexAvailability);
        Annex.hasMany(models.Service);
        Annex.belongsToMany(models.User, {through: 'manager'});
        Annex.belongsToMany(models.Image, {through: 'annexImage'});


    };
    return Annex;
};
