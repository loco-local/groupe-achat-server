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
    }

}

module.exports = MemberController;
