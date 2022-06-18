const indexes = {
    maker: 1,
    name: 2,
    category: 3,
    internalCode: 4,
    qtyInBox: 6,
    format: 7,
    costPrice: 8
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
            internalCode: data[SatauData._properyName(indexes.internalCode)].trim(),
            qtyInBox: data[SatauData._properyName(indexes.qtyInBox)],
            format: data[SatauData._properyName(indexes.format)],
            costPrice: data[SatauData._properyName(indexes.costPrice)],
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
