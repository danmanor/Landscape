const Joi = require('joi');
const { number } = require('joi');

// Joi schemas for validation of landscapes and reviews

module.exports.landscapeSchema = Joi.object({
    landscape: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})