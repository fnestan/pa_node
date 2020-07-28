module.exports = function(sequelize, DataTypes) {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        active: DataTypes.BOOLEAN
    }, {});
    Product.associate = (models) => {
        Product.belongsTo(models.Type);
        Product.hasMany(models.Requerir);
    };
    return Product;
};
