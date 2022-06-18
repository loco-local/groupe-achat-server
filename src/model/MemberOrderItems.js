module.exports = (sequelize, DataTypes) => {
    const MemberOrderItems = sequelize.define('MemberOrderItems', {
        description: DataTypes.STRING,
        quantity: DataTypes.INTEGER,
        costPrice: DataTypes.DOUBLE,
        costPriceTotal: DataTypes.DOUBLE,
        costPriceUponReceipt: DataTypes.DOUBLE,
        costPriceUponReceiptTotal: DataTypes.DOUBLE,
        atOrderPrice: DataTypes.DOUBLE,
        atOrderTotalPrice: DataTypes.DOUBLE,
        atOrderTotalPriceUponReceipt: DataTypes.DOUBLE,
        atOrderAfterRebateTotalPrice: DataTypes.DOUBLE,
        atOrderAfterRebateTotalPriceUponReceipt: DataTypes.DOUBLE,
        atOrderTotalPriceAfterRebateWithTaxes: DataTypes.DOUBLE,
        atOrderTotalPriceAfterRebateWithTaxesUponReceipt: DataTypes.DOUBLE,
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
