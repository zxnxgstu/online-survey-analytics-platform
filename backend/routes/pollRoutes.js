const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const authConfig = require('../config/authConfig');

router.get('/categories', pollController.getCategories);
router.get('/public', pollController.getAllPolls);

router.get('/:pollId', authConfig.verifyToken, pollController.getPollDetails);
router.post('/:pollId/vote', authConfig.verifyToken, pollController.submitVote);

router.get('/', authConfig.verifyAdvancedUser, pollController.getUserPolls);
router.post('/create', authConfig.verifyAdvancedUser, pollController.createPoll);
router.put('/:pollId', authConfig.verifyAdvancedUser, pollController.updatePoll);
router.get('/:pollId/results', authConfig.verifyAdvancedUser, pollController.getPollResults);
router.get('/:pollId/status', authConfig.verifyAdvancedUser, pollController.getPollStatus);
router.delete('/:pollId', authConfig.verifyAdvancedUser, pollController.deletePoll);

router.post('/:pollId/close', authConfig.verifyAdmin, pollController.closePoll);
router.post('/:pollId/moderate', authConfig.verifyAdmin, pollController.moderatePoll);



module.exports = router;