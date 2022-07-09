const {MemberOrderItems} = require('./model')

const MemberOrder = {
    buildTotal: async function (memberOrder, props, items) {
        if (items === undefined) {
            items = await MemberOrderItems.findAll({
                where: {
                    MemberOrderId: memberOrder.id
                }
            })
        }
        let totalPrice = items.reduce(function (sum, item) {
            let price = item[props.totalAfterRebateWithTaxes];
            if (price === null) {
                price = item.expectedTotalAfterRebateWithTaxes;
            }
            return sum + price;
        }, 0);
        memberOrder[props.total] = parseFloat(totalPrice).toFixed(2);
        await memberOrder.save();
    }
}


module.exports = MemberOrder;
