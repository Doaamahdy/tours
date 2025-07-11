
const express = require('express');
const router = express.Router();
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController')


router.route('/').get(authController.isLoggedIn,viewController.getOverview);
router.route('/overview').get(authController.isLoggedIn,viewController.getOverview);
router.route('/tour/:slug').get(authController.isLoggedIn,viewController.getTour)
router.route('/me').get(authController.protect,viewController.getAccount)
router.route('/submit-user-data').post(authController.protect,viewController.submitUserDate);
router.route('/login').get(viewController.getLoginForm);
module.exports = router;