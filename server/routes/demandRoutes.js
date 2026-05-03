// server/routes/demandRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/demandController');
router.post('/submit', ctrl.submitDemand);
router.get('/', ctrl.getDemands);
router.get('/:id', ctrl.getDemandById);
router.patch('/:id/stage', ctrl.updateStage);
router.delete('/:id', ctrl.deleteDemand);
module.exports = router;