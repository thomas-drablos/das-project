const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    console.log('login');
    const email = req.body.email;
    if (email === 'admin@email.com') {
        req.session.valid = true;
        req.session.expiresAt = Date.now() + req.session.cookie.maxAge;
        console.log('User authenticated');
        return res.json({
            username: 'Admin',
            isAdmin: false,
            validUntil: req.session.expiresAt,
        });
    }

    console.log('user not authenticated');
    return res.status(400).send('Invalid username or password');
});

// block unauthenticated requests
router.use((req, res, next) => {
    if (req.session.valid && req.session.expiresAt >= Date.now())
        return next();

    return res.status(401).send('Unauthenticated');
});

router.post('/logout', (req, res) => {
    if (req.session.valid)
        return res.status(400).send('Not logged in');

    req.session.destroy();
    return res.send();
});

router.get('/test', (req, res) => {
    res.send('Ping!');
});

module.exports = router;
