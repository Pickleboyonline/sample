//var admin = global.admin;
var express = require('express')
var router = express.Router()
const wrapAsyncFunction = require('express-async-handler');
var Admins = require('./../models/admins');
var jwt = require('jsonwebtoken');


router.use(wrapAsyncFunction(async (req, res, next) => {
    const token = req.headers['x-auth-token'] || req.query.token || req.body.token;

    // Check if there is a token
    if (!token) throw new Error('Must give a token')



    var decoded = await nonBlockingVerify(token, 'SECRET');


    // console.log(decoded)

    let { _id, admin } = decoded;

    let doc = await Admins.findOne({
        _id
    }).exec()



    if (doc) {
        if (admin === false) {
            throw new Error('You do not have access to this route')
        }

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
