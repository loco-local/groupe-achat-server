const {Products, ProductsUpload} = require('../model')
const xlsx = require("xlsx");
const path = require("path");
const uuid = require('uuid')
const SatauData = require("../SatauData");
const ProductController = {
    list: async (req, res) => {
        const products = await Products.findAll();
        res.send(products);
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
            const formattedData = data.map(SatauData.formatEntry);
            await Promise.all(formattedData.map(async (product) => {
                    const productInDb = await Products.findOne({
                        where: {
                            internalCode: product.internalCode
                        }
                    })
                    if (productInDb === null) {
                        product.action = "create"
                    } else if (productInDb.price !== product.price) {
                        product.action = "updatePrice"
                    } else {
                        product.action = "nothing"
                    }
                })
            );
            const uploadUuid = uuid.v4();
            await ProductsUpload.create({
                uuid: uploadUuid,
                rawData: data,
                formattedData: formattedData
            })
            res.send({
                formattedData: formattedData,
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
        await Promise.all(
            productsUpload.formattedData.map(async (product) => {
                if (product.action === "create") {
                    await Products.create(product);
                } else if (product.action === "updatePrice") {
                    await Products.update({
                        price: product.price,
                        where: {
                            id: product.id
                        }
                    });
                }
            })
        );
        res.sendStatus(200)
    }
}
module.exports = ProductController;
