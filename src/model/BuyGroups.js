module.exports = (sequelize, DataTypes) => {
    const BuyGroups = sequelize.define('BuyGroups', {
        name: DataTypes.STRING,
        salePercentage: DataTypes.DOUBLE,
        path: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        indexes: [{
            unique: true,
            fields: ['path']
        }]
    });
    return BuyGroups;
}
