module.exports = (sequelize, DataTypes) => {
    const Products = sequelize.define('Products', {
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        price: DataTypes.DOUBLE,
        isPriceInKg: DataTypes.BOOLEAN,
        isTaxable: DataTypes.BOOLEAN,
        image: DataTypes.JSONB,
        nbInStock: DataTypes.DOUBLE,
        isAvailable: DataTypes.BOOLEAN,
        hasDecimalQuantity: DataTypes.BOOLEAN
    })
    return Products;
}
