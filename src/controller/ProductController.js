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
            await ProductsUpload.create({
                uuid: uuid.v4(),
                rawData: data,
                formattedData: formattedData
            })
            res.send(formattedData)
        })
    }
}
module.exports = ProductController;
