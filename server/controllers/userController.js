exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        res.json({
            name: user.name,
            email: user.email,
            profileImage: user.profileImage, // Ensure this field matches your model
            // other user data...
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
