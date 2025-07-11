const express = require('express');
// Due to using mergeParams the router can get an access to tourId from the previous router
const router = express.Router({mergeParams:true});
const {    getAllReviews,
    getOneReview,
    deleteReview,
    updateReview,
    createReview,
    setTourUserIds
} = require('../controllers/review');
const {protect,restrictTo} = require('../controllers/authController')    

router.use(protect);

router.
    route('/')
    .get(getAllReviews)
    .post(restrictTo('user'),setTourUserIds,createReview);

router
    .route('/:id')
    .get(getOneReview)
    .delete(restrictTo('user','admin'),deleteReview)
    .patch(restrictTo('user','admin'),updateReview);

module.exports = router; 


