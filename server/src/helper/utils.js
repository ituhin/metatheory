const userObjResponse = function(user) {
    return {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
    }
}

module.exports = { userObjResponse };