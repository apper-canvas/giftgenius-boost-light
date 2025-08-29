class GroupGiftService {
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
          {"field": {"Name": "Title"}},
          {"field": {"Name": "RecipientId"}},
          {"field": {"Name": "GiftId"}},
          {"field": {"Name": "OccasionType"}},
          {"field": {"Name": "TargetAmount"}},
          {"field": {"Name": "CurrentAmount"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "CreatedAt"}},
          {"field": {"Name": "Deadline"}},
          {"field": {"Name": "Status"}},
          {"field": {"Name": "Description"}},
          {"field": {"Name": "Contributors"}},
          {"field": {"Name": "InvitedContributors"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('group_gift_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(groupGift => ({
        ...groupGift,
        recipientId: groupGift.RecipientId,
        giftId: groupGift.GiftId,
        targetAmount: groupGift.TargetAmount || 0,
        currentAmount: groupGift.CurrentAmount || 0,
        createdBy: groupGift.CreatedBy,
        createdAt: groupGift.CreatedAt,
        deadline: groupGift.Deadline,
        status: groupGift.Status || 'active',
        description: groupGift.Description || '',
        contributors: groupGift.Contributors ? JSON.parse(groupGift.Contributors) : [],
        invitedContributors: groupGift.InvitedContributors ? JSON.parse(groupGift.InvitedContributors) : []
      }));
    } catch (error) {
      console.error("Error fetching group gifts:", error?.response?.data?.message || error);
      return [];
    }
  }

  async create(groupGiftData) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        records: [{
          Title: groupGiftData.title,
          RecipientId: parseInt(groupGiftData.recipientId),
          GiftId: groupGiftData.giftId ? parseInt(groupGiftData.giftId) : null,
          OccasionType: groupGiftData.occasionType || 'General',
          TargetAmount: parseFloat(groupGiftData.targetAmount) || 0,
          CurrentAmount: 0,
          CreatedBy: groupGiftData.createdBy,
          CreatedAt: new Date().toISOString(),
          Deadline: groupGiftData.deadline,
          Status: 'active',
          Description: groupGiftData.description || '',
          Contributors: JSON.stringify([]),
          InvitedContributors: JSON.stringify(groupGiftData.invitedContributors || [])
        }]
      };
      
      const response = await this.apperClient.createRecord('group_gift_c', params);
      
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
            recipientId: created.RecipientId,
            giftId: created.GiftId,
            targetAmount: created.TargetAmount || 0,
            currentAmount: created.CurrentAmount || 0,
            createdBy: created.CreatedBy,
            createdAt: created.CreatedAt,
            deadline: created.Deadline,
            status: created.Status || 'active',
            description: created.Description || '',
            contributors: created.Contributors ? JSON.parse(created.Contributors) : [],
            invitedContributors: created.InvitedContributors ? JSON.parse(created.InvitedContributors) : []
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating group gift:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const response = await this.apperClient.deleteRecord('group_gift_c', {
        RecordIds: [parseInt(id)]
      });
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.results?.[0]?.success || false;
    } catch (error) {
      console.error("Error deleting group gift:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getContributionStats() {
    try {
      const groupGifts = await this.getAll();
      
      const stats = {
        totalGroupGifts: groupGifts.length,
        activeGroupGifts: groupGifts.filter(g => g.status === 'active').length,
        completedGroupGifts: groupGifts.filter(g => g.status === 'completed').length,
        totalAmount: groupGifts.reduce((sum, g) => sum + (g.currentAmount || 0), 0),
        averageContribution: 0,
        totalContributors: 0
      };

      const allContributors = groupGifts.flatMap(g => g.contributors || []);
      stats.totalContributors = allContributors.length;
      
      if (stats.totalContributors > 0) {
        const totalContributions = allContributors.reduce((sum, c) => sum + (c.amount || 0), 0);
        stats.averageContribution = totalContributions / stats.totalContributors;
      }

      return stats;
    } catch (error) {
      console.error("Error getting contribution stats:", error?.response?.data?.message || error);
      return {
        totalGroupGifts: 0,
        activeGroupGifts: 0,
        completedGroupGifts: 0,
        totalAmount: 0,
        averageContribution: 0,
        totalContributors: 0
      };
    }
  }

  // Additional methods for contribution management
  async inviteContributors(id, invitations) {
    try {
      const groupGift = await this.getById(id);
      if (!groupGift) return [];
      
      const newInvitations = invitations.map(invitation => ({
        email: invitation.email,
        name: invitation.name || invitation.email,
        invitedAt: new Date().toISOString(),
        status: 'pending'
      }));

      const existingEmails = [
        ...(groupGift.contributors || []).map(c => c.email),
        ...(groupGift.invitedContributors || []).map(i => i.email)
      ];

      const uniqueInvitations = newInvitations.filter(
        inv => !existingEmails.includes(inv.email)
      );

      const updatedInvitations = [...(groupGift.invitedContributors || []), ...uniqueInvitations];
      
      await this.update(id, { invitedContributors: updatedInvitations });
      return uniqueInvitations;
    } catch (error) {
      console.error("Error inviting contributors:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Title"}},
          {"field": {"Name": "RecipientId"}},
          {"field": {"Name": "GiftId"}},
          {"field": {"Name": "OccasionType"}},
          {"field": {"Name": "TargetAmount"}},
          {"field": {"Name": "CurrentAmount"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "CreatedAt"}},
          {"field": {"Name": "Deadline"}},
          {"field": {"Name": "Status"}},
          {"field": {"Name": "Description"}},
          {"field": {"Name": "Contributors"}},
          {"field": {"Name": "InvitedContributors"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('group_gift_c', parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }
      
      const groupGift = response.data;
      return {
        ...groupGift,
        recipientId: groupGift.RecipientId,
        giftId: groupGift.GiftId,
        targetAmount: groupGift.TargetAmount || 0,
        currentAmount: groupGift.CurrentAmount || 0,
        createdBy: groupGift.CreatedBy,
        createdAt: groupGift.CreatedAt,
        deadline: groupGift.Deadline,
        status: groupGift.Status || 'active',
        description: groupGift.Description || '',
        contributors: groupGift.Contributors ? JSON.parse(groupGift.Contributors) : [],
        invitedContributors: groupGift.InvitedContributors ? JSON.parse(groupGift.InvitedContributors) : []
      };
    } catch (error) {
      console.error(`Error fetching group gift ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, groupGiftData) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const updateData = { Id: parseInt(id) };
      
      if (groupGiftData.contributors !== undefined) {
        updateData.Contributors = JSON.stringify(groupGiftData.contributors);
      }
      if (groupGiftData.invitedContributors !== undefined) {
        updateData.InvitedContributors = JSON.stringify(groupGiftData.invitedContributors);
      }
      if (groupGiftData.currentAmount !== undefined) {
        updateData.CurrentAmount = groupGiftData.currentAmount;
      }
      if (groupGiftData.status !== undefined) {
        updateData.Status = groupGiftData.status;
      }
      
      const params = {
        records: [updateData]
      };
      
      const response = await this.apperClient.updateRecord('group_gift_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.results?.[0]?.data || null;
    } catch (error) {
      console.error("Error updating group gift:", error?.response?.data?.message || error);
      throw error;
    }
  }
}

export const groupGiftService = new GroupGiftService();