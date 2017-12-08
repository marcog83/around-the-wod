/**
 * Created by marcogobbi on 13/09/2017.
 */
function _helper(data) {
    return data.map(i => i.value);

}
module.exports=function extractValue(initialValue) {
    return function (response) {
        return Object.entries(response).map(([key, data]) => {
            const value = Array.isArray(data.value) ? _helper(data.value) : data.value;
            return [key, value];
        }).reduce((prev, [key, value]) => {
            prev[key] = value;
            return prev;
        }, initialValue)
    }

}