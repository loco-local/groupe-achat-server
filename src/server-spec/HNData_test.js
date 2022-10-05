const HNData = require("../HNData");

describe('HNData', () => {
    it("retrieves internal code", async () => {
        const entries = HNData.linesToEntries(
            ["Sec 51060 ABK Abricots Bio (2.5kg)"]
        );
        entries["51060"].internalCode.should.equal("51060");
    });
    it("retrieves maker", async () => {
        const entries = HNData.linesToEntries([
            "Sec 51060 ABK Abricots Bio (2.5kg)",
            "Sec 87651 BONE Bouillon D'Os Instant Thaï Noix De Coco (9x80g) SG SO 814574001871 1 n/d 60.00 $ 9.99 $"
        ])
        entries["51060"].maker.should.equal("ABK");
        entries["87651"].maker.should.equal("BONE");
    });
    it("retrieves name", async () => {
        const entries = HNData.linesToEntries([
            "Sec 51060 ABK Abricots Bio (2.5kg)",
            "Sec 87651 BONE Bouillon D'Os Instant Thaï Noix De Coco (9x80g) SG SO 814574001871 1 n/d 60.00 $ 9.99 $"
        ])
        entries["51060"].name.should.equal("Abricots Bio");
        entries["87651"].name.should.equal("Bouillon D'Os Instant Thaï Noix De Coco");
    });
    it("retrieves format", async () => {
        const entries = HNData.linesToEntries([
            "Sec 51060 ABK Abricots Bio (2.5kg)",
            "Sec 87651 BONE Bouillon D'Os Instant Thaï Noix De Coco (9x80g) SG SO 814574001871 1 n/d 60.00 $ 9.99 $"
        ])
        entries["51060"].format.should.equal("2.5kg");
        entries["51060"].qtyInBox.should.equal(1);
        entries["87651"].format.should.equal("80g");
        entries["87651"].qtyInBox.should.equal("9");
    });
    it("retrieves price", async () => {
        const entries = HNData.linesToEntries([
            "Sec 51190 ABK Raisins Sultana Bio (2.5kg)",
            "B SO",
            "1 n/d 15.95 $ 22.79 $",
            "Sec 87651 BONE Bouillon D'Os Instant Thaï Noix De Coco (9x80g) SG SO 814574001871 1 n/d 60.00 $ 9.99 $",
        ])
        entries["87651"].expectedCostUnitPrice.should.equal("60.00");
        entries["51190"].expectedCostUnitPrice.should.equal("15.95");
    });
    it("discards incorrect entries", async () => {
        const entries = HNData.linesToEntries([
            "Bone Brewhouse",
            "Sec 51060 ABK Abricots Bio (2.5kg)",
            "Caisse Prix / Unité Prix / Caisse PDS"
        ])
        Object.values(entries).length.should.equal(1);
    });
});
