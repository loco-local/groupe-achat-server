module.exports = (sequelize, DataTypes) => {
    const MemberOrderItems = sequelize.define('MemberOrderItems', {
        description: DataTypes.STRING,
        expectedQuantity: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,
        costPrice: DataTypes.DOUBLE,
        costPriceTotal: DataTypes.DOUBLE,
        costPriceUponReceipt: DataTypes.DOUBLE,
        costPriceTotalUponReceipt: DataTypes.DOUBLE,
        expectedPrice: DataTypes.DOUBLE,
        expectedTotal: DataTypes.DOUBLE,
        expectedTotalAfterRebate: DataTypes.DOUBLE,
        expectedTotalAfterRebateWithTaxes: DataTypes.DOUBLE,
        price: DataTypes.DOUBLE,
        total: DataTypes.DOUBLE,
        totalAfterRebate: DataTypes.DOUBLE,
        totalAfterRebateWithTaxes: DataTypes.DOUBLE,
        rebates: DataTypes.JSON,
        tvq: DataTypes.DOUBLE,
        tps: DataTypes.DOUBLE,
        info: DataTypes.JSON,
        internalCode: DataTypes.STRING,
        provider: DataTypes.STRING,
        maker: DataTypes.STRING,
        category: DataTypes.STRING,
        qtyInBox: DataTypes.STRING,
        format: DataTypes.STRING
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
    MemberOrderItems.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Products)
        model.belongsTo(models.MemberOrders)
    }
    return MemberOrderItems
}
