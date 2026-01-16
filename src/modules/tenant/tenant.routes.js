const express = require('express');
const { getTenantDetails } = require('./tenant.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/me', authenticate, getTenantDetails);

module.exports = router;
