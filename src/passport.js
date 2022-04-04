const {Users} = require('./model')
const config = require('./config')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

passport.use(
    new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.get().authentication.jwtSecret
    }, function (jwtPayload, done) {
        return Users.findOne({
            where: {
                id: jwtPayload.id,
                status: {
                    [Op.ne]: 'disabled'
                }
            }
        }).then(function (user) {
            if (user) {
                return done(null, user)
            } else {
                return done(new Error(), false)
            }
        }).catch(function () {
            return done(new Error(), false)
        })
    })
)

module.exports = null
