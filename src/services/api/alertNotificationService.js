import { toast } from "react-toastify";

class AlertNotificationService {
  constructor() {
    this.notificationQueue = [];
    this.emailService = {
      send: this.mockEmailSend.bind(this)
    };
    this.pushService = {
      send: this.mockPushSend.bind(this)
    };
  }

  async sendPriceDropAlert(alert, oldPrice, newPrice) {
    const savings = oldPrice - newPrice;
    const percentageDrop = ((oldPrice - newPrice) / oldPrice * 100).toFixed(1);
    
    const notification = {
      type: 'price_drop',
      alert,
      oldPrice,
      newPrice,
      savings,
      percentageDrop,
      timestamp: new Date().toISOString()
    };

    await this.processNotification(notification);
}

  async sendStockAlert(alert, inStock) {
    const notification = {
      type: 'stock_change',
      alert,
      inStock,
      timestamp: new Date().toISOString()
    };

    await this.processNotification(notification);
  }

  async sendBirthdayReminderAlert(recipient, daysUntil) {
    const notification = {
      type: 'birthday_reminder',
      recipient,
      daysUntil,
      timestamp: new Date().toISOString()
    };

    await this.processNotification(notification);
  }

  async sendWishlistUpdateAlert(wishlist, action, item = null) {
    const notification = {
      type: 'wishlist_update',
      wishlist,
      action,
      item,
      timestamp: new Date().toISOString()
    };

    await this.processNotification(notification);
  }

  async sendBulkPriceUpdate(alerts) {
    const notification = {
      type: 'bulk_update',
      alerts,
      timestamp: new Date().toISOString()
    };

    await this.processNotification(notification);
  }

  async processNotification(notification) {
    try {
      const { alert } = notification;
      
      // Show toast notification
      this.showToastNotification(notification);

      // Send email if enabled
      if (alert.emailEnabled) {
        await this.sendEmailNotification(notification);
      }

      // Send push notification if enabled
      if (alert.pushEnabled) {
        await this.sendPushNotification(notification);
      }

      // Add to notification queue for batch processing
      this.notificationQueue.push(notification);

      return true;
    } catch (error) {
      console.error('Failed to process notification:', error);
      return false;
    }
  }

