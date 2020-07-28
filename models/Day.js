'use strict';
module.exports = (sequelize, DataTypes) => {
    const Day = sequelize.define('Day', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
    }, {});
    Day.associate = function (models) {
        Day.hasMany(models.AnnexAvailability);
    };
    return Day;
};
