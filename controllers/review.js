const Review = require('../models/review');
const asyncWrapper = require('../middleware/asynWrapperMiddleware');
const APIFeatures = require('../utilities/APIFeatures')
const factory = require('./handlerFactory');

const setTourUserIds = (req,res,next)=>{
  // Allow nested routes
  if(!req.body.tour) req.body.tour = req.params.tourId;
  if(!req.body.user) req.body.user = req.user._id;
  next();
}


const getAllReviews = factory.getAll(Review);

const getOneReview = factory.getOne(Review);

const createReview = factory.createOne(Review);

const deleteReview = factory.deleteOne(Review);

const updateReview = factory.updateOne(Review);

module.exports = {
    getAllReviews,
    getOneReview,
    deleteReview,
    updateReview,
    createReview,
    setTourUserIds
}



