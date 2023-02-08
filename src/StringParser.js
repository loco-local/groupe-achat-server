const qtyRegex = /([1-9]{1}[0-9]{0,}(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|\.[0-9]{1,2})/g
const StringParser = {};
StringParser.getQty = function (str) {
    if (str === null) {
        return 0;
    }
    if (typeof str === "number") {
        return str;
    }
    let qty = str.replaceAll(",", ".").match(qtyRegex);
    if (qty === null) {
        return null;
    }
    qty = qty[0];
    return parseFloat(qty.trim());
}
module.exports = StringParser;
