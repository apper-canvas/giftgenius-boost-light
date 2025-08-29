class SavedGiftService {
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

  async getAll() {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "GiftId"}},
          {"field": {"Name": "RecipientId"}},
          {"field": {"Name": "SavedDate"}},
          {"field": {"Name": "PriceAlert"}},
          {"field": {"Name": "Notes"}},
          {"field": {"Name": "UserId"}}
        ],
        orderBy: [{"fieldName": "SavedDate", "sorttype": "DESC"}]
      };
      
      const response = await this.apperClient.fetchRecords('saved_gift_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(savedGift => ({
        ...savedGift,
        giftId: savedGift.GiftId,
        recipientId: savedGift.RecipientId,
        savedDate: savedGift.SavedDate,
        priceAlert: savedGift.PriceAlert || false,
        notes: savedGift.Notes || ""
      }));
    } catch (error) {
      console.error("Error fetching saved gifts:", error?.response?.data?.message || error);
      return [];
    }
  }

  async create(savedGiftData) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        records: [{
          GiftId: parseInt(savedGiftData.giftId),
          RecipientId: parseInt(savedGiftData.recipientId),
          SavedDate: new Date().toISOString(),
          PriceAlert: savedGiftData.priceAlert || false,
          Notes: savedGiftData.notes || "",
          UserId: savedGiftData.userId || 1
        }]
      };
      
      const response = await this.apperClient.createRecord('saved_gift_c', params);
      
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
            giftId: created.GiftId,
            recipientId: created.RecipientId,
            savedDate: created.SavedDate,
            priceAlert: created.PriceAlert || false,
            notes: created.Notes || ""
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating saved gift:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, savedGiftData) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const updateData = {
        Id: parseInt(id)
      };
      
      if (savedGiftData.priceAlert !== undefined) {
        updateData.PriceAlert = savedGiftData.priceAlert;
      }
      if (savedGiftData.notes !== undefined) {
        updateData.Notes = savedGiftData.notes;
      }
      
      const params = {
        records: [updateData]
      };
      
      const response = await this.apperClient.updateRecord('saved_gift_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        if (successful[0]?.data) {
          const updated = successful[0].data;
          return {
            ...updated,
            giftId: updated.GiftId,
            recipientId: updated.RecipientId,
            savedDate: updated.SavedDate,
            priceAlert: updated.PriceAlert || false,
            notes: updated.Notes || ""
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating saved gift:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const response = await this.apperClient.deleteRecord('saved_gift_c', {
        RecordIds: [parseInt(id)]
      });
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.results?.[0]?.success || false;
    } catch (error) {
      console.error("Error deleting saved gift:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async createPriceAlert(savedGiftId, alertConfig) {
    try {
      const savedGift = await this.getById(savedGiftId);
      if (!savedGift) throw new Error("Saved gift not found");

      // Import priceAlertService dynamically to avoid circular dependency
      const { priceAlertService } = await import('./priceAlertService.js');
      
      const alertData = {
        giftId: savedGift.giftId,
        recipientId: savedGift.recipientId,
        ...alertConfig,
        originalPrice: savedGift.gift?.Price || 0
      };

      return await priceAlertService.create(alertData);
    } catch (error) {
      console.error("Error creating price alert:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "GiftId"}},
          {"field": {"Name": "RecipientId"}},
          {"field": {"Name": "SavedDate"}},
          {"field": {"Name": "PriceAlert"}},
          {"field": {"Name": "Notes"}},
          {"field": {"Name": "UserId"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('saved_gift_c', parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }
      
      const savedGift = response.data;
      return {
        ...savedGift,
        giftId: savedGift.GiftId,
        recipientId: savedGift.RecipientId,
        savedDate: savedGift.SavedDate,
        priceAlert: savedGift.PriceAlert || false,
        notes: savedGift.Notes || ""
      };
    } catch (error) {
      console.error(`Error fetching saved gift ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }
}

export const savedGiftService = new SavedGiftService();