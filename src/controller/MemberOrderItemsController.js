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
        await MemberOrderItemsController._redefinePricesAndTotals(
            true,
            req,
            res
        );
    },
    setQuantity: async (req, res) => {
        await MemberOrderItemsController._redefinePricesAndTotals(
            false,
            req,
            res
        );
    },
    setCostPrice: async (req, res) => {
        await MemberOrderItemsController._redefinePricesAndTotals(
            false,
            req,
            res
        );
    },
    _redefinePricesAndTotals: async (isForExpectedValues, req, res) => {
        const order = await MemberOrderItemsController._getOrderFromRequest(req);
        if (order === false) {
            return res.sendStatus(403);
        }
        let props = {
            quantity: isForExpectedValues ? "expectedQuantity" : "quantity",
            costPrice: isForExpectedValues ? "expectedCostPrice" : "costPrice",
            price: isForExpectedValues ? "expectedPrice" : "price",
            total: isForExpectedValues ? "expectedTotal" : "total",
            totalAfterRebate: isForExpectedValues ? "expectedTotalAfterRebate" : "totalAfterRebate",
            totalAfterRebateWithTaxes: isForExpectedValues ? "expectedTotalAfterRebateWithTaxes" : "totalAfterRebateWithTaxes"
        };
        const productId = parseInt(req.params['productId']);
        let memberOrderItem = await MemberOrderItems.findOne({
            where: {
                ProductId: productId,
                MemberOrderId: order.id
            }
        });
        let quantity;
        if (req.body[props.quantity]) {
            quantity = parseFloat(req.body[props.quantity]);
            if (isNaN(quantity) || quantity < 0) {
                return res.sendStatus(401);
            }
        } else {
            quantity = memberOrderItem[props.quantity];
            if (quantity === null) {
                quantity = parseFloat(memberOrderItem.expectedQuantity);
            }
            quantity = parseFloat(quantity);
        }
        const product = await Products.findOne({
            where: {
                id: productId
            }
        });
        let costPrice;
        if (req.body[props.costPrice]) {
            costPrice = parseFloat(req.body[props.costPrice]);
            if (isNaN(costPrice) || costPrice < 0) {
                return res.sendStatus(401);
            }
        } else if (memberOrderItem && memberOrderItem[props.costPrice]) {
            costPrice = parseFloat(memberOrderItem[props.costPrice]);
        } else {
            costPrice = parseFloat(product[props.costPrice]);
        }
        const price = await MemberOrderItem.calculatePrice(
            costPrice,
            order.BuyGroupOrderId
        );
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
                expectedCostPrice: product.expectedCostPrice,
                hasTPS: product.hasTPS,
                hasTVQ: product.hasTVQ
            }
        }
        memberOrderItem.tps = tps;
        memberOrderItem.tvq = tvq;
        memberOrderItem[props.costPrice] = costPrice;
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
        const response = {};
        response[props.costPrice] = costPrice;
        response[props.quantity] = quantity;
        response[props.price] = price;
        response[props.total] = totalPriceBeforeTaxes;
        response[props.totalAfterRebate] = totalPriceBeforeTaxes;
        response[props.totalAfterRebateWithTaxes] = totalPriceWithTaxes;
        response.tps = tps;
        response.tvq = tvq;
        res.send(response);
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
