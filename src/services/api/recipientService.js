import React from "react";
import Error from "@/components/ui/Error";
class RecipientService {
  constructor() {
    this.apperClient = null;
    this.data = [];
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

  async getAll() {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Relationship"}},
          {"field": {"Name": "Age"}},
          {"field": {"Name": "Interests"}},
          {"field": {"Name": "Location"}},
          {"field": {"Name": "PhotoUrl"}},
          {"field": {"Name": "Birthday"}},
          {"field": {"Name": "GiftHistory"}},
          {"field": {"Name": "Preferences"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "DESC"}]
      };
      
      const response = await this.apperClient.fetchRecords('recipient_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      // Transform data to match UI expectations
      return response.data.map(recipient => ({
        ...recipient,
        interests: recipient.Interests ? recipient.Interests.split(',').map(i => i.trim()) : [],
        giftHistory: recipient.GiftHistory ? JSON.parse(recipient.GiftHistory) : [],
        occasions: [
          {
            Id: 1,
            type: 'Birthday',
            date: recipient.Birthday || new Date().toISOString(),
            budget: 100,
            notes: ''
          }
        ]
      }));
    } catch (error) {
      console.error("Error fetching recipients:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Relationship"}},
          {"field": {"Name": "Age"}},
          {"field": {"Name": "Interests"}},
          {"field": {"Name": "Location"}},
          {"field": {"Name": "PhotoUrl"}},
          {"field": {"Name": "Birthday"}},
          {"field": {"Name": "GiftHistory"}},
          {"field": {"Name": "Preferences"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('recipient_c', parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }
      
      // Transform data to match UI expectations
      const recipient = response.data;
      return {
        ...recipient,
        interests: recipient.Interests ? recipient.Interests.split(',').map(i => i.trim()) : [],
        giftHistory: recipient.GiftHistory ? JSON.parse(recipient.GiftHistory) : [],
        occasions: [
          {
            Id: 1,
            type: 'Birthday',
            date: recipient.Birthday || new Date().toISOString(),
            budget: 100,
            notes: ''
          }
        ]
      };
    } catch (error) {
      console.error(`Error fetching recipient ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(recipientData) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        records: [{
          Name: recipientData.name,
          Relationship: recipientData.relationship,
          Age: parseInt(recipientData.age),
          Interests: recipientData.interests?.join(', ') || '',
          Location: recipientData.location,
          PhotoUrl: recipientData.photoUrl || "",
          Birthday: recipientData.birthday || new Date().toISOString(),
          GiftHistory: JSON.stringify(recipientData.giftHistory || []),
          Preferences: JSON.stringify({
            preferredCategories: [],
            avoidedCategories: [],
            priceRange: { min: 0, max: 500 },
            lastUpdated: new Date().toISOString()
          })
        }]
      };
      
      const response = await this.apperClient.createRecord('recipient_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        if (successful[0]?.data) {
          const created = successful[0].data;
          return {
            ...created,
            interests: created.Interests ? created.Interests.split(',').map(i => i.trim()) : [],
            giftHistory: created.GiftHistory ? JSON.parse(created.GiftHistory) : [],
            occasions: recipientData.occasions || []
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating recipient:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, recipientData) {
    try {
      await this.delay(350);
      const index = this.data.findIndex(r => r.Id === parseInt(id));
      if (index === -1) throw new Error("Recipient not found");
      
      this.data[index] = { ...this.data[index], ...recipientData, Id: parseInt(id) };
      return { ...this.data[index] };
    } catch (error) {
      console.error(`Error updating recipient ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
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
      rating: null
    };
    
    recipient.giftHistory = recipient.giftHistory || [];
    recipient.giftHistory.unshift(giftEntry);
    
    this.updateRecipientPreferences(recipient, giftData);
    this.syncWithUserPreferences(recipient, giftData);
    
    return { ...recipient };
  }

  async syncWithUserPreferences(recipient, giftData) {
    try {
      if (recipient.userConnection?.syncWithProfile) {
        const { userService } = await import('@/services/api/userService');
        
        await userService.addToOrderHistory({
          giftName: giftData.title || `Gift for ${recipient.name}`,
          recipientName: recipient.name,
          price: giftData.price || 0,
          category: giftData.category
        });

        await userService.trackGiftInteraction(recipient.Id, giftData.Id, 'purchase');
      }
    } catch (error) {
      console.warn('Could not sync with user preferences:', error);
    }
  }

  async trackInteraction(recipientId, interactionType, giftData = null) {
    try {
      console.log(`Recipient ${recipientId} interaction: ${interactionType}`, giftData);
      
      if (giftData) {
        const recipient = await this.getById(recipientId);
        if (recipient) {
          const updatedPreferences = this.updateRecipientPreferences(recipient, giftData);
          await this.update(recipientId, { preferences: updatedPreferences });
        }
      }
      
      await this.delay(100);
      const recipient = this.data.find(r => r.Id === parseInt(recipientId));
      if (recipient) {
        recipient.interactionHistory = recipient.interactionHistory || [];
        recipient.interactionHistory.unshift({
          type: interactionType,
          giftId: giftData?.Id,
          category: giftData?.category,
          price: giftData?.price,
          timestamp: new Date().toISOString()
        });
        
        recipient.interactionHistory = recipient.interactionHistory.slice(0, 50);

        try {
          const { userService } = await import('@/services/api/userService');
          await userService.trackGiftInteraction(recipientId, giftData?.Id, interactionType);
        } catch (error) {
          console.warn('Could not sync interaction with user service:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error tracking interaction:", error?.response?.data?.message || error);
      return false;
    }
  }

  updateRecipientPreferences(recipient, giftData) {
    const preferences = recipient.preferences || {
      preferredCategories: [],
      avoidedCategories: [],
      priceRange: { min: 0, max: 500 }
    };
    
    if (giftData.Category && !preferences.preferredCategories.includes(giftData.Category)) {
      preferences.preferredCategories.push(giftData.Category);
    }
    
    if (giftData.category && !preferences.preferredCategories.includes(giftData.category)) {
      preferences.preferredCategories.push(giftData.category);
    }
    
    if (giftData.Price) {
      preferences.priceRange.min = Math.min(preferences.priceRange.min, giftData.Price);
      preferences.priceRange.max = Math.max(preferences.priceRange.max, giftData.Price);
    }
    
    if (giftData.price) {
      const currentRange = preferences.priceRange;
      if (giftData.price > currentRange.max) {
        currentRange.max = Math.min(giftData.price * 1.5, 1000);
      }
    }
    
    preferences.lastUpdated = new Date().toISOString();
    return preferences;
  }

  async getUpcomingBirthdays(daysAhead = 30) {
    try {
      const recipients = await this.getAll();
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + daysAhead);
      
      return recipients.filter(recipient => {
        const birthday = recipient.Birthday || recipient.birthday;
        if (!birthday) return false;
        
        const birthdayDate = new Date(birthday);
        const thisYearBirthday = new Date(now.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
        
        if (thisYearBirthday < now) {
          thisYearBirthday.setFullYear(now.getFullYear() + 1);
        }
        
        return thisYearBirthday >= now && thisYearBirthday <= future;
      });
    } catch (error) {
      console.error("Error getting upcoming birthdays:", error?.response?.data?.message || error);
      return [];
    }
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

}

export const recipientService = new RecipientService();