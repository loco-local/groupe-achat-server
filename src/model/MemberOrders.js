module.exports = (sequelize, DataTypes) => {
    const MemberOrders = sequelize.define('MemberOrders', {
        expectedPriceTotal: DataTypes.DOUBLE,
        costPriceTotal: DataTypes.DOUBLE,
        expectedTotal: DataTypes.DOUBLE,
        total: DataTypes.DOUBLE,
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
