'use strict';
module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        link: DataTypes.STRING,
    }, {});
    Image.associate = function (models) {
    };
    return Image;
};
