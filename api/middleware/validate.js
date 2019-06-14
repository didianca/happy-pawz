//takes a validation function as a parameter
//if any error occurs it sends the error

module.exports = (validator) => {
    return (req, res, next) => {
        const {error} = validator(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        next();//tells the program to go to the next function (callback) when this is dealt with
    }
};