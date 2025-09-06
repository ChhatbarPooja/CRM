const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get all notifications for logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = Notification.find({ recipient: req.user.id });

    // Sort
    query = query.sort('-createdAt');

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Notification.countDocuments({ recipient: req.user.id });

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const notifications = await query.populate({
      path: 'relatedLead',
      select: 'name company'
    });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: notifications.length,
      pagination,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @route   GET /api/notifications/unread
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user.id,
      read: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @route   PUT /api/notifications/:id
// @desc    Mark notification as read
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: `No notification found with id of ${req.params.id}`
      });
    }

    // Make sure user owns notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this notification`
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;