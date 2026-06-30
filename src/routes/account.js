const express=require('express');
const router=express.Router();
const {authMiddleware}=require('../middleware/authMiddleware')
const {createAccount, getUserAccounts,getAccountBalance}=require('../controllers/account')




router.post('/',authMiddleware,createAccount)
router.get('/',authMiddleware,getUserAccounts)
router.get('/balance/:accountId',authMiddleware,getAccountBalance)

module.exports=router