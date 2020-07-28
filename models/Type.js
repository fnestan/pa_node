module.exports = function (sequelize, DataTypes) {

    const Type = sequelize.define('Type', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey : true,
            autoIncrement : true
        },
        token: {
            type: DataTypes.STRING
        },
    }, {});
    Type.associate = function (model) {
        Type.hasMany(model.Product)
    };
    return Type;
};
