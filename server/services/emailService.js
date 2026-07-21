const sendEmail = require('../utils/sendEmail');

const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to MERN Shop!',
    html: `<h2>Hi ${user.name},</h2><p>Thank you for registering with MERN Shop. We're excited to have you on board!</p>`,
  });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `<h2>Hi ${user.name},</h2><p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link is valid for 30 minutes. If you did not request this, please ignore this email.</p>`,
  });
};

const sendOrderConfirmationEmail = async (user, order) => {
  await sendEmail({
    to: user.email,
    subject: `Order Confirmed - #${order._id}`,
    html: `<h2>Hi ${user.name},</h2><p>Thank you for your order! Your order (ID: ${order._id}) has been placed successfully.</p><p>Total Amount: Rs. ${order.totalAmount}</p><p>Payment Method: ${order.paymentMethod}</p>`,
  });
};

const sendOrderStatusEmail = async (user, order) => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed.',
    processing: 'Your order is being processed.',
    shipped: 'Your order has been shipped.',
    out_for_delivery: 'Your order is out for delivery.',
    delivered: 'Your order has been delivered.',
    cancelled: 'Your order has been cancelled.',
  };

  await sendEmail({
    to: user.email,
    subject: `Order Update - #${order._id}`,
    html: `<h2>Hi ${user.name},</h2><p>${statusMessages[order.orderStatus] || 'Your order status has been updated.'}</p><p>Current Status: <b>${order.orderStatus}</b></p>`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
};
