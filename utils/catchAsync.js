/**
 * wrapper function
 * executing the input function and passing error if occurs.
 * @param {*} func 
 * @returns new adjusted function
 */
module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}