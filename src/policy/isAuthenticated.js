const passport = require('passport')
const {Members} = require('../model')
module.exports = function (req, res, next) {
    passport.authenticate('jwt', async function (err, user) {
        if (err || !user) {
            res.status(401).send({
                error: 'you do not have access to this resource',
                errorName: 'needToBeAuthenticated'
            })
            return;
        }
        const userForStatus = await Members.findOne({
            attributes: ['status'],
            where: {
                uuid: user.uuid
            }
        });
        if (userForStatus.status === 'disabled') {
            res.status(401).send({
                error: 'you do not have access to this resource'
            })
            return;
        } else {
            req.user = user
            next()
        }
    })(req, res, next)
}
