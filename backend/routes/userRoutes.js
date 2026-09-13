const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authConfig = require('../config/authConfig');

// Оновлення профілю користувача
router.put('/update', authConfig.verifyToken, userController.updateUserProfile);

// Отримати профіль користувача
router.get('/profile', authConfig.verifyToken, userController.getUserProfile);

//видалити користувача
router.delete('/:userId', authConfig.verifyToken, userController.deleteUser);

router.get('/', authConfig.verifyAdmin, userController.getAllUsers);

router.get('/role-upgrade-request', authConfig.verifyToken, userController.getLastRequestByUserId);
router.post('/role-upgrade-request', authConfig.verifyToken, userController.createRequestPrivilege);

router.get('/role-upgrade-requests', authConfig.verifyAdmin, userController.getRequests);
router.put('/role-upgrade-request/:id/approve', authConfig.verifyAdmin, userController.approveRequestPrivilege);
router.put('/role-upgrade-request/:id/reject', authConfig.verifyAdmin, userController.rejectRequestPrivilege);

module.exports = router;
