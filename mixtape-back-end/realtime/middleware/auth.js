var wrapAsync = require('express-async-handler')
var User = require('./../models/users');

const auth = wrapAsync(async (token, placeholder, next) => {

})