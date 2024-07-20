const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const stringValidate = (string) => {
    return string !== undefined && string.length > 0;
};

exports.signupUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!stringValidate(username) || !stringValidate(email) || !stringValidate(password)) {
            return res.status(400).json({ err: "Bad request, something is missing" });
        }
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ err: 'Email already exists' });
        }
        const saltRounds = parseInt(process.env.saltRounds);
        const hashedPassword = await bcrypt.hash(password, saltRounds); // blowfish 

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: 'Successfully created new user' });

    } catch (err) {
        console.error('Error signing up:', err);
        res.status(500).json({ err: 'Internal server error' });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.params;
        if (!stringValidate(email) || !stringValidate(password)) {
            return res.status(400).json({ err: "Bad request, something is missing" });
        }
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ err: 'Invalid email' });
        }
        const passwordCompared = await bcrypt.compare(password, user.password);

        if (passwordCompared) {
            return res.status(200).json({ 
                success: true, 
                message: "User logged in successfully", 
                token: generateAccessToken(user.id, user.username) 
            });
        } else {
            return res.status(400).json({ success: false, err: 'Password is incorrect' });
        }
    } catch (err) {
        console.error('Error login:', err);
        return res.status(500).json({ err: 'Internal server error', success: false });
    }
};

const generateAccessToken = (id, name) => {
    return jwt.sign({ userId: id, name: name }, process.env.jwtSecretkey);
};
