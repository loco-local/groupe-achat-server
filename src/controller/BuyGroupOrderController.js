const {BuyGroupOrders, UserOrders, UserOrderItems, Users} = require('../model')
const {Op} = require("sequelize");

const BuyGroupOrderController = {
    list: async (req, res) => {
        const buyGroupId = parseInt(req.params['buyGroupId']);
        if (isNaN(buyGroupId)) {
            return res.sendStatus(401)
        }
        const userBuyGroupId = parseInt(req.user.BuyGroupId);
        if (userBuyGroupId !== buyGroupId) {
            return res.sendStatus(403);
        }
        const orders = await BuyGroupOrders.findAll({
            where: {
                BuyGroupId: buyGroupId
            }
        })
        res.send(orders);
    },
    listUnfinished: async (req, res) => {
        const buyGroupId = parseInt(req.params['buyGroupId']);
        if (isNaN(buyGroupId)) {
            return res.sendStatus(401)
        }
        const userBuyGroupId = parseInt(req.user.BuyGroupId);
        if (userBuyGroupId !== buyGroupId) {
            return res.sendStatus(403);
        }
        const orders = await BuyGroupOrders.findAll({
            where: {
                endDate: {
                    [Op.gte]: new Date()
                }
            }
        })
        res.send(orders);
    },
    listUserOrders: async (req, res) => {
        const buyGroupOrderId = parseInt(req.params['orderId']);
        if (isNaN(buyGroupOrderId)) {
            return res.sendStatus(401)
        }
        const buyGroupOrder = await BuyGroupOrders.findOne({
            where: {
                id: buyGroupOrderId
            }
        })

        const userBuyGroupId = parseInt(req.user.BuyGroupId);
        if (userBuyGroupId !== buyGroupOrder.BuyGroupId) {
            return res.sendStatus(403);
        }
        const userOrders = await UserOrders.findAll({
            where: {
                BuyGroupOrderId: userBuyGroupId
            },
            include: [
                {model: Users, attributes: ['id', 'firstname', 'lastname']},
            ],
        });
        res.send(userOrders);
    },
    listUserOrdersItems: async (req, res) => {
        const buyGroupOrderId = parseInt(req.params['orderId']);
        if (isNaN(buyGroupOrderId)) {
            return res.sendStatus(401)
        }
        const buyGroupOrder = await BuyGroupOrders.findOne({
            where: {
                id: buyGroupOrderId
            }
        })

        const userBuyGroupId = parseInt(req.user.BuyGroupId);
        if (userBuyGroupId !== buyGroupOrder.BuyGroupId) {
            return res.sendStatus(403);
        }
        const userOrderItems = await UserOrderItems.findAll({
            include: [
                {
                    model: UserOrders,
                    where: {
                        BuyGroupOrderId: buyGroupOrderId
                    },
                    include: [
                        {model: Users, attributes: ['id', 'firstname', 'lastname']},
                    ]
                }
            ]
        })
        res.send(userOrderItems);
    },
    create: async (req, res) => {
        const userBuyGroupId = parseInt(req.user.BuyGroupId);
        let order = req.body

        order = await BuyGroupOrders.create({
            startDate: order.startDate,
            endDate: order.endDate,
            BuyGroupId: userBuyGroupId
        })
        res.send({
            id: order.id
        })
    },
    update: async (req, res) => {
        let order = req.body
        if (order.id !== parseInt(req.params['orderId'])) {
            return res.sendStatus(401)
        }
        const userBuyGroupId = parseInt(req.user.BuyGroupId);
        if (userBuyGroupId !== order.BuyGroupId) {
            return res.sendStatus(403);
        }
        await BuyGroupOrders.update({
            startDate: order.startDate,
            endDate: order.endDate
        }, {
            where: {
                id: order.id,
                BuyGroupId: userBuyGroupId
            }
        });
        res.sendStatus(200);
    },
}

module.exports = BuyGroupOrderController;
