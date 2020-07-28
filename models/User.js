'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lastname: DataTypes.STRING,
        firstname: DataTypes.STRING,
        login: DataTypes.STRING,
        password: DataTypes.STRING,
        email: DataTypes.STRING,
        zipCode: DataTypes.STRING,
        street: DataTypes.STRING,
        city: DataTypes.STRING,
        phone: DataTypes.INTEGER,
        birthdate: DataTypes.DATE,
        active: DataTypes.BOOLEAN,
        token: DataTypes.STRING,
        validForVolunteer: DataTypes.STRING,
        validForUser: DataTypes.STRING

    }, {});
    User.associate = function (models) {
        User.belongsTo(models.Role);
        User.belongsToMany(models.Annex, {through: 'manager'});
        User.belongsToMany(models.Service, {through: 'repondre'});
        User.belongsToMany(models.Image, {through: 'userImage'});
    }
    return User;
};
