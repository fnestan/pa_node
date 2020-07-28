'use strict';
module.exports = (sequelize, DataTypes) => {
    const AnnexAvailability = sequelize.define('AnnexAvailability', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        openingTime: DataTypes.TIME,
        closingTime: DataTypes.TIME,
    }, {});
    AnnexAvailability.associate = function(models) {
        AnnexAvailability.belongsTo(models.Annex);
        AnnexAvailability.belongsTo(models.Day);
    };
    return AnnexAvailability;
};
