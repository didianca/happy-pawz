//make sure json web token is provided b4 starting app so the auth doesn't break.

const config = require('config');

module.exports = function () {
    if(!config.get('jwtPrivateKey')) {
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined.')
    }
};