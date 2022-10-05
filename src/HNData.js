const internalCodeRegex = /^\d+/;
const makerRegex = /[A-Z]{3,}/;
const priceRegex = /\d+\.[0-9]{2}\s\$/g
const HNData = {
    linesToEntries: function (lines) {
        const entries = {}
        let entryInfo = HNData.getNextEntry(lines)
        while (entryInfo !== false) {
            entries[entryInfo.entry.internalCode] = entryInfo.entry;
            lines = lines.slice(entryInfo.nbLinesRemoved);
            entryInfo = this.getNextEntry(lines);
        }
        return entries;
    },
    getNextEntry: function (lines) {
        let isEntryBuilt = false;
        let lineIndex = 0;
        const entry = {
            provider: "HN",
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        while (!isEntryBuilt && lineIndex < lines.length) {
            let line = lines[lineIndex];
            const internalCode = HNData.getInternalCode(line);
            if (internalCode !== null) {
                entry.internalCode = internalCode;
                entry.maker = line.match(makerRegex)[0];
                entry.name = HNData.getName(line, entry.maker);
                const format = HNData.getFormat(line);
                entry.format = format.format;
                entry.qtyInBox = format.qtyInBox;
                entry.expectedCostUnitPrice = HNData.getPrice(line);
                if (entry.expectedCostUnitPrice === null && lineIndex + 2 < lines.length) {
                    lineIndex += 2;
                    line = lines[lineIndex];
                    entry.expectedCostUnitPrice = HNData.getPrice(line);
                }
                isEntryBuilt = true;
            }
            lineIndex++;
        }
        if (!isEntryBuilt) {
            return false;
        }
        return {
            entry: entry,
            nbLinesRemoved: lineIndex
        }
    },
    getInternalCode: function (line) {
        const firstWordRemovedLine = line.substring(line.indexOf(" ") + 1);
        const internalCode = firstWordRemovedLine.match(internalCodeRegex);
        return internalCode === null ? internalCode : internalCode[0];
    },
    getName: function (line, maker) {
        return line.substring(line.indexOf(maker) + maker.length + 1, line.indexOf("(")).trim();
    },
    getFormat: function (line) {
        let format = line.substring(line.indexOf("(") + 1, line.indexOf(")")).trim();
        if (format.indexOf("x") > -1) {
            return {
                format: format.substring(format.indexOf("x") + 1),
                qtyInBox: format.substring(0, format.indexOf("x"))
            }
        } else {
            return {
                format: format,
                qtyInBox: 1
            }
        }
    },
    getPrice: function (line) {
        let price = line.match(priceRegex);
        if (price === null) {
            return null;
        }
        price = price[0];
        return price.substring(0, price.indexOf(" "));
    }
}
module.exports = HNData
