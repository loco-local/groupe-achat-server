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
    setCostUnitPrice: async (req, res) => {
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
            costUnitPrice: isForExpectedValues ? "expectedCostUnitPrice" : "costUnitPrice",
            unitPrice: isForExpectedValues ? "expectedUnitPrice" : "unitPrice",
            unitPriceAfterRebate: isForExpectedValues ? "expectedUnitPriceAfterRebate" : "unitPriceAfterRebate",
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
        if (req.body[props.quantity] !== undefined) {
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
        let costUnitPrice;
        if (req.body[props.costUnitPrice] !== undefined) {
            costUnitPrice = parseFloat(req.body[props.costUnitPrice]);
            if (isNaN(costUnitPrice) || costUnitPrice < 0) {
                return res.sendStatus(401);
            }
        } else if (memberOrderItem && !isNaN(memberOrderItem[props.costUnitPrice]) && memberOrderItem[props.costUnitPrice] !== null) {
            costUnitPrice = parseFloat(memberOrderItem[props.costUnitPrice]);
        } else {
            costUnitPrice = parseFloat(product.expectedCostUnitPrice);
        }
        const unitPrices = await MemberOrderItem.calculateUnitPrices(
            costUnitPrice,
            order.BuyGroupOrderId,
            order.MemberId
        );

        const tps = MemberOrderItem.calculateTPS(product, unitPrices.unitPriceAfterRebate, quantity);
        const tvq = MemberOrderItem.calculateTVQ(product, unitPrices.unitPriceAfterRebate, quantity);
        const totalWithoutRebate = parseFloat(unitPrices.unitPrice * quantity).toFixed(2);
        let totalPriceBeforeTaxes = parseFloat(unitPrices.unitPriceAfterRebate * quantity);
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
                expectedCostUnitPrice: product.expectedCostUnitPrice,
                hasTPS: product.hasTPS,
                hasTVQ: product.hasTVQ
            }
        }
        memberOrderItem.tps = tps;
        memberOrderItem.tvq = tvq;
        memberOrderItem[props.costUnitPrice] = costUnitPrice;
        memberOrderItem[props.quantity] = quantity;
        memberOrderItem[props.unitPrice] = unitPrices.unitPrice;
        memberOrderItem[props.unitPriceAfterRebate] = unitPrices.unitPriceAfterRebate;
        memberOrderItem[props.total] = totalWithoutRebate;
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
        response[props.costUnitPrice] = costUnitPrice;
        response[props.quantity] = quantity;
        response[props.unitPrice] = unitPrices.unitPrice;
        response[props.unitPriceAfterRebate] = unitPrices.unitPriceAfterRebate;
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
