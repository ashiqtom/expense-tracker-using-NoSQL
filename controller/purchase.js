const Razorpay = require('razorpay');
const Order = require('../models/order');
const User = require('../models/user');
const mongoose = require('mongoose');

exports.getTransactionStatus = async (req, res) => {
    try {
        // await User.findOneAndUpdate({_id:req.user._id},{isPremiumUser:true})
        // await User.findByIdAndUpdate(req.user._id,{ isPremiumUser: true });


        const isPremiumUser = req.user.isPremiumUser;
        res.status(200).json({ status: isPremiumUser });
    } catch (err) {
        console.error('Error in getTransactionStatus:', err);
        res.status(500).json({ error: err, message: 'Something went wrong' });
    }
};

exports.purchasePremium = async (req, res) => {
    try {        
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET 
        });
        const amount = 2500; 
        
        const order = await rzp.orders.create({ amount, currency: "INR" });

        const newOrder = new Order({ orderId: order.id, status: 'PENDING', userId: req.user._id });
        await newOrder.save();
        
        res.status(201).json({ order, key_id: rzp.key_id });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong', err: err });
    }
};

exports.updateFailedStatus = async (req, res) => {
    try {
        const { order_id } = req.body;
        const order = await Order.findOne({ orderId: order_id });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        order.status = 'FAILED';
        await order.save();
        res.status(200).json({ success: true, message: "Order status updated to FAILED." });
    } catch (err) {
        console.error('Error updating order status:', err);
        // res.status(500).json({ error: err, message: 'Failed to update order status.' });
    }
};
exports.updateTransactionStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { payment_id, order_id } = req.body;

        const order = await Order.findOne({ orderId: order_id }).session(session);
        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const updateUserPromise = User.findByIdAndUpdate(
            req.user._id,
            { isPremiumUser: true },
            { session }
        );

        order.paymentId = payment_id;
        order.status = 'SUCCESSFUL';
        const updateOrderPromise = order.save({ session });

        await Promise.all([updateOrderPromise, updateUserPromise]);

        await session.commitTransaction();
        session.endSession();

        res.status(202).json({ success: true, message: "Transaction Successful" });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error in updateTransactionStatus:', err);
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
};
