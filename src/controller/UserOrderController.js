const {UserOrders, BuyGroupOrders} = require('../model')

const UserOrderController = {
    getForGroupOrder: async (req, res) => {
        const buyGroupOrder = await UserOrderController._getBuyGroupOrderFromRequest(req);
        if (buyGroupOrder === false || buyGroupOrder === null) {
            return res.sendStatus(401);
        }
        const userId = parseInt(req.user.id);
        const userOrder = await UserOrders.findOne({
            where: {
                UserId: userId,
                BuyGroupOrderId: buyGroupOrder.id
            }
        });
        if (userOrder === null) {
            return res.sendStatus(204);
        }
        res.send(userOrder);
    },
    createForGroupOrder: async (req, res) => {
        const buyGroupOrder = await UserOrderController._getBuyGroupOrderFromRequest(req);
        if (buyGroupOrder === false) {
            return res.sendStatus(401);
        }
        const userId = parseInt(req.user.id);
        let userOrder = await UserOrders.findOne({
            where: {
                UserId: userId,
                BuyGroupOrderId: buyGroupOrder.id
            }
        });
        if (userOrder !== null) {
            return res.sendStatus(401);
        }
        userOrder = await UserOrders.create({
            BuyGroupOrderId: buyGroupOrder.id,
            UserId: userId,
            totalPrice: 0
        });
        res.send(userOrder);
    },
    _getBuyGroupOrderFromRequest: async function (req) {
        const userIdParam = parseInt(req.params['userId']);
        const userId = parseInt(req.user.id);
        if (userIdParam !== userId) {
            return false;
        }
        const buyGroupIdParam = parseInt(req.params['buyGroupId']);
        const buyGroupId = parseInt(req.user.BuyGroupId);
        if (buyGroupIdParam !== buyGroupId) {
            return false;
        }
        const buyGroupOrderId = parseInt(req.params['buyGroupOrderId']);
        return await BuyGroupOrders.findOne({
            where: {
                id: buyGroupOrderId,
                BuyGroupId: buyGroupId
            }
        });
    }
}

module.exports = UserOrderController;
