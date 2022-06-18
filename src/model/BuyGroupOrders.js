module.exports = (sequelize, DataTypes) => {
    const BuyGroupOrders = sequelize.define('BuyGroupOrders', {
        startDate: DataTypes.DATE,
        endDate: DataTypes.DATE,
        salePercentage: DataTypes.DOUBLE,
        additionalFees: DataTypes.TEXT,
        comment: DataTypes.TEXT
    });

    BuyGroupOrders.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.BuyGroups);
    };
    return BuyGroupOrders;
}
