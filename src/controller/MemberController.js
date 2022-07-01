const {Members} = require('../model')

const MemberController = {
    get: async (req, res) => {
        const memberId = parseInt(req.params['memberId']);
        if (memberId !== req.user.id && req.user.status !== "admin") {
            return res.sendStatus(403);
        }
        const user = await Members.findOne({
            where: {
                id: memberId
            },
            attributes: Members.getSafeAttributes()
        })
        res.send(user);
    },
    listForBuyGroup: async (req, res) => {
        const buyGroupId = parseInt(req.params.buyGroupId);
        if (buyGroupId !== req.user.BuyGroupId) {
            return res.sendStatus(401)
        }
        const members = await Members.findAll({
            where: {
                BuyGroupId: buyGroupId
            },
            attributes: Members.getSafeAttributes()
        })
        res.send(members);
    }
}
module.exports = MemberController;