  showToastNotification(notification) {
const { type, alert } = notification;

    switch (type) {
      case 'price_drop':
        toast.success(
          `💰 Price drop alert! ${alert.gift?.title} is now $${notification.newPrice} (${notification.percentageDrop}% off)`,
          {
            autoClose: 8000,
            onClick: () => window.open(alert.gift?.purchaseUrl, '_blank')
          }
        );
        break;
      
      case 'stock_change':
        if (notification.inStock) {
          toast.info(
            `📦 Back in stock! ${alert.gift?.title} is now available`,
            {
              autoClose: 6000,
              onClick: () => window.open(alert.gift?.purchaseUrl, '_blank')
            }
          );
        } else {
          toast.warning(
            `⚠️ Out of stock: ${alert.gift?.title} is currently unavailable`,
            {
              autoClose: 5000
            }
          );
        }
        break;

      case 'birthday_reminder':
        toast.info(
          `🎂 ${notification.recipient.name}'s birthday is ${notification.daysUntil === 0 ? 'today' : `in ${notification.daysUntil} days`}!`,
          {
            autoClose: 8000,
            onClick: () => window.location.href = '/recipients'
          }
        );
        break;

      case 'wishlist_update':
        const actionText = notification.action === 'item_added' ? 'added to' : 'updated';
        toast.info(
          `👥 ${notification.wishlist.ownerName} ${actionText} their wishlist${notification.item ? `: ${notification.item.name}` : ''}`,
          {
            autoClose: 6000,
            onClick: () => window.location.href = '/social'
          }
        );
        break;

      case 'friend_activity':
        let activityMessage = '';
        switch (notification.activity) {
          case 'shared_gift':
            activityMessage = `${notification.friend.name} shared a gift with you`;
            break;
          case 'updated_wishlist':
            activityMessage = `${notification.friend.name} updated their wishlist`;
            break;
          case 'joined_group_gift':
            activityMessage = `${notification.friend.name} joined a group gift`;
            break;
          default:
            activityMessage = `${notification.friend.name} has new activity`;
        }
        
        toast.info(
          `🤝 ${activityMessage}`,
          {
            autoClose: 6000,
            onClick: () => window.location.href = '/social'
          }
        );
        break;
      
      case 'bulk_update':
        toast.info(
          `🔔 ${notification.alerts.length} price alerts have been updated`,
          {
            autoClose: 4000,
            onClick: () => window.location.href = '/price-alerts'
          }
        );
        break;
    }
  }

async sendEmailNotification(notification) {
    const { type, alert } = notification;
    let subject, body;

    switch (type) {
      case 'price_drop':
        subject = `Price Drop Alert: ${alert.gift?.title}`;
        body = this.generatePriceDropEmail(notification);
        break;
      
      case 'stock_change':
        subject = `Stock Alert: ${alert.gift?.title}`;
        body = this.generateStockEmail(notification);
        break;

      case 'birthday_reminder':
        subject = `Birthday Reminder: ${notification.recipient.name}`;
        body = this.generateBirthdayEmail(notification);
        break;

      case 'wishlist_update':
        subject = `Wishlist Update: ${notification.wishlist.name}`;
        body = this.generateWishlistEmail(notification);
        break;

      case 'friend_activity':
        subject = `Friend Activity: ${notification.friend.name}`;
        body = this.generateFriendActivityEmail(notification);
        break;
      
      case 'bulk_update':
        subject = 'Price Alert Summary';
        body = this.generateBulkEmail(notification);
        break;
    }

    return await this.emailService.send({
      subject,
      body,
      recipient: alert.recipient?.email || 'user@example.com'
    });
  }

  async sendPushNotification(notification) {
const { type, alert } = notification;
    let title, body;

    switch (type) {
      case 'price_drop':
        title = 'Price Drop Alert! 💰';
        body = `${alert.gift?.title} dropped ${notification.percentageDrop}% to $${notification.newPrice}`;
        break;
      
      case 'stock_change':
        title = notification.inStock ? 'Back in Stock! 📦' : 'Out of Stock ⚠️';
        body = `${alert.gift?.title} ${notification.inStock ? 'is now available' : 'is out of stock'}`;
        break;

      case 'birthday_reminder':
        title = '🎂 Birthday Reminder!';
        body = `${notification.recipient.name}'s birthday is ${notification.daysUntil === 0 ? 'today' : `in ${notification.daysUntil} days`}`;
        break;

      case 'wishlist_update':
        title = '👥 Wishlist Update';
        const action = notification.action === 'item_added' ? 'added to' : 'updated';
        body = `${notification.wishlist.ownerName} ${action} their wishlist`;
        break;

      case 'friend_activity':
        title = '🤝 Friend Activity';
        body = `${notification.friend.name} has new activity to check out`;
        break;
      
      case 'bulk_update':
        title = 'Price Alert Update 🔔';
        body = `${notification.alerts.length} alerts have been updated`;
        break;
    }

    return await this.pushService.send({
      title,
      body,
      icon: '/icon-192x192.png',
      data: {
        url: alert.gift?.purchaseUrl || '/price-alerts',
        alertId: alert.Id
      }
    });
  }

generatePriceDropEmail(notification) {
    const { alert, oldPrice, newPrice, savings, percentageDrop } = notification;
    
    return `
      <h2>Great news! The price dropped for "${alert.gift?.title}"</h2>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Price Details:</h3>
        <p><strong>Previous Price:</strong> $${oldPrice}</p>
        <p><strong>Current Price:</strong> $${newPrice}</p>
        <p><strong>You Save:</strong> $${savings.toFixed(2)} (${percentageDrop}%)</p>
      </div>
      <p>For: ${alert.recipient?.name}</p>
      <p><a href="${alert.gift?.purchaseUrl}" style="background: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Buy Now</a></p>
    `;
  }

