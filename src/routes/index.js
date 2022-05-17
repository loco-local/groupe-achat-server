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
const BuyGroupController = require("../controller/BuyGroupController");
const BuyGroupOrderController = require("../controller/BuyGroupOrderController");
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

router.post(
    '/products',
    isAdmin,
    ProductController.createProduct
)

router.put(
    '/products/:productId',
    isAdmin,
    ProductController.updateProduct
)

router.get(
    '/buy-group/path/:buyGroupPath',
    BuyGroupController.getForPath
)

router.get(
    '/buy-group/:buyGroupId/products/forward',
    ProductController.listPutForward
)

router.get(
    '/buy-group/:buyGroupId/products/deprecated',
    ProductController.listDeprecated
)

router.post(
    '/products/forward',
    ProductController.putForward
)

router.post(
    '/products/deprecate',
    isAdmin,
    ProductController.deprecate
)

router.post(
    '/products/:productId/available',
    isAdmin,
    ProductController.makeAvailable
)

router.post(
    '/products/:productId/unavailable',
    isAdmin,
    ProductController.makeUnavailable
)

router.post(
    '/products/upload/provider/satau',
    isAdmin,
    ProductController.uploadSatauProducts
)

router.post(
    '/products/upload/:uploadId/accept',
    isAdmin,
    ProductController.acceptUpload
)

router.get(
    '/buy-group-orders/:buyGroupId',
    isAdmin,
    BuyGroupOrderController.list
)

router.post(
    '/buy-group-orders',
    isAdmin,
    BuyGroupOrderController.create
)

router.put(
    '/buy-group-orders/:orderId',
    isAdmin,
    BuyGroupOrderController.update
)

module.exports = router
