const {Products} = require('../model')
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
    listAdminRelated: async (req, res) => {
        const buyGroupId = parseInt(req.params['buyGroupId']);
        const products = await Products.findAll({
            where: {
                isAdminRelated: true,
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
        let product = req.body;
        const productWithSameCode = await Products.findAll({
            where: {
                internalCode: product.internalCode
            }
        });
        if (productWithSameCode.length !== 0) {
            return res.sendStatus(401);
        }
        product = await Products.create({
            name: product.name,
            format: product.format,
            expectedCostUnitPrice: product.expectedCostUnitPrice,
            internalCode: product.internalCode,
            maker: product.maker,
            provider: product.provider,
            isAvailable: true,
            hasTPS: product.hasTPS,
            hasTVQ: product.hasTVQ,
            isAdminRelated: product.isAdminRelated,
            qtyInBox: product.qtyInBox,
            category: product.category,
            isPutForward: true,
            BuyGroupId: parseInt(req.user.BuyGroupId)
        })
        res.send(product)
    },
    async internalCodeExists(req, res) {
        let internalCode = req.body.internalCode;
        const productsWithCode = await Products.findAll({
            where: {
                internalCode: internalCode
            }
        });
        res.send({
            exists: productsWithCode.length > 0
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
            expectedCostUnitPrice: product.expectedCostUnitPrice,
            internalCode: product.internalCode,
            qtyInBox: product.qtyInBox,
            category: product.category,
            maker: product.maker,
            provider: product.provider,
            hasTPS: product.hasTPS,
            hasTVQ: product.hasTVQ,
            isAdminRelated: product.isAdminRelated,
        }, {
            where: {
                id: product.id
            }
        });
        res.sendStatus(200);
    }
}
module.exports = ProductController;
