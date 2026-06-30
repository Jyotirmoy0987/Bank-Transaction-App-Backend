const mongoose=require('mongoose');

const transactionSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.Object,
        ref:"Account",
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.Object,
        ref:"Account",
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:"Status can be either PENDING, COMPLETED, FAILED, or REVERSED"
        },
        default:"PENDING"
    },
    amount:{
        type:Number,
        required:[true,"Amountis required for creating a transaction"],
        min:[0,"Transaction amount cannot be negative"]
    },
    idempotencyKey:{
        type:String,
        required:[true,"Idempotency key is required for transaction"],
        index:true,
        unique:true
    }
},{
    timestamps:true
})


const transactionModel=mongoose.model("Transaction",transactionSchema);

module.exports=transactionModel