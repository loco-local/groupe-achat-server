module.exports = (sequelize, DataTypes) => {
    const GroupOrderAllBillsFees = sequelize.define('GroupOrderAllBillsFees', {
        quantity: DataTypes.DOUBLE,
        total: DataTypes.DOUBLE,
        tps: DataTypes.DOUBLE,
        tvq: DataTypes.DOUBLE
    });

    GroupOrderAllBillsFees.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.BuyGroupOrders);
        model.belongsTo(models.Products);
    };
    return GroupOrderAllBillsFees;
}
