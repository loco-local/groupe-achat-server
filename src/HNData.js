const internalCodeRegex = /^\d+/;
const makerRegex = /[A-Z]{3,}/;
const priceRegex = /\$?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)[\$]/g;
const legacyPriceRegex = /\d+\.[0-9]{2}\s\$/g
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
            provider: "Horizon Nature",
            isAvailable: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        while (!isEntryBuilt && lineIndex < lines.length) {
            let line = lines[lineIndex];
            const internalCode = HNData.getInternalCode(line);
            const maker = HNData.getMaker(line, internalCode)
            if (internalCode !== null && maker !== null) {
                entry.internalCode = internalCode;
                entry.maker = maker[0];
                entry.name = HNData.getName(line, entry.maker);
                let format = HNData.getFormat(line);
                if (format !== false) {
                    entry.format = format.format;
                    entry.qtyInBox = format.qtyInBox;
                }
                entry.expectedCostUnitPrice = HNData.getPrice(line);
                while (entry.expectedCostUnitPrice === null && lineIndex + 1 < lines.length) {
                    lineIndex++;
                    line = lines[lineIndex];
                    entry.expectedCostUnitPrice = HNData.getPrice(line);
                    if (format === false) {
                        format = HNData.getFormat(line);
                        entry.format = format.format;
                        entry.qtyInBox = format.qtyInBox;
                    }
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
    getMaker: function (line, internalCode) {
        if (internalCode === null) {
            return null;
        }
        let formatStartIndex = line.indexOf("(");
        if (formatStartIndex === -1) {
            formatStartIndex = line.length
        }
        const lineAfterInternalCode = line.substring(line.indexOf(internalCode) + internalCode.length + 1, formatStartIndex).trim();
        return lineAfterInternalCode.match(makerRegex);
    },
    getName: function (line, maker) {
        let formatStartIndex = line.indexOf("(");
        if (formatStartIndex === -1) {
            formatStartIndex = line.length
        }
        return line.substring(line.indexOf(maker) + maker.length + 1, formatStartIndex).trim();
    },
    getFormat: function (line) {
        if (line.indexOf("(") === -1) {
            return false;
        }
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
            price = line.match(legacyPriceRegex);
        }
        if (price === null) {
            return null;
        }
        price = price[0];
        price = price.replaceAll(",", ".");
        price = price.replaceAll(" ", "");
        price = price.replaceAll("$", "");
        return parseFloat(price);
    }
}
module.exports = HNData
