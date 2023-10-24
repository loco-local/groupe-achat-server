const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const config = require('../config')
Sequelize.DataTypes.postgres.DECIMAL.parse = parseFloat //  https://github.com/sequelize/sequelize/issues/11855#issuecomment-1382896486
const db = {}
const dbConfig = config.get().db

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.user,
    dbConfig.password,
    dbConfig.options
)

fs
    .readdirSync(__dirname)
    .filter((file) =>
        file !== 'index.js'
    )
    .forEach((file) => {
      // for individual model files having `module.exports = (sequelize, DataTypes) => {`
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
      db[model.name] = model
    })

for (const key in db) {
  const model = db[key]
  if (model.defineAssociationsUsingModels) {
    model.defineAssociationsUsingModels(
        model,
        db
    )
  }
}

db.sequelize = sequelize
db.Sequelize = Sequelize
module.exports = db
