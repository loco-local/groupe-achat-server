const {BuyGroups} = require('../model')

const BuyGroupController = {
    getForPath: async (req, res) => {
        const buyGroupPath = req.params['buyGroupPath'];
        const buyGroup = await BuyGroups.findOne({
            where: {
                path: buyGroupPath
            }
        });
        res.send(buyGroup);
    }
}

module.exports = BuyGroupController;
