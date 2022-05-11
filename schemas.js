const BaseJoi = require('joi');
const { number } = require('joi');

// for sanitizing html
const sanitizeHtml = require('sanitize-html');


/**
 * defining html sanitizing extension extension for Joi 
 * @param {*} joi 
 * @returns 
 */
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

// Joi schemas for validation of landscapes and reviews

module.exports.landscapeSchema = Joi.object({
    landscape: Joi.object({
        title: Joi.string().required().escapeHTML(),
        location: Joi.string().required(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})