const {BuyGroupOrders, MemberOrders, Members, MemberOrderItems, BuyGroups} = require('../model')
const {Op} = require("sequelize");

const BuyGroupOrderController = {
    getById: async (req, res) => {
        const buyGroupOrderId = parseInt(req.params['buyGroupOrderId']);
        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        const buyGroupOrder = await BuyGroupOrders.findOne({
            where: {
                id: buyGroupOrderId
            }
        })
        if (memberBuyGroupId !== buyGroupOrder.BuyGroupId) {
            return res.sendStatus(403);
        }
        res.send(buyGroupOrder);
    },
    list: async (req, res) => {
        const buyGroupId = parseInt(req.params['buyGroupId']);
        if (isNaN(buyGroupId)) {
            return res.sendStatus(401)
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
                BuyGroupOrderId: buyGroupOrderId
            },
            include: [
                {model: Members, attributes: ['id', 'firstname', 'lastname', 'email']},
            ],
        });
        res.send(memberOrders);
    },
    listMemberOrdersItems: async (req, res) => {
        const memberOrderItems = await BuyGroupOrderController._listMemberOrderItemsWithMemberOrderIncludeOptions(
            req, res, undefined, undefined, [
                {
                    model: Members,
                    attributes: ['id', 'firstname', 'lastname']
                },
            ]
        );
        if (memberOrderItems) {
            res.send(memberOrderItems);
        }
    },
    listMemberOrdersItemsQuantities: async (req, res) => {
        let memberOrderItems = await BuyGroupOrderController._listMemberOrderItemsWithMemberOrderIncludeOptions(
            req, res, ['ProductId', 'expectedQuantity', 'quantity'],
            ['MemberId'],
            []
        );
        if (memberOrderItems) {
            res.send(memberOrderItems);
        }
    },
    _listMemberOrderItemsWithMemberOrderIncludeOptions: async (req, res, orderItemAttributes, memberOrderAttributes, memberOrderInclude) => {
        const buyGroupOrderId = parseInt(req.params['orderId']);
        if (isNaN(buyGroupOrderId)) {
            res.sendStatus(401)
            return false;
        }
        const buyGroupOrder = await BuyGroupOrders.findOne({
            where: {
                id: buyGroupOrderId
            }
        })

        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        if (memberBuyGroupId !== buyGroupOrder.BuyGroupId) {
            res.sendStatus(403);
            return false;
        }
        return MemberOrderItems.findAll({
            attributes: orderItemAttributes,
            include: [{
                model: MemberOrders,
                attributes: memberOrderAttributes,
                where: {
                    BuyGroupOrderId: buyGroupOrderId
                },
                include: memberOrderInclude
            }]
        })
    },
    create: async (req, res) => {
        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        let order = req.body
        const buyGroup = await BuyGroups.findOne({
            where: {
                id: memberBuyGroupId
            }
        })
        order = await BuyGroupOrders.create({
            startDate: order.startDate,
            endDate: order.endDate,
            salePercentage: order.salePercentage || buyGroup.salePercentage,
            additionalFees: order.additionalFees || buyGroup.additionalFees,
            howToPay: order.howToPay || buyGroup.howToPay,
            comment: order.comment,
            BuyGroupId: memberBuyGroupId
        })
        res.send({
            id: order.id
        })
    },
    update: async (req, res) => {
        let order = req.body
        if (order.id !== parseInt(req.params['buyGroupOrderId'])) {
            return res.sendStatus(401)
        }
        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        if (memberBuyGroupId !== order.BuyGroupId) {
            return res.sendStatus(403);
        }
        const buyGroup = await BuyGroups.findOne({
            where: {
                id: memberBuyGroupId
            }
        })
        await BuyGroupOrders.update({
            startDate: order.startDate,
            endDate: order.endDate,
            salePercentage: order.salePercentage || buyGroup.salePercentage,
            additionalFees: order.additionalFees || buyGroup.additionalFees,
            howToPay: order.howToPay || buyGroup.howToPay,
            comment: order.comment
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
