const {MemberOrders, MemberOrderItems, Products, BuyGroupOrders} = require('../model')
const MemberOrder = require("../MemberOrder");
const MemberOrderItem = require("../MemberOrderItem");
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
    setExpectedQuantity: async (req, res) => {
        const order = await MemberOrderItemsController._getOrderFromRequest(req);
        if (order === false) {
            return res.sendStatus(403);
        }
        const expectedQuantity = parseInt(req.body.expectedQuantity);
        if (isNaN(expectedQuantity) || expectedQuantity < 0) {
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
        const expectedPrice = await MemberOrderItem.calculatePrice(product, order.BuyGroupOrderId);
        const tps = MemberOrderItem.calculateTPS(product, expectedPrice, expectedQuantity);
        const tvq = MemberOrderItem.calculateTVQ(product, expectedPrice, expectedQuantity);
        let totalPriceBeforeTaxes = parseFloat(expectedPrice * expectedQuantity);
        let totalPriceWithTaxes = parseFloat(totalPriceBeforeTaxes + tps + tvq).toFixed(2);
        totalPriceBeforeTaxes = totalPriceBeforeTaxes.toFixed(2);
        if (memberOrderItem === null) {
            await MemberOrderItems.create({
                ProductId: productId,
                MemberOrderId: order.id,
                expectedQuantity: expectedQuantity,
                description: product.name,
                internalCode: product.internalCode,
                provider: product.provider,
                maker: product.maker,
                category: product.category,
                qtyInBox: product.qtyInBox,
                format: product.format,
                info: product.info,
                costPrice: product.price,
                expectedPrice: expectedPrice,
                expectedTotal: totalPriceBeforeTaxes,
                expectedTotalAfterRebate: totalPriceBeforeTaxes,
                expectedTotalAfterRebateWithTaxes: totalPriceWithTaxes,
                tps: tps,
                tvq: tvq
            })
        } else {
            if (memberOrderItem.MemberOrderId !== order.id) {
                return res.sendStatus(401);
            }
            memberOrderItem.expectedQuantity = expectedQuantity;
            memberOrderItem.expectedPrice = expectedPrice;
            memberOrderItem.tps = tps;
            memberOrderItem.tvq = tvq;
            memberOrderItem.expectedTotal = totalPriceBeforeTaxes;
            memberOrderItem.expectedTotalAfterRebate = totalPriceBeforeTaxes;
            memberOrderItem.expectedTotalAfterRebateWithTaxes = totalPriceWithTaxes;

            await memberOrderItem.save();
        }
        await MemberOrder.buildTotal(order);
        res.sendStatus(200);
    },
    _getOrderFromRequest: async (req) => {
        const orderId = parseInt(req.params['memberOrderId']);
        const memberId = parseInt(req.user.id);
        const order = await MemberOrders.findOne({
            where: {
                id: orderId
            },
            attributes: ['id', 'MemberId', 'BuyGroupOrderId']
        });
        if (order.MemberId !== memberId) {
            return false;
        }
        return order;
    }
}
module.exports = MemberOrderItemsController;
