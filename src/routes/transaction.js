const express=require('express')
const router=express.Router();
const {authSystemUserMiddleware, authMiddleware}=require('../middleware/authMiddleware')
const {createInitialFundsTransaction, createTransaction}=require('../controllers/transaction')

router.post('/',authMiddleware,createTransaction)
router.post('/system/initial-funds',authSystemUserMiddleware,createInitialFundsTransaction)

module.exports=router