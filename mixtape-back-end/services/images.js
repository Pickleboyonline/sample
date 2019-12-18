var Users = require('./../models/users');
var express = require('express')
var router = express.Router()
var wrapAsync = require('express-async-handler');

var multer = require('multer')
var path = require('path')
var fs = require('fs');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'img'))
    },
    filename: function (req, file, cb) {
        cb(null, `${req.user.username}-${(new Date()).getTime().toString()}.png`)
    }
})


var upload = multer({
    storage: storage,
    limits: {
        fileSize: 5000000
    },

})



router.post('/images', upload.single('avatar'), wrapAsync(async (req, res) => {
    let { _id } = req.user
    // console.log(req)
    if (!req.file) {
        console.log("No file received");
        throw new Error("No file received")
        // return res.json({
        //     success: false
        // });

    } else {
        console.log('file received');
        if (req.user.avatarFileName !== null) {
            fs.unlink(path.join(__dirname, '..', 'img', req.user.avatarFileName), async (err) => {
                if (err) throw err;
                // if no error, file has been deleted successfully
                console.log('File deleted!');
                await Users.findByIdAndUpdate(_id, {
                    avatarFileName: req.file.filename
                }).lean().exec()

                return res.json({
                    success: true
                })
            })

        } else {
            // Check if legacy image exists so it can be removed
            let possibleAvatarPath = path.join(__dirname, '..', 'img', req.user.username + '.png')
            fs.stat(possibleAvatarPath, async (err, stat) => {
                if (err == null) {

                    console.log('File exists');
                    fs.unlink(possibleAvatarPath, async (err) => {
                        if (err) throw err;
                        // if no error, file has been deleted successfully
                        console.log('File deleted!');
                        await Users.findByIdAndUpdate(_id, {
                            avatarFileName: req.file.filename
                        }).lean().exec()

                        return res.json({
                            success: true
                        })
                    })



                } else if (err.code === 'ENOENT') {
                    // file does not exist
                    await Users.findByIdAndUpdate(_id, {
                        avatarFileName: req.file.filename
                    }).lean().exec()

                    return res.json({
                        success: true
                    })

                } else {
                    console.log('Some other error: ', err.code);
                    throw new Error('' + err.message)
                }
            })

        }


    }



}))



module.exports = router;