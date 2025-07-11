const express = require("express");
const router = express.Router();
const reviewRouter = require("../routes/review");

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require("../controllers/tour");
const { protect, restrictTo } = require("../controllers/authController");

// To Post a Review On a Tour
// id of the user comes from the current logged in user
// POST /tours/344556(tourID)/reviews
// GET /tours/355656(tourID)/reviews/4656(reviewID)

router.route("top-5-cheap").get(aliasTopTours, getAllTours);

router.route("/tour-stats").get(getTourStats);

// router.route('/monthly-plan/:yesr').get

router
  .route("/tours-within/:distance/center/:latlang/unit/:unit")
  .get(getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(getDistances);

router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);

router.use("/:tourId/reviews", reviewRouter);
router
  .route("/:id")
  .get(getTour)
  .patch(
    protect,
    restrictTo("admin", "lead-guide"),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
