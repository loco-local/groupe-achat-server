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
const UserOrderController = require("../controller/UserOrderController");
const UserOrderItemsController = require("../controller/UserOrderItemsController");
const MemberController = require("../controller/MemberController");
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
    '/members/:memberId',
    isAuthenticated,
    MemberController.get
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
    '/buy-group/:buyGroupId',
    BuyGroupController.getForId
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
    '/buy-group/:buyGroupId/orders',
    isAdmin,
    BuyGroupOrderController.list
)

router.get(
    '/buy-group/:buyGroupId/orders/unfinished',
    isAuthenticated,
    BuyGroupOrderController.listUnfinished
)

router.post(
    '/buy-group/:buyGroupId/orders',
    isAdmin,
    BuyGroupOrderController.create
)

router.put(
    '/buy-group/:buyGroupId/orders',
    isAdmin,
    BuyGroupOrderController.update
)

router.get(
    '/buy-group/:buyGroupId/orders/:orderId/userOrders',
    isAdmin,
    BuyGroupOrderController.listUserOrders
)

router.get(
    '/buy-group/:buyGroupId/orders/:orderId/userOrders/items',
    isAdmin,
    BuyGroupOrderController.listUserOrdersItems
)

router.get(
    '/buy-group/:buyGroupId/buy-group-order/:buyGroupOrderId/userOrder/:userId',
    isAuthenticated,
    UserOrderController.getForGroupOrder
)

router.get(
    '/buy-group/:buyGroupId/orders/:buyGroupOrderId/user/:userId/order-items',
    isAuthenticated,
    UserOrderController.getDetailsForGroupOrder
)

router.post(
    '/buy-group/:buyGroupId/buy-group-order/:buyGroupOrderId/userOrder/:userId',
    isAuthenticated,
    UserOrderController.createForGroupOrder
)

router.get(
    '/userOrder/:userOrderId/items',
    isAuthenticated,
    UserOrderItemsController.listForOrder
)

router.post(
    '/userOrder/:userOrderId/product/:productId/quantity',
    isAuthenticated,
    UserOrderItemsController.setQuantity
)

module.exports = router
