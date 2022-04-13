const config = require('../config');
config.setEnvironment('development');
const Promise = require('bluebird');

const {
    sequelize,
    Users,
    Products
} = require('../model')

const users = require('./Users.json')
const products = require('./Products.json')

module.exports = {
    run: async function () {
        await sequelize.sync({force: true});
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
