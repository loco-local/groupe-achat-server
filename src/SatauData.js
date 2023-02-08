const StringParser = require("./StringParser");
const indexes = {
    maker: 1,
    name: 3,
    category: 2,
    internalCode: "Date de livraison:",
    qtyInBox: 7,
    format: 8,
    expectedCostUnitPrice: 9
}
const SatauData = {
    formatEntries: function (entries) {
        return entries.reduce((formattedEntries, entry) => {
            const formatted = SatauData.formatEntry(entry);
            formattedEntries[formatted.internalCode] = formatted;
            return formattedEntries;
        }, {});
    },
    formatEntry: function (data) {
        return {
            provider: "Satau",
            name: data[SatauData._properyName(indexes.name)],
            category: data[SatauData._properyName(indexes.category)],
            maker: data[SatauData._properyName(indexes.maker)],
            internalCode: data[indexes.internalCode].trim(),
            qtyInBox: StringParser.getQty(data[SatauData._properyName(indexes.qtyInBox)]),
            format: data[SatauData._properyName(indexes.format)],
            expectedCostUnitPrice: StringParser.getQty(data[SatauData._properyName(indexes.expectedCostUnitPrice)]),
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    },
    _properyName: function (index) {
        return "__EMPTY_" + index
    }
}
module.exports = SatauData
