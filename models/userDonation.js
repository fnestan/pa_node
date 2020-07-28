module.exports = function(sequelize, DataTypes) {
    const UserDonation = sequelize.define('UserDonation', {
        quantity: DataTypes.FLOAT,
        give: DataTypes.BOOLEAN
    }, {});
    UserDonation.associate = (models) => {
        UserDonation.belongsTo(models.Product);
        UserDonation.belongsTo(models.Donation);
        UserDonation.belongsTo(models.User);
    };
    return UserDonation;
};
