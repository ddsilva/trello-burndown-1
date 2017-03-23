import { Router } from 'express';
import Burndown from '../modules/burndown';
import Trello from '../modules/trello';

const router = Router();

router.get('/burndown', (req, res) => new Burndown(res).get());
router.get('/trello/info', (req, res) => new Trello(res).get());

module.exports = router;