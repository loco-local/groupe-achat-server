const {UserOrders, UserOrderItems, Products} = require('../model')
const UserOrderItemsController = {
    listForOrder: async (req, res) => {
        const order = await UserOrderItemsController._getOrderFromRequest(req);
        if (order === false) {
            return res.sendStatus(403);
        }
        const items = await UserOrderItems.findAll({
            where: {
                UserOrderId: order.id
            }
        })
        res.send(items);
    },
    setQuantity: async (req, res) => {
        const order = await UserOrderItemsController._getOrderFromRequest(req);
        if (order === false) {
            return res.sendStatus(403);
        }
        const quantity = parseInt(req.body.quantity);
        if (isNaN(quantity) || quantity < 0) {
            return res.sendStatus(401);
        }
        const productId = parseInt(req.params['productId']);
        const userOrderItem = await UserOrderItems.findOne({
            where: {
                ProductId: productId
            }
        });
        if (userOrderItem === null) {
            const product = await Products.findOne({
                where: {
                    id: productId
                }
            })
            const tps = UserOrderItemsController.calculateTPS(product, quantity);
            const tvq = UserOrderItemsController.calculateTVQ(product, quantity);
            const totalPrice = parseFloat((product.price * quantity) + tps + tvq).toFixed(2);
            await UserOrderItems.create({
                ProductId: productId,
                UserOrderId: order.id,
                quantity: quantity,
                description: product.description,
                price: product.price,
                totalPrice: totalPrice,
                info: product.info,
                totalPriceAfterRebate: totalPrice,
                tps: tps,
                tvq: tvq
            })
        } else {
            if (userOrderItem.UserOrderId !== order.id) {
                return res.sendStatus(401);
            }
            userOrderItem.quantity = quantity;
            await userOrderItem.save();
        }
        res.sendStatus(200);
    },
    calculateTPS(product, quantity) {
        return product.isTaxable ? product.price * 0.05 * quantity : 0;
    },
    calculateTVQ(product, quantity) {
        return product.isTaxable ? product.price * 0.09975 * quantity : 0;
    },
    _getOrderFromRequest: async (req) => {
        const orderId = parseInt(req.params['userOrderId']);
        const userId = parseInt(req.user.id);
        const order = await UserOrders.findOne({
            where: {
                id: orderId
            },
            attributes: ['id', 'UserId']
        });
        if (order.UserId !== userId) {
            return false;
        }
        return order;
    }
}
module.exports = UserOrderItemsController;
