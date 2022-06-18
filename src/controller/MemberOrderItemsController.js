const {MemberOrders, MemberOrderItems, Products} = require('../model')
const MemberOrder = require("../MemberOrder");
const MemberOrderItemsController = {
    listForOrder: async (req, res) => {
        const order = await MemberOrderItemsController._getOrderFromRequest(req);
        if (order === false) {
            return res.sendStatus(403);
        }
        const items = await MemberOrderItems.findAll({
            where: {
                MemberOrderId: order.id
            }
        })
        res.send(items);
    },
    setQuantity: async (req, res) => {
        const order = await MemberOrderItemsController._getOrderFromRequest(req);
        if (order === false) {
            return res.sendStatus(403);
        }
        const quantity = parseInt(req.body.quantity);
        if (isNaN(quantity) || quantity < 0) {
            return res.sendStatus(401);
        }
        const productId = parseInt(req.params['productId']);
        const memberOrderItem = await MemberOrderItems.findOne({
            where: {
                ProductId: productId
            }
        });
        const product = await Products.findOne({
            where: {
                id: productId
            }
        })
        const tps = MemberOrderItemsController.calculateTPS(product, quantity);
        const tvq = MemberOrderItemsController.calculateTVQ(product, quantity);
        let totalPriceBeforeTaxes = parseFloat((product.price * quantity));
        let totalPriceWithTaxes = parseFloat(totalPriceBeforeTaxes + tps + tvq).toFixed(2);
        totalPriceBeforeTaxes = totalPriceBeforeTaxes.toFixed(2);
        if (memberOrderItem === null) {
            await MemberOrderItems.create({
                ProductId: productId,
                MemberOrderId: order.id,
                quantity: quantity,
                description: product.name,
                internalCode: product.internalCode,
                price: product.price,
                provider: product.provider,
                maker: product.maker,
                category: product.category,
                qtyInBox: product.qtyInBox,
                format: product.format,
                info: product.info,
                totalPrice: totalPriceBeforeTaxes,
                totalPriceAfterRebate: totalPriceBeforeTaxes,
                totalPriceAfterRebateWithTaxes: totalPriceWithTaxes,
                tps: tps,
                tvq: tvq
            })
        } else {
            if (memberOrderItem.MemberOrderId !== order.id) {
                return res.sendStatus(401);
            }
            memberOrderItem.quantity = quantity;
            memberOrderItem.tps = tps;
            memberOrderItem.tvq = tvq;
            memberOrderItem.totalPrice = totalPriceBeforeTaxes;
            memberOrderItem.totalPriceAfterRebate = totalPriceBeforeTaxes;
            memberOrderItem.totalPriceAfterRebateWithTaxes = totalPriceWithTaxes;

            await memberOrderItem.save();
        }
        await MemberOrder.buildTotal(order);
        res.sendStatus(200);
    },
    calculateTPS(product, quantity) {
        return product.hasTPS ? product.price * 0.05 * quantity : 0;
    },
    calculateTVQ(product, quantity) {
        return product.hasTVQ ? product.price * 0.09975 * quantity : 0;
    },
    _getOrderFromRequest: async (req) => {
        const orderId = parseInt(req.params['memberOrderId']);
        const memberId = parseInt(req.user.id);
        const order = await MemberOrders.findOne({
            where: {
                id: orderId
            },
            attributes: ['id', 'MemberId']
        });
        if (order.MemberId !== memberId) {
            return false;
        }
        return order;
    }
}
module.exports = MemberOrderItemsController;
