module.exports = (sequelize, DataTypes) => {
    const BuyGroupOrders = sequelize.define('BuyGroupOrders', {
        startDate: DataTypes.DATE,
        endDate: DataTypes.DATE
    });

    BuyGroupOrders.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.BuyGroups);
    };
    return BuyGroupOrders;
}
