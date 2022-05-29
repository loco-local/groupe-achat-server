module.exports = (sequelize, DataTypes) => {
    const UserOrders = sequelize.define('UserOrders', {
        totalPrice: DataTypes.DOUBLE,
        paymentMethod: DataTypes.STRING
    }, {
        paranoid: true
    })
    UserOrders.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Users)
        model.belongsTo(models.BuyGroupOrders)
        model.hasMany(models.UserOrderItems, {as: 'items'})
    }
    return UserOrders
}
