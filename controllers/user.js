const multer = require("multer");
// Sharp is an image processing library
const sharp = require("sharp");
const User = require("../models/user");
const asyncWrapper = require("../middleware/asynWrapperMiddleware");
const AppError = require("../utilities/appError");
const factory = require("./handlerFactory");

// image will be stored as a buffer in a memory
const multerStorage = multer.memoryStorage({});

// its goal to test if uploaded file is an image
// if yes it sends true otherwsie sends false
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadUserPhoto = upload.single("photo");

const resizeUserPhoto = asyncWrapper(async (req, res, next) => {
  if (!req.file) return next();
  // its better to save a file in memory
  // we want a sqaure image so the height
  // should be the same as the width
  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...fields) => {
  let newObj = { ...obj };
  const keys = Object.keys(newObj);
  keys.forEach((key) => {
    if (!fields.includes(key)) delete newObj[key];
  });
  return newObj;
};

const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

const updateMe = asyncWrapper(async (req, res, next) => {
  console.log(req.file);
  // 1) Create error if user Posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "this route not for password update please use /updatePassword",
        400
      )
    );
  }
  // 2) filtred out unwanted fields names that are nto allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = asyncWrapper(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
    {
      new: true,
    }
  );
  res.status(204).json({
    status: "success",
    data: null,
  });
});


const getAllUsers = factory.getAll(User);
const createUser = factory.createOne(User);
const getUser = factory.getOne(User);
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
