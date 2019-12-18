var User = require('./../models/users');
var express = require('express')
var router = express.Router()
var wrapAsync = require('express-async-handler');
var Messages = require('./../models/messages');
var assert = require('assert');
var jwt = require('jsonwebtoken');




router.get('/messages/:id', wrapAsync(async (req, res) => {
    const token = req.headers['x-auth-token'];
    assert.ok(token, 'Must give token');
    // const { query } = req;
    // assert.ok(query, "Must give query");

    const secret = 'SECRET'
    const decoded = await nonBlockingVerify(token, secret);
    const id = req.params.id

    assert.ok(id, "must give convo id")

    var lastId = req.query.lastId;
    const limit = Math.min(30, (req.query.limit || 30));





    let query = {
        conversationId: id
    }

    if (lastId) {
        query._id = {
            $lt: lastId
        }
    }


    let messages = await Messages
        .find(query)
        .limit(20)
        .sort('-createdAt')
        .lean()
        .exec();
    /*
        let agrregation = await Messages.aggregate([
            {
                $match: { conversationId: }
            }
        ])
    */
    assert.ok(messages, "No playlists were found")
    res.json({
        message: 'Messages were found',
        messages,
        // lastId: playlists[playlists.le]
    })

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