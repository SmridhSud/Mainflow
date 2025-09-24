const express = require('express');
const ctrl = require('../controllers/user.controller');
const router = express.Router();

/**
 * Creation
 */
router.post('/', ctrl.createUser);
router.post('/bulk', ctrl.createManyUsers);

/**
 * Read
 */
router.get('/', ctrl.getUsers); // supports filtering, pagination, projection via querystring
router.get('/:id', ctrl.getUserById);

/**
 * Update
 */
router.put('/:id', ctrl.updateUser); // full replace-ish (uses findByIdAndUpdate)
router.patch('/:id/increment', ctrl.incrementAge);
router.post('/bulkUpdate', ctrl.bulkUpdate);

/**
 * Delete
 */
router.delete('/:id', ctrl.deleteUser);
router.patch('/:id/soft-delete', ctrl.softDelete);
router.post('/bulkDelete', ctrl.deleteMany);

/**
 * Transactions demo
 */
router.post('/tx/create-two', ctrl.createTwoUsersTransaction);

module.exports = router;
