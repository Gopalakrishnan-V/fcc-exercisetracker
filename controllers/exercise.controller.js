const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const moment = require("moment");
const User = require("../models/user.model");
const Exercise = require("../models/exercise.model");

module.exports.createUser = (req, res) => {
  const { username } = req.body;
  const schema = Joi.object({
    username: Joi.string()
      .alphanum()
      .required()
  });
  const { value, err } = schema.validate({
    username
  });
  if (err) {
    return res.status(400).send(err);
  } else {
    User.findOne({ username }, (err, data) => {
      if (err) {
        return res.status(500).send({ message: "Something went wrong" });
      } else if (data) {
        return res.status(400).send("username already taken");
      } else {
        const user = new User({ username });
        user.save((err, data) => {
          if (err) {
            return res.status(500).send({ message: "Something went wrong" });
          } else {
            return res.send({ username, _id: data._id });
          }
        });
      }
    });
  }
};
module.exports.addExercise = (req, res) => {
  const { userId } = req.body;
  const schema = Joi.object({
    userId: Joi.string().required(),
    description: Joi.string().required(),
    duration: Joi.number().required(),
    date: Joi.date().required()
  });
  const { value, err } = schema.validate(req.body);
  if (err) {
    return res.status(400).send(err);
  } else {
    User.findById(userId, (err, userData) => {
      if (err) {
        return res.status(500).send({ message: "Something went wrong" });
      } else if (!userData) {
        return res.status(400).send("unknown _id");
      } else {
        const exercise = new Exercise(value);
        exercise.save((err, exerciseData) => {
          if (err) {
            return res.status(500).send({ message: "Something went wrong" });
          } else {
            return res.send({
              username: userData.username,
              description: exerciseData.description,
              duration: exerciseData.duration,
              _id: exerciseData._id,
              date: moment(exerciseData.date).format("ddd MMM DD YYYY")
            });
          }
        });
      }
    });
  }
};
module.exports.getExercises = (req, res) => {
  let { userId, from, to, limit } = req.query;
  limit = parseInt(limit);

  const schema = Joi.object({
    userId: Joi.string().required(),
    from: Joi.date(),
    to: Joi.date(),
    limit: Joi.number()
  });
  const { value, err } = schema.validate(req.query);
  if (err) {
    return res.status(400).send("unknown userId");
  } else {
    User.findById(userId, (err, userData) => {
      if (err) {
        return res.status(400).send("unknown userId");
      } else if (!userData) {
        return res.status(400).send("unknown userId");
      } else {
        const queryConditions = { userId };
        if (from) {
          queryConditions.date = { $gte: new Date(from) };
        }
        if (to) {
          if (queryConditions.date) {
            queryConditions.date["$lte"] = new Date(to);
          } else {
            queryConditions.date = { $lte: new Date(to) };
          }
        }

        const query = Exercise.find(queryConditions);
        if (limit) {
          query.limit(limit);
        }

        query.exec((err, exercises) => {
          if (err) {
            return res.status(500).send({ message: "Something went wrong" });
          } else {
            return res.send({
              _id: userData._id,
              username: userData.username,
              count: exercises.length,
              log: exercises.map(({ description, duration, date }) => ({
                description,
                duration,
                date: moment(date).format("ddd MMM DD YYYY")
              }))
            });
          }
        });
      }
    });
  }
};
