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
    },
    update: async (req, res) => {
        let buyGroupId = req.params['buyGroupId'];
        if (isNaN(buyGroupId)) {
            return res.sendStatus(401)
        }
        buyGroupId = parseInt(buyGroupId);
        const memberBuyGroupId = parseInt(req.user.BuyGroupId);
        if (memberBuyGroupId !== buyGroupId) {
            return res.sendStatus(403);
        }
        let buyGroup = req.body;
        if (buyGroup.id !== buyGroupId) {
            return res.sendStatus(401)
        }
        await BuyGroups.update({
            name: buyGroup.name,
            path: buyGroup.path,
            salePercentage: buyGroup.salePercentage
        }, {
            where: {
                id: buyGroup.id
            }
        });
        res.sendStatus(200);
    }
}

module.exports = BuyGroupController;
