const {MemberOrders, BuyGroupOrders, MemberOrderItems, Members} = require('../model')

const MemberOrderController = {
    getForGroupOrder: async (req, res) => {
        const buyGroupOrder = await MemberOrderController._getBuyGroupOrderFromRequest(req);
        if (buyGroupOrder === false || buyGroupOrder === null) {
            return res.sendStatus(401);
        }
        const memberId = parseInt(req.user.id);
        const memberOrder = await MemberOrders.findOne({
            where: {
                MemberId: memberId,
                BuyGroupOrderId: buyGroupOrder.id
            }
        });
        if (memberOrder === null) {
            return res.sendStatus(204);
        }
        res.send(memberOrder);
    },
    getDetailsForGroupOrder: async (req, res) => {
        const buyGroupOrderId = parseInt(req.params['buyGroupId']);
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
        const memberId = parseInt(req.params['memberId']);
        if (memberId !== req.user.id && req.user.status !== "admin") {
            return res.sendStatus(403);
        }
        const memberOrderItems = await MemberOrderItems.findAll({
            include: [
                {
                    model: MemberOrders,
                    where: {
                        BuyGroupOrderId: buyGroupOrderId,
                        MemberId: memberId
                    },
                    include: [
                        {model: Members, attributes: ['id', 'firstname', 'lastname']},
                    ]
                }
            ]
        })
        res.send(memberOrderItems);
    },
    createForGroupOrder: async (req, res) => {
        const buyGroupOrder = await MemberOrderController._getBuyGroupOrderFromRequest(req);
        if (buyGroupOrder === false) {
            return res.sendStatus(401);
        }
        const memberId = parseInt(req.user.id);
        let memberOrder = await MemberOrders.findOne({
            where: {
                MemberId: memberId,
                BuyGroupOrderId: buyGroupOrder.id
            }
        });
        if (memberOrder !== null) {
            return res.sendStatus(401);
        }
        memberOrder = await MemberOrders.create({
            BuyGroupOrderId: buyGroupOrder.id,
            MemberId: memberId,
            totalPrice: 0
        });
        res.send(memberOrder);
    },
    _getBuyGroupOrderFromRequest: async function (req) {
        const memberIdParam = parseInt(req.params['memberId']);
        const memberId = parseInt(req.user.id);
        if (memberIdParam !== memberId) {
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

module.exports = MemberOrderController;
