import catchAsync from "../utils/catch_async.js";
import AppError from "../utils/app_error.js";

export const getAll = (model) =>
  catchAsync(async (req, res, next) => {
    let filters = {};

    // check for user ID
    if (req.params.id) {
      filters = { user: req.params.id };
    }

    const docs = await model.find(filters);

    res.status(200).json({
      status: "ok",
      length: docs.length,
      data: {
        docs,
      },
    });
  });

export const getOne = (model) =>
  catchAsync(async (req, res, next) => {
    const docId = req.params.id;
    const doc = await model.findById(docId);

    if (!doc)
      return next(new AppError("no documment was found with that ID", 404));

    res.status(200).json({
      status: "ok",
      data: {
        doc,
      },
    });
  });

export const createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await model.create(req.body);

    res.status(201).json({
      status: "ok",
      data: {
        newDoc,
      },
    });
  });

export const updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const docId = req.params.id;
    const updatedDoc = await model.findByIdAndUpdate(docId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc)
      return next(new AppError("no doccument was found with that ID", 404));

    res.status(200).json({
      status: "ok",
      data: {
        updatedDoc,
      },
    });
  });

export const deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const docId = req.params.id;
    const doc = await model.findByIdAndDelete(docId);

    if (!doc)
      return next(new AppError("no docummnet was found with that ID", 404));

    res.status(204).json({
      status: "ok",
      data: null,
    });
  });

export const deleteAll = (model) =>
  catchAsync(async (req, res, next) => {
    let filters = {};

    // check for user ID
    if (req.params.id) {
      filters = { user: req.params.id };
    }

    await model.deleteMany(filters);

    res.status(204).json({
      status: "ok",
      data: null,
    });
  });
