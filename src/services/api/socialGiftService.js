import friendsData from "@/services/mockData/friends.json";
import sharedWishlistsData from "@/services/mockData/sharedWishlists.json";
import socialGiftsData from "@/services/mockData/socialGifts.json";
import React from "react";
import Error from "@/components/ui/Error";

class SocialGiftService {
  constructor() {
    this.friends = [...friendsData];
    this.sharedWishlists = [...sharedWishlistsData];
    this.giftActivities = [...socialGiftsData];
    this.userActivitySyncEnabled = true;
  }

  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getNextId(array) {
    return Math.max(...array.map(item => item.Id), 0) + 1;
  }

  // Friends Management
async getFriends() {
    await this.delay();
    return [...this.friends];
  }

  async addFriend(friendData) {
    await this.delay();
    
    const newFriend = {
      Id: this.getNextId(this.friends),
      name: friendData.name,
      email: friendData.email,
      photoUrl: friendData.photoUrl || "",
      status: 'pending',
      mutualFriends: 0,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    this.friends.push(newFriend);
    
    // Update user's friend count
    this.updateUserSocialStats('friendAdded');
    
    return { ...newFriend };
  }

  async removeFriend(id) {
    await this.delay();
    
    const index = this.friends.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Friend with ID ${id} not found`);
    }

    const deleted = this.friends.splice(index, 1)[0];
    return { ...deleted };
  }

// Shared Wishlists
  async getSharedWishlists() {
    await this.delay();
    return [...this.sharedWishlists];
  }

  async createSharedWishlist(wishlistData) {
    await this.delay();
    
    const newWishlist = {
      Id: this.getNextId(this.sharedWishlists),
      title: wishlistData.title,
      description: wishlistData.description || '',
      isPublic: wishlistData.isPublic || false,
      allowContributions: wishlistData.allowContributions || true,
      createdBy: 'current-user@example.com',
      createdAt: new Date().toISOString(),
      collaborators: [{
        Id: 1,
        name: 'You',
        email: 'current-user@example.com',
        role: 'owner'
      }],
      items: []
    };

    this.sharedWishlists.push(newWishlist);
    
    // Update user's wishlist count
    this.updateUserSocialStats('wishlistCreated');
    
    return { ...newWishlist };
  }

  async updateWishlistPrivacy(id, isPublic) {
    await this.delay();
    
    const index = this.sharedWishlists.findIndex(w => w.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Wishlist with ID ${id} not found`);
    }

    this.sharedWishlists[index].isPublic = isPublic;
    return { ...this.sharedWishlists[index] };
  }

async addItemToWishlist(wishlistId, item) {
    await this.delay();
    
    const wishlist = this.sharedWishlists.find(w => w.Id === parseInt(wishlistId));
    if (!wishlist) {
      throw new Error(`Wishlist with ID ${wishlistId} not found`);
    }

    const newItem = {
      Id: Math.max(...wishlist.items.map(i => i.Id || 0), 0) + 1,
      ...item,
      addedAt: new Date().toISOString(),
      addedBy: 'current-user@example.com'
    };

    wishlist.items.push(newItem);
    
    // Send wishlist update notification
    await this.sendWishlistUpdateNotification(wishlist, 'item_added', newItem);
    
    // Track user activity for personalization
    this.trackUserWishlistActivity('item_added', newItem);
    
    return newItem;
  }

async sendWishlistUpdateNotification(wishlist, action, item = null) {
    await this.delay(100);
    
    try {
      const { alertNotificationService } = await import('@/services/api/alertNotificationService');
      
      const notification = {
        type: 'wishlist_update',
        wishlist,
        action, // 'item_added', 'item_removed', 'privacy_changed'
        item,
        timestamp: new Date().toISOString()
      };
      
      await alertNotificationService.processNotification(notification);
      
      // Also sync with user preferences if enabled
      this.syncWishlistWithUserProfile(wishlist, action, item);
    } catch (error) {
      console.warn('Failed to send wishlist notification:', error);
    }
  }

async sendFriendActivityNotification(friendId, activity, data = null) {
    await this.delay(100);
    
    try {
      const { alertNotificationService } = await import('@/services/api/alertNotificationService');
      
      const friend = this.friends.find(f => f.Id === parseInt(friendId));
      if (!friend) return;
      
      const notification = {
        type: 'friend_activity',
        friend,
        activity, // 'shared_gift', 'updated_wishlist', 'joined_group_gift'
        data,
        timestamp: new Date().toISOString()
      };
      
      await alertNotificationService.processNotification(notification);
      
      // Track friend activity for user's social insights
      this.updateUserSocialStats('friendActivity', { friendId, activity, data });
    } catch (error) {
      console.warn('Failed to send friend activity notification:', error);
    }
  }

  // Gift Activities
  async getGiftActivities() {
    await this.delay();
    return [...this.giftActivities];
  }

