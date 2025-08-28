class UserService {
  constructor() {
    // Mock user data - in real app this would come from backend
    this.userData = {
      Id: 1,
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      location: "San Francisco, CA",
      birthday: "1990-05-15",
      bio: "Gift enthusiast who loves finding the perfect present for every occasion!",
      photoUrl: "",
      joinedAt: "2024-01-15T00:00:00Z",
      totalRecipients: 12,
      totalOrders: 8,
      friendCount: 15,
      wishlistCount: 3,
      orderHistory: [
        {
          Id: 1,
          giftName: "Wireless Headphones",
          recipientName: "Mom",
          date: "2024-03-15T00:00:00Z",
          price: 150,
          status: "delivered"
        },
        {
          Id: 2,
          giftName: "Coffee Subscription",
          recipientName: "Dad",
          date: "2024-03-10T00:00:00Z",
          price: 89,
          status: "shipped"
        },
        {
          Id: 3,
          giftName: "Art Supplies Set",
          recipientName: "Sister",
          date: "2024-02-28T00:00:00Z",
          price: 75,
          status: "delivered"
        }
      ]
    };

    this.userPreferences = {
      giftCategories: ["Electronics", "Books", "Art & Crafts"],
      priceRange: { min: 25, max: 300 },
      occasions: ["Birthday", "Christmas", "Thank You"],
      notifications: {
        reminders: true,
        priceAlerts: true,
        friendActivity: true,
        recommendations: true
      },
      privacy: {
        shareActivity: true,
        publicProfile: false,
        allowFriendRequests: true
      }
    };
  }

  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getProfile() {
    await this.delay();
    return { ...this.userData };
  }

  async updateProfile(profileData) {
    await this.delay();
    
    this.userData = {
      ...this.userData,
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.userData };
  }

  async getPreferences() {
    await this.delay();
    return { ...this.userPreferences };
  }

  async updatePreferences(preferences) {
    await this.delay();
    
    this.userPreferences = {
      ...this.userPreferences,
      ...preferences,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.userPreferences };
  }

  async addToOrderHistory(orderData) {
    await this.delay();
    
    const newOrder = {
      Id: Math.max(...this.userData.orderHistory.map(o => o.Id), 0) + 1,
      ...orderData,
      date: new Date().toISOString(),
      status: "processing"
    };

    this.userData.orderHistory.unshift(newOrder);
    this.userData.totalOrders += 1;
    
    return { ...newOrder };
  }

  async getOrderHistory() {
    await this.delay();
    return [...this.userData.orderHistory];
  }

  async updateOrderStatus(orderId, status) {
    await this.delay();
    
    const order = this.userData.orderHistory.find(o => o.Id === parseInt(orderId));
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    return { ...order };
  }

  async getUserStats() {
    await this.delay();
    
    return {
      totalRecipients: this.userData.totalRecipients,
      totalOrders: this.userData.totalOrders,
      totalSpent: this.userData.orderHistory.reduce((sum, order) => sum + order.price, 0),
      favoriteCategory: this.userPreferences.giftCategories[0] || "Electronics",
      averageOrderValue: this.userData.orderHistory.length > 0 
        ? Math.round(this.userData.orderHistory.reduce((sum, order) => sum + order.price, 0) / this.userData.orderHistory.length)
        : 0,
      joinedDate: this.userData.joinedAt
    };
  }

  async updateNotificationSettings(settings) {
    await this.delay();
    
    this.userPreferences.notifications = {
      ...this.userPreferences.notifications,
      ...settings
    };
    
    return { ...this.userPreferences.notifications };
  }

  async updatePrivacySettings(settings) {
    await this.delay();
    
    this.userPreferences.privacy = {
      ...this.userPreferences.privacy,
      ...settings
    };
    
    return { ...this.userPreferences.privacy };
  }

  async exportUserData() {
    await this.delay(2000); // Simulate longer export process
    
    const exportData = {
      profile: this.userData,
      preferences: this.userPreferences,
      exportedAt: new Date().toISOString()
    };
    
    return exportData;
  }

  async deleteAccount() {
    await this.delay(1000);
    
    // In real app, this would delete user data from backend
    // For demo, we'll just clear the data
    this.userData = null;
    this.userPreferences = null;
    
    return { success: true };
  }

  // Integration with other services
  async trackGiftInteraction(recipientId, giftId, interactionType) {
    await this.delay(100);
    
    // Track user interactions for personalization
    const interaction = {
      recipientId: parseInt(recipientId),
      giftId: parseInt(giftId),
      type: interactionType, // 'view', 'save', 'purchase', 'share'
      timestamp: new Date().toISOString()
    };
    
    // In real app, this would be stored for ML recommendations
    console.log('User interaction tracked:', interaction);
    
    return interaction;
  }

  async getPersonalizedRecommendations() {
    await this.delay();
    
    // Mock recommendations based on user preferences
    const recommendations = {
      categories: this.userPreferences.giftCategories,
      priceRange: this.userPreferences.priceRange,
      suggestedGifts: [
        {
          Id: 1,
          title: "Smart Home Assistant",
          category: "Electronics",
          price: 129,
          reason: "Based on your interest in Electronics"
        },
        {
          Id: 2,
          title: "Art Studio Starter Kit",
          category: "Art & Crafts",
          price: 85,
          reason: "Perfect for creative friends"
        },
        {
          Id: 3,
          title: "Book Club Subscription",
          category: "Books",
          price: 39,
          reason: "Great for book lovers"
        }
      ]
    };
    
    return recommendations;
  }
}

export const userService = new UserService();