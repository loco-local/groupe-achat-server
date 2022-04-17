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
        price: DataTypes.DOUBLE,
        isPriceInKg: DataTypes.BOOLEAN,
        isTaxable: DataTypes.BOOLEAN,
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
            fields: ['internalCode', 'isPutForward']
        }]
    })
    return Products;
}
