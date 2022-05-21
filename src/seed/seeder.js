const config = require('../config');
config.setEnvironment('development');
const Promise = require('bluebird');
const {addDays} = require("date-fns");
const {
    sequelize,
    Users,
    Products,
    BuyGroups,
    BuyGroupOrders
} = require('../model')

const users = require('./Users.json')
const products = require('./Products.json')
const buyGroups = require('./BuyGroups.json')
const buyGroupOrders = require('./BuyGroupOrders.json')

module.exports = {
    run: async function () {
        await sequelize.sync({force: true});
        await Promise.all(
            buyGroups.map(buyGroup => {
                return BuyGroups.create(buyGroup);
            })
        )
        await Promise.all(
            users.map(user => {
                return Users.create(user);
            })
        )
        await Promise.all(
            products.map(product => {
                return Products.create(product)
            })
        )
        await Promise.all(
            buyGroupOrders.map((buyGroupOrder) => {
                buyGroupOrder.startDate = addDays(new Date(), buyGroupOrder.startDate);
                buyGroupOrder.endDate = addDays(new Date(), buyGroupOrder.endDate);
                return BuyGroupOrders.create(buyGroupOrder);
            })
        )
    }
}
