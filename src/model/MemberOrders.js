module.exports = (sequelize, DataTypes) => {
    const MemberOrders = sequelize.define('MemberOrders', {
        costPriceTotal: DataTypes.DOUBLE,
        costPriceTotalUponReceipt: DataTypes.DOUBLE,
        priceTotal: DataTypes.DOUBLE,
        priceTotalUponReceipt: DataTypes.DOUBLE,
        paymentMethod: DataTypes.STRING
    }, {
        paranoid: true
    })
    MemberOrders.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Members)
        model.belongsTo(models.BuyGroupOrders)
        model.hasMany(models.MemberOrderItems, {as: 'items'})
    }
    return MemberOrders
}
