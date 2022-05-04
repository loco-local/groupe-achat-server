const config = require('../config');
config.setEnvironment('development');
const Promise = require('bluebird');

const {
    sequelize,
    Users,
    Products,
    BuyGroups
} = require('../model')

const users = require('./Users.json')
const products = require('./Products.json')
const buyGroups = require('./BuyGroups.json')

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
    }
}
