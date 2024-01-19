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
            "SEC 51266 ABK Abricots Bio (12.5kg) Vrac B SO vrac 1 n/d 185,36$ 264,80$",
            "Sec 87651 BONE Bouillon D'Os Instant Thaï Noix De Coco (9x80g) SG SO 814574001871 1 n/d 60.00 $ 9.99 $"
        ])
        entries["51266"].maker.should.equal("ABK");
        entries["87651"].maker.should.equal("BONE");
    });
    it("retrieves name", async () => {
        const entries = HNData.linesToEntries([
            "SEC 51266 ABK Abricots Bio (12.5kg) Vrac B SO vrac 1 n/d 185,36$ 264,80$",
            "Sec 87651 BONE Bouillon D'Os Instant Thaï Noix De Coco (9x80g) SG SO 814574001871 1 n/d 60.00 $ 9.99 $"
        ])
        entries["51266"].name.should.equal("Abricots Bio");
        entries["87651"].name.should.equal("Bouillon D'Os Instant Thaï Noix De Coco");
    });
    it("retrieves format", async () => {
        const entries = HNData.linesToEntries([
            "SEC 51266 ABK Abricots Bio (12.5kg) Vrac B SO vrac 1 n/d 185,36$ 264,80$",
            "Sec 87651 BONE Bouillon D'Os Instant Thaï Noix De Coco (9x80g) SG SO 814574001871 1 n/d 60.00 $ 9.99 $"
        ])
        entries["51266"].format.should.equal("12.5kg");
        entries["51266"].qtyInBox.should.equal(1);
        entries["87651"].format.should.equal("80g");
        entries["87651"].qtyInBox.should.equal("9");
    });
    it("retrieves price", async () => {
        const entries = HNData.linesToEntries([
            "Sec 51090 ABK Raisins Enrobés De Yogourt (6x350g) 067486168051",
            "1 n/d 22.67 $ 5.39 $",
            "Sec 51190 ABK Raisins Sultana Bio (2.5kg)",
            "B SO",
            "1 n/d 15.95 $ 22.79 $",
            "Sec 87651 BONE Bouillon D'Os Instant Thaï Noix De Coco (9x80g) SG SO 814574001871 1 n/d 60.00 $ 9.99 $",
        ])
        entries["51090"].expectedCostUnitPrice.should.equal(22.67);
        entries["87651"].expectedCostUnitPrice.should.equal(60.00);
        entries["51190"].expectedCostUnitPrice.should.equal(15.95);
    });
    it("discards incorrect entries", async () => {
        const entries = HNData.linesToEntries([
            "Bone Brewhouse",
            "Septembre 2022",
            "Sec 51060 ABK Abricots Bio (2.5kg)",
            "Caisse Prix / Unité Prix / Caisse PDS"
        ])
        Object.values(entries).length.should.equal(1);
    });
    it("can parse price with comma and no space between dollar sign and amount", async () => {
        const price = HNData.getPrice("1 n/d 95,74$ 34,19$");
        price.should.equal(95.74)
    })
    it("can get price when price is 3 lines after internal code", async () => {
        const entries = HNData.linesToEntries([
            "SEC 50005 ABK Café Moulu Corsé Bio & Équitable",
            "(4x908g)",
            "B SO 067486320107",
            "1 n/d 95,74$ 34,19$",
        ])
        Object.keys(entries).length.should.equal(1);
        entries["50005"].expectedCostUnitPrice.should.equal(95.74);
    })
});
