const {Products, ProductsUpload} = require('../model')
const xlsx = require("xlsx");
const path = require("path");
const uuid = require('uuid')
const SatauData = require("../SatauData");
const ProductController = {
    listPutForward: async (req, res) => {
        const buyGroupId = parseInt(req.params['buyGroupId']);
        const products = await Products.findAll({
            where: {
                isPutForward: true,
                BuyGroupId: buyGroupId
            }
        });
        res.send(products);
    },
    listDeprecated: async (req, res) => {
        const buyGroupId = parseInt(req.params['buyGroupId']);
        const products = await Products.findAll({
            where: {
                isPutForward: false,
                BuyGroupId: buyGroupId
            }
        });
        res.send(products);
    },
    putForward: async (req, res) => {
        const products = req.body;
        await Promise.all(products.map(async (product) => {
            await Products.update({
                isPutForward: true,
            }, {
                where: {
                    id: product.id
                }
            });
        }));
        res.sendStatus(200);
    },
    deprecate: async (req, res) => {
        const products = req.body;
        await Promise.all(products.map(async (product) => {
            await Products.update({
                isPutForward: false,
            }, {
                where: {
                    id: product.id
                }
            });
        }));
        res.sendStatus(200);
    },
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
                    provider: "Satau"
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
                } else if (productInDb.expectedCostPrice !== product.expectedCostPrice) {
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
                        expectedCostPrice: product.expectedCostPrice,
                    }, {
                        where: {
                            id: product.id
                        }
                    });
                } else if (product.action === "remove") {
                    await Products.update({
                        isAvailable: false,
                    }, {
                        where: {
                            id: product.id
                        }
                    });
                }
            })
        );
        res.sendStatus(200)
    },
    makeAvailable: async (req, res) => {
        const productId = parseInt(req.params['productId']);
        await Products.update({
            isAvailable: true,
        }, {
            where: {
                id: productId
            }
        });
        res.sendStatus(200);
    },
    makeUnavailable: async (req, res) => {
        const productId = parseInt(req.params['productId']);
        await Products.update({
            isAvailable: false,
        }, {
            where: {
                id: productId
            }
        });
        res.sendStatus(200);
    },
    async createProduct(req, res) {
        let product = req.body
        product = await Products.create({
            name: product.name,
            format: product.format,
            expectedCostPrice: product.expectedCostPrice,
            internalCode: product.internalCode,
            maker: product.maker,
            provider: product.provider,
            isAvailable: true,
            hasTPS: product.hasTPS,
            hasTVQ: product.hasTVQ,
            isPutForward: true,
        })
        res.send({
            id: product.id
        })
    },
    async updateProduct(req, res) {
        let product = req.body
        if (product.id !== parseInt(req.params['productId'])) {
            return res.sendStatus(401)
        }
        if (!product.nbInStock || product.nbInStock === '') {
            product.nbInStock = 0
        }
        await Products.update({
            name: product.name,
            format: product.format,
            expectedCostPrice: product.expectedCostPrice,
            internalCode: product.internalCode,
            maker: product.maker,
            provider: product.provider,
            isAvailable: true,
            hasTPS: product.hasTPS,
            hasTVQ: product.hasTVQ,
            isPutForward: true,
        }, {
            where: {
                id: product.id
            }
        });
        res.sendStatus(200);
    }
}
module.exports = ProductController;
