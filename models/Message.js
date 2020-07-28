'use strict';
module.exports = (sequelize, DataTypes) => {
    const Message  = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: DataTypes.STRING,
        sendDate: DataTypes.DATE,

    }, {});
    Message.associate = function (models) {
        Message.belongsTo(models.User, {as:"redactor"});
        Message.belongsTo(models.Ticket);


    };
    return Message;
};
