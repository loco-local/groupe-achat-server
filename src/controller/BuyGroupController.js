const {BuyGroups, BuyGroupOrders} = require('../model')
const {Op} = require('sequelize')

const BuyGroupController = {
    getForPath: async (req, res) => {
        const buyGroupPath = req.params['buyGroupPath'];
        const buyGroup = await BuyGroups.findOne({
            where: {
                path: buyGroupPath
            }
        });
        res.send(buyGroup);
    },
    getForId: async (req, res) => {
        const buyGroupId = req.params['buyGroupId'];
        const buyGroup = await BuyGroups.findOne({
            where: {
                id: buyGroupId
            }
        });
        res.send(buyGroup);
    }
}

module.exports = BuyGroupController;
