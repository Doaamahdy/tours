const asyncWrapper = require('../middleware/asynWrapperMiddleware');
const AppError = require('../utilities/appError');
const APIFeatures = require('./../utilities/APIFeatures')
const deleteOne = Modedl => asyncWrapper(async (req, res, next) => {
    const document = await Modedl.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({
      status: "Success",
      data: {
        data: null,
      },
    });
  });


  const updateOne = Model => asyncWrapper(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (!document) {
      return next(new AppError("document Not Found", 404));
    }
    res.status(200).json({
      status: "Success",
      data: {
        data:document,
      },
    });
  }); 

  const createOne = Model => asyncWrapper(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: "Success",
      data: {
        data: document,
      },
    });
  });

  const getOne = (Model,populateOptions) => asyncWrapper(async (req, res, next) => {
    let query =  Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions);
    const document = await query;

    if (!document) {
      return next(new AppError("document Not Found", 404));
    }
    res.status(200).json({
      status: "Success",
      data: {
        data:document,
      },
    });
  });

  const getAll = Model => asyncWrapper(async (req, res, next) => {
    // samll hack
    let filter = {};
    if(req.params.tourId) filter = {tour:req.params.tourId};
    
    const query = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limit()
      .sort()
      .paginate();
    // const documents = await query.explain();
    const documents = await query;
    res.status(200).json({
      status: "Success",
      data: {
        count: documents.length,
        data: documents,
      },
    });
  });

  module.exports = {
    deleteOne,
    updateOne,
    createOne,
    getOne,
    getAll
  }
  