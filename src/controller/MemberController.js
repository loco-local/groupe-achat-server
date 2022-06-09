const {Users} = require('../model')

const MemberController = {
    get: async (req, res) => {
        const memberId = parseInt(req.params['memberId']);
        if (memberId !== req.user.id && req.user.status !== "admin") {
            return res.sendStatus(403);
        }
        const user = await Users.findOne({
            where: {
                id: memberId
            },
            attributes: Users.getSafeAttributes()
        })
        res.send(user);
    }

}

module.exports = MemberController;