async shareGift(giftId, friendIds, message = '') {
    await this.delay();
    
    const activities = friendIds.map(friendId => {
      const friend = this.friends.find(f => f.Id === parseInt(friendId));
      return {
        Id: this.getNextId(this.giftActivities),
        type: 'shared',
        friendId: parseInt(friendId),
        friendName: friend?.name || 'Unknown Friend',
        friendPhotoUrl: friend?.photoUrl || '',
        giftId: parseInt(giftId),
        giftTitle: `Gift #${giftId}`,
        recipientId: null,
        recipientName: '',
        timestamp: new Date().toISOString(),
        privacy: 'public',
        message: message,
        canView: true,
        reactions: []
      };
    });

    this.giftActivities.push(...activities);
    
    // Track sharing activity for user insights
    this.updateUserSocialStats('giftShared', { giftId, friendCount: friendIds.length });
    
    return activities;
  }

async recordGiftActivity(activityData) {
    await this.delay();
    
    const newActivity = {
      Id: this.getNextId(this.giftActivities),
      type: activityData.type || 'shared',
      friendId: parseInt(activityData.friendId),
      friendName: activityData.friendName,
      friendPhotoUrl: activityData.friendPhotoUrl || '',
      giftId: parseInt(activityData.giftId),
      giftTitle: activityData.giftTitle,
      recipientId: activityData.recipientId ? parseInt(activityData.recipientId) : null,
      recipientName: activityData.recipientName || '',
      occasion: activityData.occasion || '',
      price: activityData.price || null,
      timestamp: new Date().toISOString(),
      privacy: activityData.privacy || 'public',
      notes: activityData.notes || '',
      canView: activityData.canView !== false,
      reactions: []
    };

    this.giftActivities.push(newActivity);
    
    // Sync activity with user profile if enabled
    this.syncActivityWithUserProfile(newActivity);
    
    return { ...newActivity };
  }

// Social Stats
  async getSocialStats() {
    await this.delay();
    
    const stats = {
      totalFriends: this.friends.length,
      connectedFriends: this.friends.filter(f => f.status === 'connected').length,
      totalWishlists: this.sharedWishlists.length,
      publicWishlists: this.sharedWishlists.filter(w => w.isPublic).length,
      recentActivities: this.giftActivities.filter(a => {
        const activityDate = new Date(a.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return activityDate > weekAgo;
      }).length
    };

    return stats;
  }

  // User Profile Integration Methods
  async updateUserSocialStats(action, data = null) {
    if (!this.userActivitySyncEnabled) return;
    
    try {
      const { userService } = await import('@/services/api/userService');
      
      switch (action) {
        case 'friendAdded':
          // Update friend count in user profile
          break;
        case 'wishlistCreated':
          // Update wishlist count in user profile
          break;
        case 'giftShared':
        case 'friendActivity':
          // Track social engagement for recommendations
          break;
      }
    } catch (error) {
      console.warn('Could not sync social stats with user profile:', error);
    }
  }

  async trackUserWishlistActivity(action, item) {
    if (!this.userActivitySyncEnabled) return;
    
    try {
      const { userService } = await import('@/services/api/userService');
      await userService.trackGiftInteraction(null, item.Id, 'wishlist_' + action);
    } catch (error) {
      console.warn('Could not track wishlist activity:', error);
    }
  }

  async syncWishlistWithUserProfile(wishlist, action, item) {
    if (!this.userActivitySyncEnabled) return;
    
    try {
      const { userService } = await import('@/services/api/userService');
      
      if (action === 'item_added' && item?.category) {
        // Update user preferences based on wishlist items
        const currentPrefs = await userService.getPreferences();
        if (!currentPrefs.giftCategories.includes(item.category)) {
          const updatedPrefs = {
            ...currentPrefs,
            giftCategories: [...currentPrefs.giftCategories, item.category]
          };
          await userService.updatePreferences(updatedPrefs);
        }
      }
    } catch (error) {
      console.warn('Could not sync wishlist with user profile:', error);
    }
  }

  async syncActivityWithUserProfile(activity) {
    if (!this.userActivitySyncEnabled) return;
    
    try {
      const { userService } = await import('@/services/api/userService');
      
      // Track social gift activities for user insights
      if (activity.type === 'shared' && activity.price) {
        await userService.addToOrderHistory({
          giftName: activity.giftTitle,
          recipientName: activity.recipientName || 'Friend',
          price: activity.price,
          category: 'Social'
        });
      }
} catch (error) {
      console.warn('Could not sync activity with user profile:', error);
    }
  }
}

export const socialGiftService = new SocialGiftService();