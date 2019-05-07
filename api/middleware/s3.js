const config = require('config');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const accessKeyId =config.get('accessKeyId');
const secretAccessKey =config.get('secretAccessKey') ;

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});
const s3 = new AWS.S3();
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'hp-gallery',
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
});

const result = upload.single('file');

exports.result = result;