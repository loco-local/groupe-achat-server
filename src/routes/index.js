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
const ProductUploadController = require("../controller/ProductUploadController");
const BuyGroupController = require("../controller/BuyGroupController");
const BuyGroupOrderController = require("../controller/BuyGroupOrderController");
const MemberOrderController = require("../controller/MemberOrderController");
const MemberOrderItemsController = require("../controller/MemberOrderItemsController");
const MemberController = require("../controller/MemberController");
const GroupOrderAllBillsFeesController = require("../controller/GroupOrderAllBillsFeesController");
router.post(
    '/register',
    AuthenticationController.register
)

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

router.get(
    '/members/:memberId/public',
    isAuthenticated,
    MemberController.getPublic
)

router.put(
    '/members/:memberId',
    isAuthenticated,
    MemberController.update
)

router.get(
    '/members/list/:buyGroupId',
    isAdmin,
    MemberController.listForBuyGroup
)

router.post(
    '/products',
    isAdmin,
    ProductController.createProduct
)

router.post(
    '/products/internalCode/exists',
    isAdmin,
    ProductController.internalCodeExists
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

router.put(
    '/buy-group/:buyGroupId',
    isAuthenticated,
    BuyGroupController.update
)

router.get(
    '/buy-group/:buyGroupId/products/forward',
    ProductController.listPutForward
)

router.get(
    '/buy-group/:buyGroupId/products/deprecated',
    ProductController.listDeprecated
)

router.get(
    '/buy-group/:buyGroupId/products/admin-related',
    ProductController.listAdminRelated
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
    ProductUploadController.uploadSatauProducts
)
router.post(
    '/products/upload/provider/hn',
    isAdmin,
    ProductUploadController.uploadHnProducts
)

router.post(
    '/products/provider/:provider/import-associations',
    isAdmin,
    ProductUploadController.changeAssociations
)

router.post(
    '/products/upload/:uploadId/accept',
    isAdmin,
    ProductUploadController.acceptUpload
)

router.get(
    '/buy-group/:buyGroupId/orders',
    BuyGroupOrderController.list
)

router.get(
    '/buy-group/:buyGroupId/orders/unfinished',
    BuyGroupOrderController.listUnfinished
)

router.post(
    '/buy-group/:buyGroupId/orders',
    isAdmin,
    BuyGroupOrderController.create
)

router.get(
    '/buy-group/:buyGroupId/orders/:buyGroupOrderId',
    isAuthenticated,
    BuyGroupOrderController.getById
)

router.put(
    '/buy-group/:buyGroupId/orders/:buyGroupOrderId',
    isAdmin,
    BuyGroupOrderController.update
)

router.get(
    '/buy-group/:buyGroupId/orders/:orderId/memberOrders',
    isAdmin,
    BuyGroupOrderController.listMemberOrders
)

router.get(
    '/buy-group/:buyGroupId/orders/:orderId/memberOrders/items',
    isAdmin,
    BuyGroupOrderController.listMemberOrdersItems
)

router.get(
    '/buy-group/:buyGroupId/orders/:orderId/memberOrders/items/quantities',
    isAuthenticated,
    BuyGroupOrderController.listMemberOrdersItemsQuantities
)


router.get(
    '/buy-group/:buyGroupId/buy-group-order/:buyGroupOrderId/memberOrder/:memberId',
    isAuthenticated,
    MemberOrderController.getForGroupOrder
)

router.get(
    '/buy-group/:buyGroupId/orders/:buyGroupOrderId/member/:memberId/order-items',
    isAuthenticated,
    MemberOrderController.getDetailsForGroupOrder
)

router.post(
    '/buy-group/:buyGroupId/buy-group-order/:buyGroupOrderId/memberOrder/:memberId',
    isAuthenticated,
    MemberOrderController.createForGroupOrder
)

router.get(
    '/buy-group/:buyGroupId/buy-group-order/:buyGroupOrderId/fees-for-all-bills',
    isAdmin,
    GroupOrderAllBillsFeesController.list
)

router.post(
    '/buy-group/:buyGroupId/buy-group-order/:buyGroupOrderId/fees-for-all-bills/product/:productId/quantity',
    isAdmin,
    GroupOrderAllBillsFeesController.setQuantity
)

router.get(
    '/memberOrder/:memberOrderId/items',
    isAuthenticated,
    MemberOrderItemsController.listForOrder
)

router.post(
    '/memberOrder/:memberOrderId/product/:productId/quantity/expected',
    isAuthenticated,
    MemberOrderItemsController.setExpectedQuantity
)

router.post(
    '/memberOrder/:memberOrderId/product/:productId/quantity',
    isAdmin,
    MemberOrderItemsController.setQuantity
)

router.post(
    '/memberOrder/:memberOrderId/product/:productId/cost-price',
    isAdmin,
    MemberOrderItemsController.setCostUnitPrice
)

module.exports = router
