const multer = require("multer");
const sharp = require("sharp");
const Tour = require("../models/tour");
const asyncWrapper = require("../middleware/asynWrapperMiddleware");
const factory = require("./handlerFactory");
const AppError = require("./../utilities/appError");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files
const resizeTourImages = asyncWrapper(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // console.log(req.files);
  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

const getTourStats = asyncWrapper(async (req, res, next) => {
  // Aggregate Pipeline
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
const aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

const getAllTours = factory.getAll(Tour);
const createTour = factory.createOne(Tour);
const getTour = factory.getOne(Tour, { path: "reviews" });
const deleteTour = factory.deleteOne(Tour);
const updateTour = factory.updateOne(Tour);


// '/tours-within/:distance/center/latlng/unit/:unit
// the radius supposed to be in radins(distance/radiusOftheEarth)
const getToursWithin = asyncWrapper(async (req, res, next) => {
  const { distance, latlang, unit } = req.params;
  const [lat, lng] = latlang.split(",");
  // check if its miles or kilometers
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and langtiude in the format lat,lang",
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(distance, " ", lat, " ", lng, " ", unit);

  res.status(200).json({
    status: "Success",
    data: {
      count: tours.length,
      data: tours,
    },
  });
});

const getDistances = asyncWrapper(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const multiplier = unit === "mi" ? 0.000621371192 : 0.001;
  if (!lat || !lng) {
    return next(new AppError("Please Provide latitude and langitude", 400));
  }
  // geoNear should be the firdt filter in aggregate pipeline unless it will raise an error
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});

module.exports = {
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
};
