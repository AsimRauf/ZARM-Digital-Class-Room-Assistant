exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            _id: user._id
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
