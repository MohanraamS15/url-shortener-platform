const express = require('express');
const router = express.Router();

const authentication = require('../middleware/authenticationMiddleware');
const validateURL = require('../middleware/urlMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

const {
    urlCreate,
    urlRedirect,
    getUserUrls,
    urlDelete,
    urlUpdate,
    urlGetStat,
    adminGetAllUrls,
    adminGetStats,
    adminGetAllUsers
} = require('../controllers/urlController');

// ─── User Routes ──────────────────────────────────────────────────────────────
// POST   /shorten          — create a short URL (auth required)
router.post('/', authentication, validateURL, urlCreate);

// GET    /shorten/my-urls  — get logged-in user's URLs
router.get('/my-urls', authentication, getUserUrls);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
// GET    /shorten/admin/stats     — platform-wide analytics
router.get('/admin/stats', authentication, adminAuth, adminGetStats);

// GET    /shorten/admin/urls      — all URLs across all users
router.get('/admin/urls', authentication, adminAuth, adminGetAllUrls);

// GET    /shorten/admin/users     — all users with URL counts
router.get('/admin/users', authentication, adminAuth, adminGetAllUsers);

// ─── Public Routes ────────────────────────────────────────────────────────────
// GET    /shorten/:shortcode/stats — stats for a specific short URL
router.get('/:shortcode/stats', urlGetStat);

// GET    /shorten/:shortcode       — redirect to original URL
router.get('/:shortcode', urlRedirect);

// ─── Protected: Update / Delete ───────────────────────────────────────────────
// PUT    /shorten/:shortcode       — update (admin only)
router.put('/:shortcode', authentication, validateURL, adminAuth, urlUpdate);

// DELETE /shorten/:shortcode       — delete (user deletes own; admin deletes any)
router.delete('/:shortcode', authentication, urlDelete);

module.exports = router;
