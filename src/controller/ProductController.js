const {Products} = require('../model')

const ProductController = {
    list: async (req, res) => {
        const products = await Products.findAll();
        res.send(products);
    }
}
module.exports = ProductController;
