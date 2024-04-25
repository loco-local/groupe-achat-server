const qtyRegex = /([1-9]{1}[0-9]{0,}(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|\.[0-9]{1,2})/g

const QuantityInterpreter = {
    getQty: function (str) {
        let qty = str.replaceAll(",", ".").match(qtyRegex);
        if (qty === null) {
            return 1;
        }
        qty = qty[0];
        return parseFloat(qty.trim());
    },
    allowedFormats: ['kg', 'g', 'lbs', 'ml', 'l'],
    isFormatValid: function (value) {
        if (!value) {
            return true;
        }
        const quantity = QuantityInterpreter.getQty(value);
        const formatOnly = value.replaceAll(",", ".").replace(quantity, '').trim().toLowerCase();
        if (QuantityInterpreter.allowedFormats.indexOf(formatOnly) === -1) {
            return false;
        }
        return true;
    }
}

module.exports = QuantityInterpreter;