module.exports = function(sequelize, DataTypes) {
    const Requerir = sequelize.define('Requerir', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        quantity: DataTypes.FLOAT
    }, {});
    Requerir.associate = (models) => {
        Requerir.belongsTo(models.Product);
        Requerir.belongsTo(models.Donation);
    };
    return Requerir;
};
