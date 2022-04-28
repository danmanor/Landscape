class ExpressError extends Error {
    constructor(message, statucCode){
        super();
        this.message = message;
        this.statucCode = statucCode;
    }
}

module.exports = ExpressError;