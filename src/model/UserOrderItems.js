module.exports = (sequelize, DataTypes) => {
    const UserOrderItems = sequelize.define('UserOrderItems', {
        description: DataTypes.STRING,
        quantity: DataTypes.INTEGER,
        price: DataTypes.DOUBLE,
        totalPrice: DataTypes.DOUBLE,
        info: DataTypes.JSON,
        tvq: DataTypes.DOUBLE,
        tps: DataTypes.DOUBLE,
        totalPriceAfterRebate: DataTypes.DOUBLE,
        rebates: DataTypes.JSON
    }, {
        paranoid: true,
        indexes: [{
            fields: ['updatedAt']
        }]
    })
    /*
    rebates:[{
      amount: DataTypes.DOUBLE,
      code: Datatypes.String
    }]
    */
    UserOrderItems.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Products)
        model.belongsTo(models.UserOrders)
    }
    return UserOrderItems
}
