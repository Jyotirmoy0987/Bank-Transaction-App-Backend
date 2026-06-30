const Account=require('../models/Account');
const {authMiddelware}=require('../middleware/authMiddleware')

async function createAccount(req,res){
    const user=req.user;
    const account=await Account.create({
        user:user._id
    })

    res.status(201).json({
        account
    })
}
async function getUserAccounts(req,res){
    const accounts=await Account.find({user:req.user._id});
    res.status(200).json({
        accounts
    })
}

async function getAccountBalance(req,res){
    const {accountId}=req.params;

    const account=await Account.findOne({
        _id:accountId,
        user:req.user._id
    })

    if(!account){
        return res.status(404).json({
            message:"Account not Found"
        })
    }

    const balance=await account.getBalance();

    res.status(200).json({
        accountID:account._id,
        balance:balance
    })
}

module.exports={
    createAccount,
    getUserAccounts,
    getAccountBalance
}