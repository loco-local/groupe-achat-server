const {Members} = require('../model')
const jwt = require('jsonwebtoken')
const config = require('../config')
const crypto = require('crypto')
const sprintf = require('sprintf-js').sprintf
const EmailClient = require('../EmailClient')
const {v4: uuidv4} = require('uuid');
const {Op} = require('sequelize')

const resetPasswordEn = {
    from: 'horizonsgaspesiens@gmail.com',
    subject: 'Change your password',
    content: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.<br><br>' +
        'Please click on the following link, or paste this into your browser to continue the process:<br><br>' +
        '<a href="%s/change-password/%s" target="_blank">%s/change-password/%s</a><br><br>' +
        'If you did not request this, please ignore this email and your password will remain unchanged.<br><br>'
}

const resetPasswordFr = {
    from: 'horizonsgaspesiens@gmail.com',
    subject: 'Modifier votre mot de passe',
    content: 'Vous reçevez ce courriel, parce que vous (ou quelqu\'un d\'autre) a demandé la réinitialisation du mot de passe de votre compte.<br><br>' +
        'Cliquez sur le lien suivant, ou coller le dans votre navigateur pour poursuivre le processus:<br><br>' +
        '<a href="%s/change-password/%s" target="_blank">%s/change-password/%s</a><br><br>' +
        'Si vous n\'avez pas fait cette demande, ignorez ce courriel et votre mot de passe demeurera inchangé.<br>'
}
const TWO_WEEKS = 1209600000;

function jwtSignUser(user) {
    return jwt.sign(user, config.get().authentication.jwtSecret, {})
}

const AuthenticationController = {
        async login(req, res) {
            const {email, password} = req.body
            if (password === undefined || password === null || password.trim() === '') {
                return res.status(403)
            }
            let member = await Members.findOne({
                where: {
                    email: email.toLowerCase().trim()
                }
            });
            if (member === undefined || member === null) {
                return res.send(403, {
                    error: 'Login information is incorrect'
                })
            }
            if (member.status === "disabled") {
                return res.send(403, {
                    error: 'disabled'
                });
            }
            const isPasswordValid = await member.comparePassword(password);
            if (!isPasswordValid) {
                return res.send(403, {
                    error: 'Login information is incorrect'
                })
            }
            AuthenticationController._loginUser(res, member);
        },
        async register(req, res) {
            let member = await Members.findOne({
                where: {
                    email: req.body.email.toLowerCase().trim()
                },
            });
            if (member) {
                return res.sendStatus(401);
            }
            member = await Members.create({
                uuid: uuidv4(),
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email.toLowerCase().trim(),
                phone1: req.body.phone1,
                phone2: req.body.phone2,
                address: req.body.address,
                pronoun: req.body.pronoun,
                password: req.body.password,
                status: "member",
                BuyGroupId: req.body.BuyGroupId
            })
            res.send({
                member: {
                    id: member.id,
                    uuid: member.uuid,
                    firstname: member.firstname,
                    lastname: member.lastname,
                    email: member.email.toLowerCase().trim(),
                    phone1: member.phone1,
                    phone2: member.phone2,
                    address: member.address,
                    pronoun: member.pronoun,
                    status: member.status,
                    BuyGroupId: member.BuyGroupId
                },
                token: jwtSignUser(member.toJSON())
            });
        },
        _loginUser: function (res, user) {
            res.send({
                user: {
                    id: user.id,
                    uuid: user.uuid,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email.toLowerCase().trim(),
                    status: user.status,
                    BuyGroupId: user.BuyGroupId
                },
                token: jwtSignUser(user.toJSON())
            })
        },
        async resetPassword(req, res) {
            const {email, locale} = req.body
            const token = await AuthenticationController._resetPassword(email.toLowerCase().trim());
            if (!token) {
                return res.sendStatus(400);
            }
            const emailText = locale === 'fr' ? resetPasswordFr : resetPasswordEn
            const emailContent = {
                from: EmailClient.buildFrom(emailText.from),
                to: email.toLowerCase().trim(),
                subject: emailText.subject,
                html: sprintf(
                    emailText.content,
                    config.get().baseUrl,
                    token,
                    config.get().baseUrl,
                    token
                )
            }
            EmailClient.addEmailNumber(emailContent, locale, '8cf6a752')
            EmailClient.send(emailContent).then(() => {
                res.sendStatus(200);
            }).catch((error) => {
                console.log(JSON.stringify(error));
                res.sendStatus(500);
            });
        },
        _resetPassword: async function (email) {
            const token = crypto.randomBytes(32).toString('hex')
            const user = await Members.findOne({
                where: {
                    email: email.toLowerCase().trim()
                }
            });
            if (!user) {
                return;
            }
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + TWO_WEEKS;
            await user.save();
            return token;
        }
        ,
        isTokenValid: function (req, res) {
            Members.findOne({
                where: {
                    resetPasswordToken: req.body.token,
                    resetPasswordExpires: {
                        [Op.gte]: Date.now()
                    }
                }
            }).then(function (user) {
                return res.sendStatus(
                    user ? 200 : 403
                )
            }).catch(function (err) {
                console.log(err)
                res.status(500).send({
                    error: 'error'
                })
            })
        }
        ,
        changePassword: async function (req, res) {
            const {token, newPassword} = req.body
            if (!token) {
                return res.sendStatus(
                    403
                )
            }
            const member = await Members.findOne({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: {
                        [Op.gte]: Date.now()
                    }
                }
            })
            if (!member) {
                return res.sendStatus(
                    403
                )
            }
            member.password = newPassword
            member.resetPasswordToken = null
            member.resetPasswordExpires = null
            await member.save();
            res.sendStatus(200);
        }
        ,
        emailExists: function (req, res) {
            const {email} = req.body
            if (!email) {
                return res.sendStatus(
                    403
                )
            }
            Members.findOne({
                where: {
                    email: email.toLowerCase().trim()
                },
                attributes: ['email', 'uuid', 'locale', 'firstName', 'lastName']
            }).then(function (user) {
                if (!user) {
                    return res.sendStatus(
                        204
                    )
                }
                res.send(
                    user
                )
            }).catch(function (err) {
                console.log(err)
                res.status(500).send({
                    error: 'error'
                })
            })
        }
    }
;
module.exports = AuthenticationController;
