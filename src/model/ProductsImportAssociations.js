module.exports = (sequelize, DataTypes) => {
    const ProductsImportAssociations = sequelize.define('ProductsImportAssociations', {
        provider: DataTypes.STRING,
        associations: DataTypes.JSON
    })
    ProductsImportAssociations.properties = {
        maker: "maker",
        name: "name",
        category: "category",
        internalCode: "internalCode",
        qtyInBox: "qtyInBox",
        format: "format",
        expectedCostUnitPrice: "expectedCostUnitPrice"
    }
    ProductsImportAssociations.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Members)
        model.belongsTo(models.BuyGroups)
    }
    ProductsImportAssociations.getForProviderAndBuyGroupId = async function (provider, buyGroupId) {
        return ProductsImportAssociations.findOne({
            where: {
                provider: provider,
                BuyGroupId: buyGroupId
            }
        })
    }
    return ProductsImportAssociations;
}
