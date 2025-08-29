class UserService {
  constructor() {
    this.apperClient = null;
    this.initializeApperClient();
  }

  initializeApperClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getProfile() {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      // Get current user from Redux/authentication state
      const currentUser = this.getCurrentUser();
      if (currentUser?.userId) {
        const params = {
          fields: [
            {"field": {"Name": "Name"}},
            {"field": {"Name": "Email"}},
            {"field": {"Name": "Location"}},
            {"field": {"Name": "Birthday"}},
            {"field": {"Name": "Bio"}},
            {"field": {"Name": "PhotoUrl"}},
            {"field": {"Name": "JoinedAt"}},
            {"field": {"Name": "TotalRecipients"}},
            {"field": {"Name": "TotalOrders"}},
            {"field": {"Name": "FriendCount"}},
            {"field": {"Name": "WishlistCount"}}
          ]
        };
        
        const response = await this.apperClient.getRecordById('user_profile_c', parseInt(currentUser.userId), params);
        
        if (response?.data) {
          return {
            ...response.data,
            name: response.data.Name,
            email: response.data.Email,
            location: response.data.Location,
            birthday: response.data.Birthday,
            bio: response.data.Bio,
            photoUrl: response.data.PhotoUrl,
            joinedAt: response.data.JoinedAt,
            totalRecipients: response.data.TotalRecipients || 0,
            totalOrders: response.data.TotalOrders || 0,
            friendCount: response.data.FriendCount || 0,
            wishlistCount: response.data.WishlistCount || 0
          };
        }
      }
      
      // Fallback mock data if no profile found
      return {
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
        wishlistCount: 3
      };
    } catch (error) {
      console.error("Error fetching user profile:", error?.response?.data?.message || error);
      // Return fallback profile
      return {
        Id: 1,
        name: "User",
        email: "user@example.com",
        location: "",
        birthday: "",
        bio: "",
        photoUrl: "",
        totalRecipients: 0,
        totalOrders: 0,
        friendCount: 0,
        wishlistCount: 0
      };
    }
  }

  async getPreferences() {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const currentUser = this.getCurrentUser();
      if (currentUser?.userId) {
        const params = {
          fields: [
            {"field": {"Name": "GiftCategories"}},
            {"field": {"Name": "PriceRangeMin"}},
            {"field": {"Name": "PriceRangeMax"}},
            {"field": {"Name": "Occasions"}},
            {"field": {"Name": "NotificationSettings"}},
            {"field": {"Name": "PrivacySettings"}}
          ]
        };
        
        const response = await this.apperClient.getRecordById('user_preferences_c', parseInt(currentUser.userId), params);
        
        if (response?.data) {
          const prefs = response.data;
          return {
            giftCategories: prefs.GiftCategories ? prefs.GiftCategories.split(',') : ["Electronics", "Books", "Art & Crafts"],
            priceRange: { 
              min: prefs.PriceRangeMin || 25, 
              max: prefs.PriceRangeMax || 300 
            },
            occasions: prefs.Occasions ? prefs.Occasions.split(',') : ["Birthday", "Christmas", "Thank You"],
            notifications: prefs.NotificationSettings ? JSON.parse(prefs.NotificationSettings) : {
              reminders: true,
              priceAlerts: true,
              friendActivity: true,
              recommendations: true
            },
            privacy: prefs.PrivacySettings ? JSON.parse(prefs.PrivacySettings) : {
              shareActivity: true,
              publicProfile: false,
              allowFriendRequests: true
            }
          };
        }
      }
      
      // Fallback preferences
      return {
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
    } catch (error) {
      console.error("Error fetching user preferences:", error?.response?.data?.message || error);
      return {
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
  }

  async updateProfile(profileData) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const currentUser = this.getCurrentUser();
      if (currentUser?.userId) {
        const params = {
          records: [{
            Id: parseInt(currentUser.userId),
            Name: profileData.name,
            Email: profileData.email,
            Location: profileData.location,
            Birthday: profileData.birthday,
            Bio: profileData.bio
          }]
        };
        
        const response = await this.apperClient.updateRecord('user_profile_c', params);
        
        if (response.success && response.results) {
          const successful = response.results.filter(r => r.success);
          if (successful[0]?.data) {
            return successful[0].data;
          }
        }
      }
      
      return profileData;
    } catch (error) {
      console.error("Error updating user profile:", error?.response?.data?.message || error);
      return profileData;
    }
  }

  async updatePreferences(preferences) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const currentUser = this.getCurrentUser();
      if (currentUser?.userId) {
        const params = {
          records: [{
            Id: parseInt(currentUser.userId),
            GiftCategories: preferences.giftCategories?.join(','),
            PriceRangeMin: preferences.priceRange?.min,
            PriceRangeMax: preferences.priceRange?.max,
            Occasions: preferences.occasions?.join(','),
            NotificationSettings: JSON.stringify(preferences.notifications),
            PrivacySettings: JSON.stringify(preferences.privacy)
          }]
        };
        
        const response = await this.apperClient.updateRecord('user_preferences_c', params);
        
        if (response.success && response.results) {
          const successful = response.results.filter(r => r.success);
          if (successful[0]?.data) {
            return preferences;
          }
        }
      }
      
      return preferences;
    } catch (error) {
      console.error("Error updating user preferences:", error?.response?.data?.message || error);
      return preferences;
    }
  }

  async getPersonalizedRecommendations() {
    try {
      const preferences = await this.getPreferences();
      
      // Mock recommendations based on user preferences
      const recommendations = {
        categories: preferences.giftCategories,
        priceRange: preferences.priceRange,
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
    } catch (error) {
      console.error("Error getting personalized recommendations:", error?.response?.data?.message || error);
      return {
        categories: ["Electronics", "Books", "Art & Crafts"],
        priceRange: { min: 25, max: 300 },
        suggestedGifts: []
      };
    }
  }

  async trackGiftInteraction(recipientId, giftId, interactionType) {
    try {
      // Log interaction for analytics
      const interaction = {
        recipientId: parseInt(recipientId),
        giftId: parseInt(giftId),
        type: interactionType,
        timestamp: new Date().toISOString()
      };
      
      console.log('User interaction tracked:', interaction);
      return interaction;
    } catch (error) {
      console.error("Error tracking gift interaction:", error?.response?.data?.message || error);
      return null;
    }
  }

  getCurrentUser() {
    // Helper method to get current user from Redux store
    // In a real implementation, this would access Redux store
    if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
      const state = window.__REDUX_STORE__.getState();
      return state.user?.user;
    }
    return null;
  }

  async deleteAccount() {
    // Mock implementation
    return { success: true };
  }
}

export const userService = new UserService();