const {MemberOrderItems} = require('./model')

const MemberOrder = {
    buildTotal: async function (memberOrder, items) {
        if (items === undefined) {
            items = await MemberOrderItems.findAll({
                where: {
                    MemberOrderId: memberOrder.id
                }
            })
        }
        let totalPrice = items.reduce(function (sum, item) {
            return (sum) + (item.totalPriceAfterRebateWithTaxes)
        }, 0);
        memberOrder.totalPrice = parseFloat(totalPrice).toFixed(2);
        await memberOrder.save();
    }
}


module.exports = MemberOrder;
