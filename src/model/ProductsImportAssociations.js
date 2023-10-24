module.exports = (sequelize, DataTypes) => {
    const ProductsImportAssociations = sequelize.define('ProductsImportAssociations', {
        Provider: DataTypes.STRING,
        Association: DataTypes.JSON
    })
    ProductsImportAssociations.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Members)
        model.belongsTo(models.BuyGroups)
    }
    return ProductsImportAssociations;
}
