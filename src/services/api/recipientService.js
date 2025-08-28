import recipientsData from "@/services/mockData/recipients.json";

class RecipientService {
  constructor() {
    this.data = [...recipientsData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.data].sort((a, b) => b.Id - a.Id);
  }

  async getById(id) {
    await this.delay(200);
    const recipient = this.data.find(r => r.Id === parseInt(id));
    return recipient ? { ...recipient } : null;
  }

async create(recipientData) {
    await this.delay(400);
    const newRecipient = {
      Id: this.getNextId(),
      ...recipientData,
      giftHistory: recipientData.giftHistory || [],
preferences: {
        preferredCategories: [],
        avoidedCategories: [],
        priceRange: { min: 0, max: 500 },
        lastUpdated: new Date().toISOString()
      },
      interactionHistory: [],
      userConnection: {
        linkedToUser: true,
        syncWithProfile: true
      }
    };
    this.data.push(newRecipient);
    return { ...newRecipient };
  }

  async update(id, recipientData) {
    await this.delay(350);
    const index = this.data.findIndex(r => r.Id === parseInt(id));
    if (index === -1) throw new Error("Recipient not found");
    
    this.data[index] = { ...this.data[index], ...recipientData, Id: parseInt(id) };
    return { ...this.data[index] };
  }

  async addGiftToHistory(recipientId, giftData) {
    await this.delay(200);
    const recipient = this.data.find(r => r.Id === parseInt(recipientId));
    if (!recipient) throw new Error("Recipient not found");
    
    const giftEntry = {
      giftId: giftData.Id,
      title: giftData.title,
      category: giftData.category,
      price: giftData.price,
      tags: giftData.tags,
      datePurchased: new Date().toISOString(),
      occasion: giftData.occasion,
      rating: null // Will be set later
    };
    
    recipient.giftHistory = recipient.giftHistory || [];
    recipient.giftHistory.unshift(giftEntry);
    
    // Update preferences based on gift
this.updateRecipientPreferences(recipient, giftData);
    
    // Update user preferences based on gift purchase
    this.syncWithUserPreferences(recipient, giftData);
    
    return { ...recipient };
  }

  updateRecipientPreferences(recipient, giftData) {
    if (!recipient.preferences) {
      recipient.preferences = {
        preferredCategories: [],
        avoidedCategories: [],
        priceRange: { min: 0, max: 500 },
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Add category to preferences if not already there
    if (giftData.category && !recipient.preferences.preferredCategories.includes(giftData.category)) {
      recipient.preferences.preferredCategories.push(giftData.category);
    }
    
    // Update price range based on purchases
    if (giftData.price) {
      const currentRange = recipient.preferences.priceRange;
      if (giftData.price > currentRange.max) {
        currentRange.max = Math.min(giftData.price * 1.5, 1000);
      }
    }
    
    recipient.preferences.lastUpdated = new Date().toISOString();
  }

  async syncWithUserPreferences(recipient, giftData) {
    try {
      if (recipient.userConnection?.syncWithProfile) {
        const { userService } = await import('@/services/api/userService');
        
        // Add gift purchase to user order history
        await userService.addToOrderHistory({
          giftName: giftData.title || `Gift for ${recipient.name}`,
          recipientName: recipient.name,
          price: giftData.price || 0,
          category: giftData.category
        });

        // Track interaction for user personalization
        await userService.trackGiftInteraction(recipient.Id, giftData.Id, 'purchase');
      }
    } catch (error) {
      console.warn('Could not sync with user preferences:', error);
    }
  }

async trackInteraction(recipientId, interactionType, giftData = null) {
    await this.delay(100);
    const recipient = this.data.find(r => r.Id === parseInt(recipientId));
    if (!recipient) return;
    
    recipient.interactionHistory = recipient.interactionHistory || [];
    recipient.interactionHistory.unshift({
      type: interactionType, // 'view', 'save', 'purchase', 'share'
      giftId: giftData?.Id,
      category: giftData?.category,
      price: giftData?.price,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 interactions
    recipient.interactionHistory = recipient.interactionHistory.slice(0, 50);

    // Sync interaction with user service for personalization
    try {
      const { userService } = await import('@/services/api/userService');
      await userService.trackGiftInteraction(recipientId, giftData?.Id, interactionType);
    } catch (error) {
      console.warn('Could not sync interaction with user service:', error);
    }
  }

  async getUpcomingBirthdays(daysAhead = 30) {
    await this.delay(200);
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + daysAhead);
    
    return this.data.filter(recipient => {
      if (!recipient.birthday) return false;
      
      const birthday = new Date(recipient.birthday);
      const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
      
      if (thisYearBirthday < now) {
        thisYearBirthday.setFullYear(now.getFullYear() + 1);
      }
      
      return thisYearBirthday >= now && thisYearBirthday <= future;
    });
  }

  async updateNotificationPreferences(recipientId, preferences) {
    await this.delay(200);
    const recipient = this.data.find(r => r.Id === parseInt(recipientId));
    if (!recipient) throw new Error("Recipient not found");
    
    recipient.notificationPreferences = {
      birthdayReminders: true,
      daysBeforeBirthday: 7,
      emailNotifications: true,
      pushNotifications: true,
      ...preferences,
      lastUpdated: new Date().toISOString()
    };
    
    return { ...recipient };
  }

  async delete(id) {
    await this.delay(250);
    const index = this.data.findIndex(r => r.Id === parseInt(id));
    if (index === -1) throw new Error("Recipient not found");
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  getNextId() {
    return Math.max(...this.data.map(r => r.Id), 0) + 1;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const recipientService = new RecipientService();