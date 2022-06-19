const {BuyGroupOrders, MemberOrders, Members, MemberOrderItems} = require('../model')
const {Op} = require("sequelize");

const BuyGroupOrderController = {
    list: async (req, res) => {
        const buyGroupId = parseInt(req.params['buyGroupId']);
        if (isNaN(buyGroupId)) {
            return res.sendStatus(401)
        }
        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        if (memberBuyGroupId !== buyGroupId) {
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
        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        if (memberBuyGroupId !== buyGroupId) {
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
    listMemberOrders: async (req, res) => {
        const buyGroupOrderId = parseInt(req.params['orderId']);
        if (isNaN(buyGroupOrderId)) {
            return res.sendStatus(401)
        }
        const buyGroupOrder = await BuyGroupOrders.findOne({
            where: {
                id: buyGroupOrderId
            }
        })

        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        if (memberBuyGroupId !== buyGroupOrder.BuyGroupId) {
            return res.sendStatus(403);
        }
        const memberOrders = await MemberOrders.findAll({
            where: {
                BuyGroupOrderId: memberBuyGroupId
            },
            include: [
                {model: Members, attributes: ['id', 'firstname', 'lastname']},
            ],
        });
        res.send(memberOrders);
    },
    listMemberOrdersItems: async (req, res) => {
        const buyGroupOrderId = parseInt(req.params['orderId']);
        if (isNaN(buyGroupOrderId)) {
            return res.sendStatus(401)
        }
        const buyGroupOrder = await BuyGroupOrders.findOne({
            where: {
                id: buyGroupOrderId
            }
        })

        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        if (memberBuyGroupId !== buyGroupOrder.BuyGroupId) {
            return res.sendStatus(403);
        }
        const memberOrderItems = await MemberOrderItems.findAll({
            include: [
                {
                    model: MemberOrders,
                    where: {
                        BuyGroupOrderId: buyGroupOrderId
                    },
                    include: [
                        {model: Members, attributes: ['id', 'firstname', 'lastname']},
                    ]
                }
            ]
        })
        res.send(memberOrderItems);
    },
    create: async (req, res) => {
        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        let order = req.body

        order = await BuyGroupOrders.create({
            startDate: order.startDate,
            endDate: order.endDate,
            BuyGroupId: memberBuyGroupId
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
        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        if (memberBuyGroupId !== order.BuyGroupId) {
            return res.sendStatus(403);
        }
        await BuyGroupOrders.update({
            startDate: order.startDate,
            endDate: order.endDate
        }, {
            where: {
                id: order.id,
                BuyGroupId: memberBuyGroupId
            }
        });
        res.sendStatus(200);
    },
}

module.exports = BuyGroupOrderController;
