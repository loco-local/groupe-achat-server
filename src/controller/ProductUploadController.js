const uuid = require("uuid");
const path = require("path");
const xlsx = require("xlsx");
const SatauData = require("../SatauData");
const {Products, ProductsUpload} = require("../model");
const HNData = require("../HNData");
const ProductUploadController = {
    uploadSatauProducts: async (req, res) => {
        let uploadedFile = req.files.file;
        const fileInfo = {
            originalName: uploadedFile.name,
            fileName: uuid.v4(),
            mimetype: uploadedFile.mimetype
        }
        const filePath = "/tmp/" + fileInfo.fileName;
        uploadedFile.mv(filePath, async function (err) {
            if (err) {
                return res.status(500).send(err)
            }
            const filePath = path.resolve("/tmp", fileInfo.fileName);
            const workbook = xlsx.readFile(filePath);
            const sheetNames = workbook.SheetNames;

// Get the data of "Sheet1"
            const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]])
            let formattedData = SatauData.formatEntries(data);
            let productsOfSatau = await Products.findAll({
                raw: true,
                where: {
                    provider: "Satau",
                    BuyGroupId: parseInt(req.user.BuyGroupId)
                }
            });
            productsOfSatau = productsOfSatau.reduce((products, product) => {
                products[product.internalCode] = product;
                return products;
            }, {});
            formattedData = Object.values(formattedData).map((product) => {
                const productInDb = productsOfSatau[product.internalCode];
                if (productInDb === undefined) {
                    product.action = "create"
                } else if (productInDb.expectedCostUnitPrice !== product.expectedCostUnitPrice) {
                    product.action = "updatePrice"
                } else {
                    product.action = "nothing"
                }
                delete productsOfSatau[product.internalCode];
                return product;
            })
            Object.values(productsOfSatau).forEach((productOfSatau) => {
                if (productOfSatau.isAvailable) {
                    productOfSatau.action = "remove";
                    formattedData[productOfSatau.internalCode] = productOfSatau;
                }
            });
            const uploadUuid = uuid.v4();
            await ProductsUpload.create({
                uuid: uploadUuid,
                rawData: data,
                formattedData: Object.values(formattedData)
            })
            res.send({
                formattedData: Object.values(formattedData),
                uploadUuid: uploadUuid
            })
        })
    },
    uploadHnProducts: async (req, res) => {
        const textBlock = req.body.textBlock;
        let entries = HNData.linesToEntries(textBlock.split("\n"));
        let productsOfHN = await Products.findAll({
            raw: true,
            where: {
                provider: "Horizon Nature",
                BuyGroupId: parseInt(req.user.BuyGroupId)
            }
        });
        productsOfHN = productsOfHN.reduce((products, product) => {
            products[product.internalCode] = product;
            return products;
        }, {});
        entries = Object.values(entries).map((product) => {
            const productInDb = productsOfHN[product.internalCode];
            if (productInDb === undefined) {
                product.action = "create"
            } else if (productInDb.expectedCostUnitPrice !== product.expectedCostUnitPrice) {
                product.action = "updatePrice"
            } else {
                product.action = "nothing"
            }
            delete productsOfHN[product.internalCode];
            return product;
        })
        Object.values(productsOfHN).forEach((productsOfHN) => {
            if (productsOfHN.isAvailable) {
                productsOfHN.action = "remove";
                entries[productsOfHN.internalCode] = productsOfHN;
            }
        });
        const uploadUuid = uuid.v4();
        await ProductsUpload.create({
            uuid: uploadUuid,
            rawData: req.body,
            formattedData: Object.values(entries)
        })
        res.send({
            formattedData: Object.values(entries),
            uploadUuid: uploadUuid
        })
    },
    acceptUpload: async (req, res) => {
        const uploadUuid = req.params['uploadId'];
        const productsUpload = await ProductsUpload.findOne({
            where: {
                uuid: uploadUuid
            }
        })
        if (productsUpload === null) {
            return res.sendStatus(400);
        }
        const buyGroupId = parseInt(req.user.BuyGroupId);
        await Promise.all(
            productsUpload.formattedData.map(async (product) => {
                if (product.action === "create") {
                    product.BuyGroupId = buyGroupId;
                    await Products.create(product);
                } else if (product.action === "updatePrice") {
                    await Products.update({
                        expectedCostUnitPrice: product.expectedCostUnitPrice,
                    }, {
                        where: {
                            internalCode: product.internalCode,
                            BuyGroupId: parseInt(req.user.BuyGroupId)
                        }
                    });
                } else if (product.action === "remove") {
                    await Products.update({
                        isAvailable: false,
                    }, {
                        where: {
                            internalCode: product.internalCode,
                            BuyGroupId: parseInt(req.user.BuyGroupId)
                        }
                    });
                }
            })
        );
        res.sendStatus(200)
    }
}
module.exports = ProductUploadController;
