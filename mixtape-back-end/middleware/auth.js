//var admin = global.admin;
var admin = require("firebase-admin");
var express = require('express')
var router = express.Router()
const wrapAsyncFunction = require('express-async-handler');
var User = require('./../models/users');
var jwt = require('jsonwebtoken');


router.use(wrapAsyncFunction(async (req, res, next) => {
    const token = req.headers['x-auth-token'] || req.query.token || req.body.token;

    // Check if there is a token
    if (!token) throw new Error('Must give a token')



    var decoded = await nonBlockingVerify(token, 'SECRET');

    let { _id, passLastModified } = decoded;

    let user = await User.findOne({
        _id
    }).exec()



    if (user) {
        // console.log('user is: ' + user)
        user = user.toObject();
        // console.log(new Date(passLastModified))
        let tokenTime = (new Date(passLastModified)).getTime();
        let dbTime = (new Date(user.passLastModified)).getTime();
        if (tokenTime < dbTime) throw new Error('The password has been changed')
        req.user = user
    } else {
        throw new Error('User does not exist!')
    }


    //console.log(req.user)


    next();
}))

function nonBlockingVerify(token, secret) {
    return new Promise((resolve, reject) => {
        try {
            var decoded = jwt.verify(token, secret);
            resolve(decoded);
        } catch (e) {
            reject(e)
        }
    })
}


module.exports = router;
