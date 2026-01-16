const express = require('express');
const { getBooks, createBook, updateBook, deleteBook } = require('./books.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getBooks);
router.post('/', authorize('TENANT_ADMIN', 'STAFF'), createBook);
router.patch('/:id', authorize('TENANT_ADMIN', 'STAFF'), updateBook);
router.delete('/:id', authorize('TENANT_ADMIN'), deleteBook);

module.exports = router;
