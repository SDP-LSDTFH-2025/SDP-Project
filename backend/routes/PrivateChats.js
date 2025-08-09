const express = require('express');
const router = express.Router();
const { PrivateChats } = require('../models');

router.get('/', async (req, res) => {
    const privateChats = await PrivateChats.findAll();
    res.json(privateChats);
});

module.exports = router;