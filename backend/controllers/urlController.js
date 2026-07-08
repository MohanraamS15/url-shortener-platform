const Url = require('../models/urlSchema');
const User = require('../models/userSchema');
const { nanoid } = require('nanoid');
const { BadRequestError, NotFoundError } = require('../errors');

// ─── USER: Create short URL ───────────────────────────────────────────────────
const urlCreate = async (req, res) => {
    const userId = req.user.userId;

    const { url: longUrl, customCode } = req.body;

    if (!longUrl) {
        throw new BadRequestError('Please provide a URL');
    }

    let shortCode;

    if (customCode) {
        // Validate custom code
        if (!/^[a-zA-Z0-9-]+$/.test(customCode)) {
            throw new BadRequestError('Custom alias can only contain letters, numbers, and hyphens');
        }
        
        // Check if custom code is taken
        const existingAlias = await Url.findOne({ shortCode: customCode });
        if (existingAlias) {
            throw new BadRequestError(`The alias "${customCode}" is already taken`);
        }
        shortCode = customCode;
    } else {
        // Only return an existing URL if the user didn't request a custom alias
        const existingUrl = await Url.findOne({ url: longUrl });

        if (existingUrl) {
            return res.status(200).json({
                id: existingUrl._id,
                url: existingUrl.url,
                shortCode: existingUrl.shortCode,
                createdAt: existingUrl.createdAt,
                updatedAt: existingUrl.updatedAt,
                accessCount: existingUrl.accessCount,
                lastAccessedAt: existingUrl.lastAccessedAt
            });
        }
        shortCode = nanoid(6);
    }

    const url = await Url.create({ url: longUrl, shortCode, createdBy: userId });

    return res.status(201).json({
        id: url._id,
        url: url.url,
        shortCode: url.shortCode,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
        accessCount: url.accessCount,
        lastAccessedAt: url.lastAccessedAt
    });
};

// ─── PUBLIC: Redirect short code to original URL ──────────────────────────────
const urlRedirect = async (req, res) => {
    const { shortcode } = req.params;

    if (!shortcode || typeof shortcode !== 'string') {
        throw new BadRequestError('Invalid short URL');
    }

    const url = await Url.findOne({ shortCode: shortcode });

    if (!url) {
        throw new NotFoundError(`No URL found for: ${shortcode}`);
    }

    url.accessCount += 1;
    url.lastAccessedAt = Date.now();
    await url.save();

    // Redirect to the original URL
    return res.redirect(url.url);
};

// ─── USER: Get all MY URLs ────────────────────────────────────────────────────
const getUserUrls = async (req, res) => {
    const userId = req.user.userId;
    const urls = await Url.find({ createdBy: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
        count: urls.length,
        data: urls.map(u => ({
            id: u._id,
            url: u.url,
            shortCode: u.shortCode,
            accessCount: u.accessCount,
            lastAccessedAt: u.lastAccessedAt,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt
        }))
    });
};

// ─── USER: Delete my own URL ──────────────────────────────────────────────────
const urlDelete = async (req, res) => {
    const { shortcode } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    // Admins can delete any URL; regular users only their own
    const query = role === 'admin'
        ? { shortCode: shortcode }
        : { shortCode: shortcode, createdBy: userId };

    const url = await Url.findOneAndDelete(query);

    if (!url) {
        throw new NotFoundError('URL not found or not authorized');
    }

    return res.status(200).json({ msg: 'URL deleted successfully', shortCode: shortcode });
};

// ─── USER: Update URL ─────────────────────────────────────────────────────────
const urlUpdate = async (req, res) => {
    const { shortcode } = req.params;

    const url = await Url.findOneAndUpdate(
        { shortCode: shortcode },
        { ...req.body },
        { new: true, runValidators: true }
    );

    if (!url) {
        return res.status(404).json({ msg: 'URL not found' });
    }

    return res.status(200).json({
        id: url._id,
        url: url.url,
        shortCode: url.shortCode,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt
    });
};

// ─── USER: Get stats for one URL ─────────────────────────────────────────────
const urlGetStat = async (req, res) => {
    const { shortcode } = req.params;

    const url = await Url.findOne({ shortCode: shortcode });

    if (!url) {
        throw new NotFoundError('URL not found');
    }

    return res.status(200).json({
        id: url._id,
        url: url.url,
        shortCode,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
        accessCount: url.accessCount,
        lastAccessedAt: url.lastAccessedAt
    });
};

// ─── ADMIN: Get all URLs (all users) ─────────────────────────────────────────
const adminGetAllUrls = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
        Url.find({})
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Url.countDocuments()
    ]);

    return res.status(200).json({
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: urls.map(u => ({
            id: u._id,
            url: u.url,
            shortCode: u.shortCode,
            accessCount: u.accessCount,
            lastAccessedAt: u.lastAccessedAt,
            createdAt: u.createdAt,
            createdBy: u.createdBy
        }))
    });
};

// ─── ADMIN: Platform-wide analytics ──────────────────────────────────────────
const adminGetStats = async (req, res) => {
    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Run all aggregations in parallel
    const [
        totalUrls,
        totalUsers,
        activeUrls,
        totalClicks,
        urlsCreatedToday,
        urlsPerDay,
        topUrls
    ] = await Promise.all([
        // Total URLs ever created
        Url.countDocuments(),

        // Total registered users
        User.countDocuments(),

        // Active URLs (accessed in last 7 days)
        Url.countDocuments({ lastAccessedAt: { $gte: oneWeekAgo } }),

        // Sum of all clicks
        Url.aggregate([
            { $group: { _id: null, total: { $sum: '$accessCount' } } }
        ]),

        // URLs created today
        Url.countDocuments({
            createdAt: {
                $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
        }),

        // URLs created per day (last 30 days)
        Url.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    clicks: { $sum: '$accessCount' }
                }
            },
            { $sort: { _id: 1 } }
        ]),

        // Top 5 most clicked URLs
        Url.find({})
            .populate('createdBy', 'name email')
            .sort({ accessCount: -1 })
            .limit(5)
            .select('url shortCode accessCount lastAccessedAt createdBy')
    ]);

    return res.status(200).json({
        overview: {
            totalUrls,
            totalUsers,
            activeUrls,
            inactiveUrls: totalUrls - activeUrls,
            totalClicks: totalClicks[0]?.total || 0,
            urlsCreatedToday
        },
        urlsPerDay,
        topUrls: topUrls.map(u => ({
            id: u._id,
            url: u.url,
            shortCode: u.shortCode,
            accessCount: u.accessCount,
            lastAccessedAt: u.lastAccessedAt,
            createdBy: u.createdBy
        }))
    });
};

// ─── ADMIN: Get all users ─────────────────────────────────────────────────────
const adminGetAllUsers = async (req, res) => {
    const users = await User.find({}).select('-password').sort({ _id: -1 });

    // For each user, count their URLs
    const usersWithCount = await Promise.all(
        users.map(async (u) => {
            const urlCount = await Url.countDocuments({ createdBy: u._id });
            const totalClicks = await Url.aggregate([
                { $match: { createdBy: u._id } },
                { $group: { _id: null, total: { $sum: '$accessCount' } } }
            ]);
            return {
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                urlCount,
                totalClicks: totalClicks[0]?.total || 0
            };
        })
    );

    return res.status(200).json({ count: users.length, data: usersWithCount });
};

module.exports = {
    urlCreate,
    urlRedirect,
    getUserUrls,
    urlDelete,
    urlUpdate,
    urlGetStat,
    adminGetAllUrls,
    adminGetStats,
    adminGetAllUsers
};
