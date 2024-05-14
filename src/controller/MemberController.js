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
    getPublic: async (req, res) => {
        const memberId = parseInt(req.params['memberId']);
        const user = await Members.findOne({
            where: {
                id: memberId
            },
            attributes: Members.getPublicAttributes()
        })
        res.send(user);
    },
    update: async (req, res) => {
        const memberId = parseInt(req.params['memberId']);
        if (memberId !== req.user.id && req.user.status !== "admin") {
            return res.sendStatus(403);
        }
        if (req.body.status !== req.user.status && req.user.status !== "admin") {
            return res.sendStatus(403);
        }
        await Members.update({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone1: req.body.phone1,
            phone2: req.body.phone2,
            address: req.body.address,
            pronoun: req.body.pronoun,
            rebates: req.body.rebates,
            status: req.body.status
        }, {
            where: {
                id: memberId
            }
        })
        res.sendStatus(200);
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
