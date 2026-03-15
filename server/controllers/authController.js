const User = require("../models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );
};

// Register User
exports.registerUser = async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;

        // Check that all fields are filled in
        if (!name || !password || !role) {
            return res.status(400).json({message: "Missing required fields."});
        }

        // Check for existing users
        if (role === "teacher" && email) {
            const existingTeacher = await User.findOne({ email: email.toLowerCase().trim() });
            if (existingTeacher) {
                return res.status(400).json({message: "Email is already in use."});
            }
        }
        
        if (role === "student" && username) {
            const existingStudent = await User.findOne({ username: username.trim() });
            if (existingStudent) {
                return res.status(400).json({message: "Username is already taken."});
            }
        }

        const user = new User({name, username, email, password, role});

        await user.save();

        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                points: user.points,
            },
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!password) {
            return res.status(400).json({message: "Password is required."});
        }

        const hasEmail = typeof email === "string" && email.trim().length > 0;
        const hasUsername = typeof username === "string" && username.trim().length > 0;

        if (hasEmail === hasUsername) {
            return res.status(400).json({message: "Provide one email or username."});
        }

        const user = hasEmail
            ? await User.findOne({ email: email.toLowerCase().trim() })
            : await User.findOne({ username: username.trim() });

        if (!user) {
            return res.status(400).json({message: "Invalid user credentials."});
        }

        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
            return res.status(400).json({message: "Invalid user credentials."});
        }

        const token = generateToken(user);

        return res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                points: user.points,
            },
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};