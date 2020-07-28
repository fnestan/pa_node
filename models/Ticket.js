'use strict';
module.exports = (sequelize, DataTypes) => {
    const Ticket  = sequelize.define('Ticket', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        number: DataTypes.INTEGER,
        label: DataTypes.STRING,
        creationDate: DataTypes.DATE,
        active: DataTypes.BOOLEAN

    }, {});
    Ticket.associate = function (models) {
        Ticket.belongsTo(models.User);
        Ticket.hasMany(models.Message);


    };
    return Ticket;
};
