require('dotenv').config();
var authData = {
    user: function(info) {
        return process.env.USER
    },
    password: function(info) {
        return process.env.PASSWORD
    }
};

module.exports = authData;