import jwt from 'jsonwebtoken'

//User Auth-middleware
const authUser = async (req, res, next) => {

    try {

        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = token_decode.id

        next()

    } catch (error) {
        console.log(error)

        // Handle token expiration specifically
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                expired: true  // Frontend can check this to refresh token
            })
        }

        // Handle other JWT errors (invalid token, etc.)
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        })
    }

}

export default authUser
