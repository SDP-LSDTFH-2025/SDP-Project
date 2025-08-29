const express = require('express');
const router = express.Router();
const { Study_groups } = require('../models');

router.get('/groupChats/:id', async (req, res) => {
    try {
        const GCid = req.params.id;

        if (!GCid) {
            return res.status(400).json({ error: 'Group identification not provided' });
        }

        const GC = await Study_groups.findByPk(GCid);

        if (!GC) {
            return res.status(404).json({ error: 'Group not found' });
        }

        return res.status(200).json({ GC });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;