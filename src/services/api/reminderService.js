import remindersData from "@/services/mockData/reminders.json";

class ReminderService {
  constructor() {
    this.data = [...remindersData];
  }

  async getAll() {
    await this.delay(250);
    return [...this.data].sort((a, b) => new Date(a.alertDate) - new Date(b.alertDate));
  }

  async getById(id) {
    await this.delay(150);
    const reminder = this.data.find(r => r.Id === parseInt(id));
    return reminder ? { ...reminder } : null;
  }

  async getUpcoming(days = 30) {
    await this.delay(300);
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    
    return this.data
      .filter(reminder => {
        const alertDate = new Date(reminder.alertDate);
        return alertDate >= now && alertDate <= future && reminder.status === "active";
      })
      .sort((a, b) => new Date(a.alertDate) - new Date(b.alertDate));
  }

  async getByRecipient(recipientId) {
    await this.delay(200);
    return this.data.filter(reminder => reminder.recipientId === parseInt(recipientId));
  }

  async create(reminderData) {
    await this.delay(350);
    const newReminder = {
      Id: this.getNextId(),
      ...reminderData,
      status: reminderData.status || "active"
    };
    this.data.push(newReminder);
    return { ...newReminder };
  }

  async update(id, reminderData) {
    await this.delay(300);
    const index = this.data.findIndex(r => r.Id === parseInt(id));
    if (index === -1) throw new Error("Reminder not found");
    
    this.data[index] = { ...this.data[index], ...reminderData, Id: parseInt(id) };
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay(250);
    const index = this.data.findIndex(r => r.Id === parseInt(id));
    if (index === -1) throw new Error("Reminder not found");
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  async snooze(id, hours = 24) {
    await this.delay(200);
    const reminder = this.data.find(r => r.Id === parseInt(id));
    if (!reminder) throw new Error("Reminder not found");
    
    const newAlertDate = new Date();
    newAlertDate.setHours(newAlertDate.getHours() + hours);
    
    return this.update(id, {
      alertDate: newAlertDate.toISOString(),
      status: "snoozed"
    });
  }

async sendBirthdayNotification(recipientId, daysAdvance = 7) {
    await this.delay(200);
    
    const { alertNotificationService } = await import('@/services/api/alertNotificationService');
    const { recipientService } = await import('@/services/api/recipientService');
    
    try {
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
    await this.delay(300);
    const { recipientService } = await import('@/services/api/recipientService');
    
    try {
      const recipients = await recipientService.getAll();
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + daysAhead);
      
      const upcomingBirthdays = recipients.filter(recipient => {
        if (!recipient.birthday) return false;
        
        const birthday = new Date(recipient.birthday);
        const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
        
        if (thisYearBirthday < now) {
          thisYearBirthday.setFullYear(now.getFullYear() + 1);
        }
        
        return thisYearBirthday >= now && thisYearBirthday <= future;
      }).map(recipient => ({
        Id: this.getNextId(),
        recipientId: recipient.Id,
        occasionId: null,
        alertDate: new Date(now.getFullYear(), new Date(recipient.birthday).getMonth(), new Date(recipient.birthday).getDate() - 7).toISOString(),
        status: "active",
        type: "birthday"
      }));
      
      return upcomingBirthdays;
    } catch (error) {
      console.warn('Failed to get birthday reminders:', error);
      return [];
    }
  }

  getNextId() {
    return Math.max(...this.data.map(r => r.Id), 0) + 1;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const reminderService = new ReminderService();