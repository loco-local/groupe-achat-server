const {UserOrderItems} = require('./model')

const UserOrder = {
    buildTotal: async function (userOrder, items) {
        if (items === undefined) {
            items = await UserOrderItems.findAll({
                where: {
                    UserOrderId: userOrder.id
                }
            })
        }
        let totalPrice = items.reduce(function (sum, item) {
            return (sum) + (item.totalPriceAfterRebate)
        }, 0);
        userOrder.totalPrice = parseFloat(totalPrice).toFixed(2);
        await userOrder.save();
    }
}


module.exports = UserOrder;
