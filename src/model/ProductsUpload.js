module.exports = (sequelize, DataTypes) => {
    const ProductsUpload = sequelize.define('ProductsUpload', {
        rawData: DataTypes.JSONB,
        formattedData: DataTypes.JSONB,
        isAccepted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        uuid: DataTypes.STRING
    }, {
        indexes: [{
            fields: ['uuid']
        }]
    })
    ProductsUpload.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.Users)
    }
    return ProductsUpload;
}
