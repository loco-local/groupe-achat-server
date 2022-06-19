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
        await MemberOrderItemsController._setExpectedOrNotQuantity(
            true,
            req,
            res
        );
    },
    setQuantity: async (req, res) => {
        await MemberOrderItemsController._setExpectedOrNotQuantity(
            false,
            req,
            res
        );
    },
    _setExpectedOrNotQuantity: async (isExpectedQuantity, req, res) => {
        const order = await MemberOrderItemsController._getOrderFromRequest(req);
        if (order === false) {
            return res.sendStatus(403);
        }
        let props = {
            quantity: isExpectedQuantity ? "expectedQuantity" : "quantity",
            price: isExpectedQuantity ? "expectedPrice" : "price",
            total: isExpectedQuantity ? "expectedTotal" : "total",
            totalAfterRebate: isExpectedQuantity ? "expectedTotalAfterRebate" : "totalAfterRebate",
            totalAfterRebateWithTaxes: isExpectedQuantity ? "expectedTotalAfterRebateWithTaxes" : "totalAfterRebateWithTaxes"
        };
        const quantity = parseInt(req.body[props.quantity]);
        if (isNaN(quantity) || quantity < 0) {
            return res.sendStatus(401);
        }
        const productId = parseInt(req.params['productId']);
        let memberOrderItem = await MemberOrderItems.findOne({
            where: {
                ProductId: productId
            }
        });

        const product = await Products.findOne({
            where: {
                id: productId
            }
        })
        const price = await MemberOrderItem.calculatePrice(product, order.BuyGroupOrderId);
        const tps = MemberOrderItem.calculateTPS(product, price, quantity);
        const tvq = MemberOrderItem.calculateTVQ(product, price, quantity);
        let totalPriceBeforeTaxes = parseFloat(price * quantity);
        let totalPriceWithTaxes = parseFloat(totalPriceBeforeTaxes + tps + tvq).toFixed(2);
        totalPriceBeforeTaxes = totalPriceBeforeTaxes.toFixed(2);
        const shouldCreate = memberOrderItem === null;
        if (shouldCreate) {
            memberOrderItem = {
                ProductId: productId,
                MemberOrderId: order.id,
                description: product.name,
                internalCode: product.internalCode,
                provider: product.provider,
                maker: product.maker,
                category: product.category,
                qtyInBox: product.qtyInBox,
                format: product.format,
                info: product.info,
                costPrice: product.costPrice
            }
        }
        memberOrderItem.tps = tps;
        memberOrderItem.tvq = tvq;
        memberOrderItem[props.quantity] = quantity;
        memberOrderItem[props.price] = price;
        memberOrderItem[props.total] = totalPriceBeforeTaxes;
        memberOrderItem[props.totalAfterRebate] = totalPriceBeforeTaxes;
        memberOrderItem[props.totalAfterRebateWithTaxes] = totalPriceWithTaxes;
        if (shouldCreate) {
            await MemberOrderItems.create(memberOrderItem);
        } else {
            if (memberOrderItem.MemberOrderId !== order.id) {
                return res.sendStatus(401);
            }
            await memberOrderItem.save();
        }
        await MemberOrder.buildTotal(order, props);
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
        if (order.MemberId !== memberId && req.user.status !== 'admin') {
            return false;
        }
        return order;
    }
}
module.exports = MemberOrderItemsController;
