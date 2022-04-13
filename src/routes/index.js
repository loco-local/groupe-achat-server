const express = require('express')
const router = express.Router()
const AuthenticationController = require('../controller/AuthenticationController')

const AuthenticationControllerPolicy = require('../policy/AuthenticationControllerPolicy')

// const UserController = require('../controller/UserController')
//
const isAuthenticated = require('../policy/isAuthenticated')
// const isOwnerOrAdmin = require('../policy/isOwnerOrAdmin')
// const isArdoiseUser = require('../policy/isArdoiseUser')
// const isOwnerArdoiseUserOrAdmin = require('../policy/isOwnerArdoiseUserOrAdmin')
const isAdmin = require('../policy/isAdmin')
const ProductController = require("../controller/ProductController");

// router.post(
//   '/api/register',
//   AuthenticationControllerPolicy.register,
//   AuthenticationController.register
// )

router.post(
    '/login',
    AuthenticationController.login
)

router.post(
    '/reset-password',
    AuthenticationController.resetPassword
)

router.post(
    '/token-valid',
    AuthenticationController.isTokenValid
)

router.post(
    '/change-password',
    AuthenticationController.changePassword
)

router.get(
    '/products',
    ProductController.list
)

module.exports = router
