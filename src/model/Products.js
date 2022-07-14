module.exports = (sequelize, DataTypes) => {
    const Products = sequelize.define('Products', {
        name: DataTypes.STRING,
        provider: DataTypes.STRING,
        maker: DataTypes.STRING,
        category: DataTypes.STRING,
        internalCode: {
            type: DataTypes.STRING,
            unique: true
        },
        qtyInBox: DataTypes.STRING,
        format: DataTypes.STRING,
        expectedCostUnitPrice: DataTypes.DOUBLE,
        isPriceInKg: DataTypes.BOOLEAN,
        hasTPS: DataTypes.BOOLEAN,
        hasTVQ: DataTypes.BOOLEAN,
        isVisibleForSuperVolunteerOnly: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        image: DataTypes.JSONB,
        nbInStock: DataTypes.DOUBLE,
        isAvailable: DataTypes.BOOLEAN,
        hasDecimalQuantity: DataTypes.BOOLEAN,
        isPutForward: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
    }, {
        indexes: [{
            fields: ['internalCode', 'isPutForward', 'BuyGroupId']
        }]
    })
    Products.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.BuyGroups);
    };
    return Products;
}
