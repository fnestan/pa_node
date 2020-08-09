module.exports = function(sequelize, DataTypes) {
    const Stock = sequelize.define('Stock', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        quantity: DataTypes.INTEGER,
    }, {});
    Stock.associate = (models) => {
        Stock.belongsTo(models.Product);
        Stock.belongsTo(models.Annex);
    };
    return Stock;
};
