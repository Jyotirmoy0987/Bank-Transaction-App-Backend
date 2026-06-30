const Transaction = require('../models/Transaction')
const Ledger = require('../models/Ledger')
const Account = require('../models/Account')
const mongoose = require('mongoose')


async function createTransaction(req, res) {

    // Validate request

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    const fromUserAccount = await Account.findOne({ _id: fromAccount })
    const toUserAccount = await Account.findOne({ _id: toAccount })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }


    //Validate Idempotency

    const isTransactionAlreadyExist = await Transaction.findOne({ idempotencyKey: idempotencyKey });
    if (isTransactionAlreadyExist) {
        if (isTransactionAlreadyExist.status === 'COMPLETED') {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExist
            })
        }

        if (isTransactionAlreadyExist.status === 'PENDING') {
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }
        if (isTransactionAlreadyExist.status === 'FAILED') {
            return res.status(500).json({
                message: "Transaction processing failed",
            })
        }
        if (isTransactionAlreadyExist.status === 'REVERSED') {
            return res.status(500).json({
                message: "Transaction was reversed, please retry",
            })
        }
    }

    //Check account status

    if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }

    //Derive sender balance from ledger

    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    let transaction;
    let session;

    try {
        session = await mongoose.startSession();
        session.startTransaction();

        transaction = (await Transaction.create([{
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0]

        await Ledger.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await Ledger.create([{
            account: toUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        transaction = await Transaction.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session, new: true }
        )

        await session.commitTransaction()
        session.endSession()
    } catch (err) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        
        if (transaction && transaction._id) {
            await Transaction.updateOne(
                { _id: transaction._id },
                { status: "FAILED" }
            ).catch(() => {});
        }

        return res.status(500).json({ message: "Transaction failed" });
    }

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })

}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await Account.findOne({ _id: toAccount })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await Account.findOne({ user: req.user._id })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    //Validate Idempotency

    const isTransactionAlreadyExist = await Transaction.findOne({ idempotencyKey: idempotencyKey });
    if (isTransactionAlreadyExist) {
        if (isTransactionAlreadyExist.status === 'COMPLETED') {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExist
            })
        }

        if (isTransactionAlreadyExist.status === 'PENDING') {
            return res.status(200).json({
                message: "Transaction is still processing",
            })
        }
        if (isTransactionAlreadyExist.status === 'FAILED') {
            return res.status(500).json({
                message: "Transaction processing failed",
            })
        }
        if (isTransactionAlreadyExist.status === 'REVERSED') {
            return res.status(500).json({
                message: "Transaction was reversed, please retry",
            })
        }
    }

    let transaction;
    let session;

    try {
        session = await mongoose.startSession();
        session.startTransaction();

        transaction = (await Transaction.create([{
            fromAccount: fromUserAccount._id,
            toAccount: toUserAccount._id,
            amount,
            idempotencyKey,
            status: 'PENDING'
        }], { session }))[0]

        await Ledger.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await Ledger.create([{
            account: toUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        transaction = await Transaction.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session, new: true }
        )

        await session.commitTransaction()
        session.endSession()
    } catch (err) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }

        if (transaction && transaction._id) {
            await Transaction.updateOne(
                { _id: transaction._id },
                { status: "FAILED" }
            ).catch(() => {});
        }

        return res.status(500).json({
            message: "Transaction failed"
        })
    }

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}