const {BuyGroupOrders} = require("./model");
const MemberOrderItem = {
    calculateTPS(orderItem, price, quantity) {
        return orderItem.hasTPS ? price * 0.05 * quantity : 0;
    },
    calculateTVQ(orderItem, price, quantity) {
        return orderItem.hasTVQ ? price * 0.09975 * quantity : 0;
    },
    async calculateUnitPrice(costUnitPrice, buyGroupOrderId) {
        const buyGroupOrder = await BuyGroupOrders.findOne({
            where: {
                id: buyGroupOrderId
            },
            attributes: ['salePercentage']
        });
        // Math.max(buyGroupOrder.salePercentage, 0);
        return costUnitPrice * (1 + (buyGroupOrder.salePercentage / 100));
    },
    getPrice(orderItem) {
        if (orderItem.price) {
            return orderItem.price;
        }
        return orderItem.expectedUnitPrice;
    }
}

module.exports = MemberOrderItem;
