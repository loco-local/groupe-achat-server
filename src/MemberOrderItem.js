const {BuyGroupOrders, Members} = require("./model");
const MemberOrderItem = {
    calculateTPS(orderItem, price, quantity) {
        return orderItem.hasTPS ? price * 0.05 * quantity : 0;
    },
    calculateTVQ(orderItem, price, quantity) {
        return orderItem.hasTVQ ? price * 0.09975 * quantity : 0;
    },
    async calculateUnitPrices(costUnitPrice, buyGroupOrderId, memberId) {
        const buyGroupOrder = await BuyGroupOrders.findOne({
            where: {
                id: buyGroupOrderId
            },
            attributes: ['salePercentage']
        });
        const member = await Members.findOne({
            where: {
                id: memberId
            },
            attributes: ['rebates']
        });
        let salePercentageAfterRebate = buyGroupOrder.salePercentage;
        if (member.rebates && member.rebates.percentage && member.rebates.percentage.number) {
            salePercentageAfterRebate = Math.max(buyGroupOrder.salePercentage - member.rebates.percentage.number, 0);
        }
        return {
            unitPrice: costUnitPrice * (1 + (buyGroupOrder.salePercentage / 100)),
            unitPriceAfterRebate: costUnitPrice * (1 + (salePercentageAfterRebate / 100))
        };
    },
    getPrice(orderItem) {
        if (orderItem.price) {
            return orderItem.price;
        }
        return orderItem.expectedUnitPrice;
    }
}

module.exports = MemberOrderItem;
