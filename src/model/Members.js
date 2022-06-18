const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))

function hashPassword(user, options) {
    const SALT_FACTOR = 8
    if (!user.changed('password')) {
        return
    }
    return bcrypt
        .genSaltAsync(SALT_FACTOR)
        .then(salt => bcrypt.hashAsync(user.password, salt, null))
        .then(hash => {
            user.setDataValue('password', hash)
        })
}

module.exports = (sequelize, DataTypes) => {
    const Member = sequelize.define('Members', {
        firstname: DataTypes.STRING,
        lastname: DataTypes.STRING,
        uuid: {
            type: DataTypes.STRING,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        phone1: DataTypes.STRING,
        phone2: DataTypes.STRING,
        pronoun: DataTypes.STRING,
        address: DataTypes.STRING,
        password: DataTypes.STRING,
        resetPasswordToken: DataTypes.STRING,
        resetPasswordExpires: DataTypes.DATE,
        status: DataTypes.STRING,
        locale: DataTypes.STRING
    }, {
        hooks: {
            beforeCreate: hashPassword,
            beforeUpdate: hashPassword
        },
        indexes: [{
            unique: true,
            fields: ['uuid', 'resetPasswordToken', 'email']
        }]
    })
    Member.prototype.comparePassword = function (password) {
        return bcrypt.compareAsync(password, this.password)
    }
    Member.getSafeAttributes = function () {
        return ["email", "id", "uuid", "locale", "firstname", "lastname", "status", "phone1", "phone2", "address", "createdAt","pronoun"]
    };
    Member.getFewAttributes = function () {
        return ["uuid", "locale", "firstname", "lastname", "status"]
    };

    Member.defineAssociationsUsingModels = function (model, models) {
        model.belongsTo(models.BuyGroups);
    };
    return Member
}
