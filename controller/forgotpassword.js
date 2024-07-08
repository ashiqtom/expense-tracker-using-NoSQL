const User = require('../models/user');
const ForgotPasswordRequest = require('../models/forgotPasswordRequests');
const bcrypt = require('bcrypt');
const Sib = require('sib-api-v3-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize the Sendinblue API client
const client = Sib.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();

exports.forgot = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const id = uuidv4();
        await ForgotPasswordRequest.create({ id, isActive: true, userId: user._id });

        const sender = { email: 'dummy@gmail.com' };
        const receivers = [{ email }];

        await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Reset password',
            htmlContent: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`
        });

        res.status(200).json({ message: 'Reset email sent successfully' });
    } catch (error) {
        console.error('Failed to send reset email:', error);
        res.status(500).json({ error: 'Failed to send reset email' });
    }
};

exports.resetpassword = async (req, res) => {
    try {
        const id = req.params.id;
        const forgotDetails = await ForgotPasswordRequest.findOne({ id });

        if (forgotDetails && forgotDetails.isActive) {
            await ForgotPasswordRequest.updateOne({ id }, { isActive: false });

            res.status(200).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Update Password</title>
                </head>
                <body>
                    <form action="/password/updatepassword/${id}" method="get">
                        <label for="newPassword">Enter New Password</label>
                        <input name="newPassword" type="password" required></input>
                        <button>Reset</button>
                    </form>
                </body>
                </html>
            `);
        } else {
            res.status(401).json({ error: 'Already used reset email option' });
        }
    } catch (error) {
        console.error('Failed to reset password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

exports.updatepassword = async (req, res) => {
    try {
        const newpassword = req.query.newPassword;
        const passwordId = req.params.id;

        const forgotDetails = await ForgotPasswordRequest.findOne({ id: passwordId });
        const user = await User.findById(forgotDetails.userId);

        if (user) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
            user.password = hashedPassword;
            await user.save();

            res.status(201).send('<html><h3>Successfully updated the new password</h3></html>');
        } else {
            return res.status(404).json({ error: 'No user exists', success: false });
        }
    } catch (error) {
        console.log(error);
        return res.status(403).json({ error, success: false });
    }
};
