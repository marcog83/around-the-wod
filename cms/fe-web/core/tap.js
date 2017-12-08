/**
 * Created by mgobbi on 03/08/2017.
 */
module.exports = (callback) => {
    return function (response) {
        callback(response);
        return response;
    }
};