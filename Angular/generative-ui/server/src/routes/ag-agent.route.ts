import { Router } from 'express';
import { agAgentController } from '../controllers/ag-agent.controller';


const router = Router();

router.post('/run', (req,res,next) => agAgentController.runAgent(req,res,next));

export const agAgentRouter = router;