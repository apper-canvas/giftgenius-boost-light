class ReminderService {
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
          {"field": {"Name": "RecipientId"}},
          {"field": {"Name": "OccasionId"}},
          {"field": {"Name": "AlertDate"}},
          {"field": {"Name": "Status"}},
          {"field": {"Name": "Type"}},
          {"field": {"Name": "Message"}},
          {"field": {"Name": "CreatedAt"}}
        ],
        orderBy: [{"fieldName": "AlertDate", "sorttype": "ASC"}]
      };
      
      const response = await this.apperClient.fetchRecords('reminder_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(reminder => ({
        ...reminder,
        recipientId: reminder.RecipientId,
        occasionId: reminder.OccasionId,
        alertDate: reminder.AlertDate,
        status: reminder.Status || 'active',
        type: reminder.Type || 'general'
      }));
    } catch (error) {
      console.error("Error fetching reminders:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getUpcoming(days = 30) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + days);
      
      const params = {
        fields: [
          {"field": {"Name": "RecipientId"}},
          {"field": {"Name": "OccasionId"}},
          {"field": {"Name": "AlertDate"}},
          {"field": {"Name": "Status"}},
          {"field": {"Name": "Type"}},
          {"field": {"Name": "Message"}},
          {"field": {"Name": "CreatedAt"}}
        ],
        where: [
          {"FieldName": "AlertDate", "Operator": "GreaterThanOrEqualTo", "Values": [now.toISOString()]},
          {"FieldName": "AlertDate", "Operator": "LessThanOrEqualTo", "Values": [future.toISOString()]},
          {"FieldName": "Status", "Operator": "EqualTo", "Values": ["active"]}
        ],
        orderBy: [{"fieldName": "AlertDate", "sorttype": "ASC"}]
      };
      
      const response = await this.apperClient.fetchRecords('reminder_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(reminder => ({
        ...reminder,
        recipientId: reminder.RecipientId,
        occasionId: reminder.OccasionId,
        alertDate: reminder.AlertDate,
        status: reminder.Status || 'active',
        type: reminder.Type || 'general'
      }));
    } catch (error) {
      console.error("Error fetching upcoming reminders:", error?.response?.data?.message || error);
      return [];
    }
  }

  async update(id, reminderData) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          AlertDate: reminderData.alertDate,
          Status: reminderData.status
        }]
      };
      
      const response = await this.apperClient.updateRecord('reminder_c', params);
      
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
            recipientId: updated.RecipientId,
            occasionId: updated.OccasionId,
            alertDate: updated.AlertDate,
            status: updated.Status
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating reminder:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async sendBirthdayNotification(recipientId, daysAdvance = 7) {
    try {
      const { alertNotificationService } = await import('@/services/api/alertNotificationService');
      const { recipientService } = await import('@/services/api/recipientService');
      
      const recipient = await recipientService.getById(recipientId);
      if (!recipient) return;
      
      const notification = {
        type: 'birthday_reminder',
        recipient,
        daysAdvance,
        timestamp: new Date().toISOString()
      };
      
      await alertNotificationService.processNotification(notification);
    } catch (error) {
      console.warn('Failed to send birthday notification:', error);
    }
  }

  async getBirthdayReminders(daysAhead = 30) {
    try {
      const { recipientService } = await import('@/services/api/recipientService');
      
      const recipients = await recipientService.getAll();
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + daysAhead);
      
      const upcomingBirthdays = recipients.filter(recipient => {
        if (!recipient.Birthday) return false;
        
        const birthday = new Date(recipient.Birthday);
        const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
        
        if (thisYearBirthday < now) {
          thisYearBirthday.setFullYear(now.getFullYear() + 1);
        }
        
        return thisYearBirthday >= now && thisYearBirthday <= future;
      }).map(recipient => ({
        Id: Date.now() + Math.random(),
        recipientId: recipient.Id,
        occasionId: null,
        alertDate: new Date(now.getFullYear(), new Date(recipient.Birthday).getMonth(), new Date(recipient.Birthday).getDate() - 7).toISOString(),
        status: "active",
        type: "birthday"
      }));
      
      return upcomingBirthdays;
    } catch (error) {
      console.warn('Failed to get birthday reminders:', error);
      return [];
    }
  }
}

export const reminderService = new ReminderService();