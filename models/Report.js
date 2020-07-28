'use strict';
module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {
        reporter: DataTypes.STRING,
    }, {});
    Report.associate = function (models) {
        Report.belongsTo(models.Annex);
        Report.belongsTo(models.User);
    };
    return Report;
};
