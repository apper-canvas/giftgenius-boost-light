class SocialGiftService {
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

  // Friends Management
  async getFriends() {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Email"}},
          {"field": {"Name": "PhotoUrl"}},
          {"field": {"Name": "Status"}},
          {"field": {"Name": "MutualFriends"}},
          {"field": {"Name": "JoinedAt"}},
          {"field": {"Name": "LastActive"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('friend_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching friends:", error?.response?.data?.message || error);
      return [];
    }
  }

  async addFriend(friendData) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        records: [{
          Name: friendData.name,
          Email: friendData.email,
          PhotoUrl: friendData.photoUrl || "",
          Status: 'pending',
          MutualFriends: 0,
          JoinedAt: new Date().toISOString(),
          LastActive: new Date().toISOString()
        }]
      };
      
      const response = await this.apperClient.createRecord('friend_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        return successful[0]?.data || null;
      }
      
      return null;
    } catch (error) {
      console.error("Error adding friend:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async removeFriend(id) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const response = await this.apperClient.deleteRecord('friend_c', {
        RecordIds: [parseInt(id)]
      });
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.results?.[0]?.success || false;
    } catch (error) {
      console.error("Error removing friend:", error?.response?.data?.message || error);
      throw error;
    }
  }

  // Social Gift Activities
  async getGiftActivities() {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Type"}},
          {"field": {"Name": "FriendId"}}, 
          {"field": {"Name": "FriendName"}},
          {"field": {"Name": "FriendPhotoUrl"}},
          {"field": {"Name": "GiftId"}},
          {"field": {"Name": "GiftTitle"}},
          {"field": {"Name": "RecipientId"}},
          {"field": {"Name": "RecipientName"}},
          {"field": {"Name": "Occasion"}},
          {"field": {"Name": "Price"}},
          {"field": {"Name": "Timestamp"}},
          {"field": {"Name": "Privacy"}},
          {"field": {"Name": "WrappingStyle"}},
          {"field": {"Name": "CanView"}}
        ],
        orderBy: [{"fieldName": "Timestamp", "sorttype": "DESC"}]
      };
      
      const response = await this.apperClient.fetchRecords('social_gift_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching gift activities:", error?.response?.data?.message || error);
      return [];
    }
  }

  async shareGift(giftId, friendIds, message = '') {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const activities = friendIds.map(friendId => ({
        Type: 'shared',
        FriendId: parseInt(friendId),
        GiftId: parseInt(giftId),
        GiftTitle: `Gift #${giftId}`,
        Timestamp: new Date().toISOString(),
        Privacy: 'public',
        Message: message,
        CanView: true
      }));
      
      const params = {
        records: activities
      };
      
      const response = await this.apperClient.createRecord('social_gift_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        return successful.map(r => r.data);
      }
      
      return [];
    } catch (error) {
      console.error("Error sharing gift:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async recordGiftActivity(activityData) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        records: [{
          Type: activityData.type || 'shared',
          FriendId: parseInt(activityData.friendId),
          FriendName: activityData.friendName,
          FriendPhotoUrl: activityData.friendPhotoUrl || '',
          GiftId: parseInt(activityData.giftId),
          GiftTitle: activityData.giftTitle,
          RecipientId: activityData.recipientId ? parseInt(activityData.recipientId) : null,
          RecipientName: activityData.recipientName || '',
          Occasion: activityData.occasion || '',
          Price: activityData.price || null,
          Timestamp: new Date().toISOString(),
          Privacy: activityData.privacy || 'public',
          CanView: activityData.canView !== false
        }]
      };
      
      const response = await this.apperClient.createRecord('social_gift_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        return successful[0]?.data || null;
      }
      
      return null;
    } catch (error) {
      console.error("Error recording gift activity:", error?.response?.data?.message || error);
      throw error;
    }
  }

  // Shared Wishlists - Mock functionality since no database table available
  async getSharedWishlists() {
    // Mock implementation - would need wishlist_c table
    return [
      {
        Id: 1,
        title: "Holiday Wishlist 2024",
        description: "Family holiday gifts",
        isPublic: false,
        allowContributions: true,
        createdAt: new Date().toISOString(),
        collaborators: [
          { Id: 1, name: 'You', email: 'user@example.com', role: 'owner' }
        ],
        items: []
      }
    ];
  }

  async createSharedWishlist(wishlistData) {
    // Mock implementation - would need wishlist_c table
    const newWishlist = {
      Id: Date.now(),
      title: wishlistData.title,
      description: wishlistData.description || '',
      isPublic: wishlistData.isPublic || false,
      allowContributions: wishlistData.allowContributions || true,
      createdAt: new Date().toISOString(),
      collaborators: [{
        Id: 1,
        name: 'You',
        email: 'current-user@example.com',
        role: 'owner'
      }],
      items: []
    };
    
    return newWishlist;
  }

  async updateWishlistPrivacy(id, isPublic) {
    // Mock implementation - would need wishlist_c table
    return { Id: parseInt(id), isPublic };
  }

  async getSocialStats() {
    try {
      const friends = await this.getFriends();
      const activities = await this.getGiftActivities();
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const stats = {
        totalFriends: friends.length,
        connectedFriends: friends.filter(f => f.Status === 'connected').length,
        totalWishlists: 1, // Mock since no wishlist table
        publicWishlists: 0,
        recentActivities: activities.filter(a => {
          const activityDate = new Date(a.Timestamp);
          return activityDate > weekAgo;
        }).length
      };

      return stats;
    } catch (error) {
      console.error("Error getting social stats:", error?.response?.data?.message || error);
      return {
        totalFriends: 0,
        connectedFriends: 0,
        totalWishlists: 0,
        publicWishlists: 0,
        recentActivities: 0
      };
    }
  }
}

export const socialGiftService = new SocialGiftService();