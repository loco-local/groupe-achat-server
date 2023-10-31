const StringParser = require("./StringParser");
const {ProductsImportAssociations} = require("./model");
const properties = ProductsImportAssociations.properties;
const defaultAssociations = {};
defaultAssociations[properties.maker] = "__EMPTY_1";
defaultAssociations[properties.name] = "__EMPTY_3";
defaultAssociations[properties.category] = "__EMPTY_2";
defaultAssociations[properties.internalCode] = "Date de livraison:";
defaultAssociations[properties.qtyInBox] = "__EMPTY_7";
defaultAssociations[properties.format] = "__EMPTY_8";
defaultAssociations[properties.expectedCostUnitPrice] = "__EMPTY_9";

const SatauData = {
    defaultAssociations: defaultAssociations,
    formatEntries: function (entries, productsAssociations) {
        const associations = productsAssociations.associations;
        return entries.reduce((formattedEntries, entry) => {
            const formatted = SatauData.formatEntry(entry, associations);
            formattedEntries[formatted.internalCode] = formatted;
            return formattedEntries;
        }, {});
    },
    formatEntry: function (data, associations) {
        let qtyInBox = StringParser.getQty(data[associations.qtyInBox]);
        if (qtyInBox === null) {
            qtyInBox = 1;
        }
        return {
            provider: "Satau",
            name: data[associations.name],
            category: data[associations.category],
            maker: data[associations.maker],
            internalCode: data[associations.internalCode].trim(),
            qtyInBox: qtyInBox,
            format: data[associations.format],
            expectedCostUnitPrice: StringParser.getQty(data[associations.expectedCostUnitPrice]),
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }
}
module.exports = SatauData