  generateStockEmail(notification) {
    const { alert, inStock } = notification;
    
    return `
      <h2>${inStock ? 'Back in Stock!' : 'Out of Stock Alert'}</h2>
      <p>"${alert.gift?.title}" is ${inStock ? 'now available for purchase' : 'currently out of stock'}.</p>
      <p>For: ${alert.recipient?.name}</p>
      <p>Current Price: $${alert.gift?.price}</p>
      ${inStock ? `<p><a href="${alert.gift?.purchaseUrl}" style="background: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Buy Now</a></p>` : ''}
    `;
  }

  generateBirthdayEmail(notification) {
    const { recipient, daysUntil } = notification;
    
    return `
      <h2>🎂 Birthday Reminder</h2>
      <p>${recipient.name}'s birthday is ${daysUntil === 0 ? 'today' : `coming up in ${daysUntil} days`}!</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Recipient Details:</h3>
        <p><strong>Name:</strong> ${recipient.name}</p>
        <p><strong>Relationship:</strong> ${recipient.relationship}</p>
        ${recipient.interests ? `<p><strong>Interests:</strong> ${recipient.interests.slice(0, 3).join(', ')}</p>` : ''}
      </div>
      <p><a href="/recipients" style="background: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Find Perfect Gifts</a></p>
    `;
  }

  generateWishlistEmail(notification) {
    const { wishlist, action, item } = notification;
    
    return `
      <h2>👥 Wishlist Update</h2>
      <p>${wishlist.ownerName} has ${action === 'item_added' ? 'added an item to' : 'updated'} their wishlist "${wishlist.name}".</p>
      ${item ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>New Item:</h3>
          <p><strong>Name:</strong> ${item.name}</p>
          ${item.price ? `<p><strong>Price:</strong> $${item.price}</p>` : ''}
        </div>
      ` : ''}
      <p><a href="/social" style="background: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Wishlist</a></p>
    `;
  }

  generateFriendActivityEmail(notification) {
    const { friend, activity, data } = notification;
    
    let activityDescription = '';
    switch (activity) {
      case 'shared_gift':
        activityDescription = 'shared a gift recommendation with you';
        break;
      case 'updated_wishlist':
        activityDescription = 'updated their wishlist';
        break;
      case 'joined_group_gift':
        activityDescription = 'joined a group gift';
        break;
      default:
        activityDescription = 'has new activity';
    }
    
    return `
      <h2>🤝 Friend Activity</h2>
      <p>${friend.name} ${activityDescription}.</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Friend Details:</h3>
        <p><strong>Name:</strong> ${friend.name}</p>
        <p><strong>Email:</strong> ${friend.email}</p>
      </div>
      <p><a href="/social" style="background: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Activity</a></p>
    `;
  }

  generateBulkEmail(notification) {
    const { alerts } = notification;
    
    let body = '<h2>Price Alert Summary</h2><ul>';
    alerts.forEach(alert => {
      body += `<li>${alert.gift?.title} - Current: $${alert.gift?.price}</li>`;
    });
    body += '</ul>';
    body += '<p><a href="/price-alerts" style="background: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View All Alerts</a></p>';
    
    return body;
  }

  async mockEmailSend({ subject, body, recipient }) {
    await this.delay(500);
    console.log(`Email sent to ${recipient}: ${subject}`);
    return { success: true, messageId: Math.random().toString(36) };
  }

  async mockPushSend({ title, body, icon, data }) {
    await this.delay(200);
    console.log(`Push notification: ${title} - ${body}`);
    
    // Mock browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon, data });
    }
    
    return { success: true };
  }

  async getNotificationHistory(limit = 50) {
    await this.delay(200);
    return this.notificationQueue
      .slice(-limit)
      .reverse()
      .map(notification => ({
        ...notification,
        id: Math.random().toString(36)
      }));
  }

  async markAsRead(notificationId) {
    await this.delay(100);
    // Mock implementation
    return true;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const alertNotificationService = new AlertNotificationService();