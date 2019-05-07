const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin');
const {result} = require('../middleware/s3');


//get gallery
router.get('/', async (req,res) => {
    //const gallery = await Gallery
    res.send('list of pics')//gallery
});

//post new pic
router.post('/', result, async (req, res) => {
    res.send('Uploaded!')
});


module.exports = router;