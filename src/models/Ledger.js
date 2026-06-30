const mongoose=require('mongoose');

const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.Object,
        ref:"Account",
        required:[true,"Ledger must be associated with an account"],
        immutable:true,
        index:true
    },
    amount:{
        type:Number,
        required:[true,"Amountis required for creating a transaction"],
        min:[0,"Transaction amount cannot be negative"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Transaction",
        required:[true,"Ledger must be associated with a transaction"],
        immutable:true,
        index:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"Type can be either CREDIT or DEBIT"
        },
        required:[true,"Ledger type is required"],
        immutable:true
    }
})

function preventLedgerModification(){
    throw new Error("Ledger entries are immutable and cannot be modified or deleted")
}

ledgerSchema.pre('findOneAndUpdate',preventLedgerModification)
ledgerSchema.pre('updateOne',preventLedgerModification)
ledgerSchema.pre('deleteOne',preventLedgerModification)
ledgerSchema.pre('remove',preventLedgerModification)
ledgerSchema.pre('deleteMany',preventLedgerModification)
ledgerSchema.pre('findByIdAndUpdate',preventLedgerModification)
ledgerSchema.pre('findByIdAndDelete',preventLedgerModification)
ledgerSchema.pre('findByOneAndDelete',preventLedgerModification)
ledgerSchema.pre('findByOneAndReplace',preventLedgerModification)


const ledgerModel=mongoose.model("Ledger",ledgerSchema);

module.exports=ledgerModel