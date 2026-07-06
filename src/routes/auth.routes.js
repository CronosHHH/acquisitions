import express from 'express';
import { signup } from '#controllers/auth.controller.js';

const router = express.Router();

router.post('/sing-up', signup);

router.post('/sing-in', (req, res) => {
  res.send('POST /api/auth/sing-in response');
});
router.post('/sing-out', (req, res) => {
  res.send('POST /api/auth/sing-out response');
});

export default router;