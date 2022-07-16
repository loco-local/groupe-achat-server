const {GroupOrderAllBillsFees, Products} = require('../model')
const MemberOrderItem = require("../MemberOrderItem");

const GroupOrderAllBillsFeesController = {
    list: async (req, res) => {
        const buyGroupOrderId = parseInt(req.params['buyGroupOrderId']);
        const fees = await GroupOrderAllBillsFees.findAll({
            where: {
                BuyGroupOrderId: buyGroupOrderId
            }
        });
        res.send(fees);
    },
    setQuantity: async (req, res) => {
        const buyGroupOrderId = parseInt(req.params['buyGroupOrderId']);
        const productId = parseInt(req.params['productId']);
        const product = await Products.findOne({
            where: {
                id: productId
            }
        });
        const quantity = parseFloat(req.body.quantity);
        const tps = MemberOrderItem.calculateTPS(product, product.expectedCostUnitPrice, quantity);
        const tvq = MemberOrderItem.calculateTVQ(product, product.expectedCostUnitPrice, quantity);
        let total = parseFloat(product.expectedCostUnitPrice * quantity + tps + tvq);
        const fee = await GroupOrderAllBillsFees.findOne({
            where: {
                ProductId: productId,
                BuyGroupOrderId: buyGroupOrderId
            }
        });
        if (fee === null) {
            await GroupOrderAllBillsFees.create({
                ProductId: productId,
                BuyGroupOrderId: buyGroupOrderId,
                total: total,
                quantity: quantity
            })
        } else {
            fee.quantity = quantity;
            fee.total = total;
            fee.tps = tps;
            fee.tvq = tvq;
            await fee.save();
        }
        res.send({
            quantity: quantity,
            total: total
        });
    }
}

module.exports = GroupOrderAllBillsFeesController;
