import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ReminderCard from "@/components/molecules/ReminderCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { reminderService } from "@/services/api/reminderService";
import { recipientService } from "@/services/api/recipientService";
import { format, differenceInDays, parseISO, addDays } from "date-fns";
import { toast } from "react-toastify";

const Reminders = () => {
  const [reminders, setReminders] = React.useState([]);
  const [recipients, setRecipients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
const [error, setError] = React.useState("");
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    loadData();
  }, []);

  // Check for upcoming birthdays and send notifications
  React.useEffect(() => {
    const checkBirthdayNotifications = async () => {
      try {
        const birthdayRecipients = await recipientService.getUpcomingBirthdays(7);
        
        for (const recipient of birthdayRecipients) {
          const birthday = new Date(recipient.birthday);
          const now = new Date();
          const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
          
          if (thisYearBirthday < now) {
            thisYearBirthday.setFullYear(now.getFullYear() + 1);
          }
          
          const daysUntil = Math.ceil((thisYearBirthday - now) / (1000 * 60 * 60 * 24));
          
          if ([7, 3, 1, 0].includes(daysUntil)) {
            await reminderService.sendBirthdayNotification(recipient.Id, daysUntil);
          }
        }
      } catch (error) {
        console.warn('Failed to check birthday notifications:', error);
      }
    };

    checkBirthdayNotifications();
  }, [reminders]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [remindersData, recipientsData] = await Promise.all([
        reminderService.getAll(),
        recipientService.getAll()
      ]);
      
      setReminders(remindersData);
      setRecipients(recipientsData);
    } catch (err) {
      setError("Failed to load reminders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSnoozeReminder = async (reminder) => {
    try {
      const snoozeDate = addDays(new Date(), 1);
      await reminderService.update(reminder.Id, {
        ...reminder,
        alertDate: snoozeDate.toISOString(),
        status: "snoozed"
      });
      
      setReminders(prev => prev.map(r => 
        r.Id === reminder.Id 
          ? { ...r, alertDate: snoozeDate.toISOString(), status: "snoozed" }
          : r
      ));
      
      toast.success("Reminder snoozed until tomorrow");
    } catch (err) {
      toast.error("Failed to snooze reminder");
    }
  };

  const handleFindGifts = (recipient, occasion) => {
    toast.info(`Finding gifts for ${recipient.name}...`);
    // In a real app, this would navigate to gift results
  };

  const handleCreateReminder = () => {
    toast.info("Reminder creation would open here");
    // In a real app, this would open a modal or navigate to creation form
  };

  const getFilteredReminders = () => {
    const now = new Date();
    
    return reminders.filter(reminder => {
      const recipient = recipients.find(r => r.Id === reminder.recipientId);
      if (!recipient) return false;
      
      const occasion = recipient.occasions?.find(o => o.Id === reminder.occasionId);
      if (!occasion) return false;
      
      const daysUntil = differenceInDays(parseISO(occasion.date), now);
      
      switch (filter) {
        case "urgent":
          return daysUntil <= 3 && daysUntil >= 0;
        case "upcoming":
          return daysUntil > 3 && daysUntil <= 14;
        case "future":
          return daysUntil > 14;
        case "overdue":
          return daysUntil < 0;
        default:
          return true;
      }
    }).sort((a, b) => {
      const recipientA = recipients.find(r => r.Id === a.recipientId);
      const recipientB = recipients.find(r => r.Id === b.recipientId);
      const occasionA = recipientA?.occasions?.find(o => o.Id === a.occasionId);
      const occasionB = recipientB?.occasions?.find(o => o.Id === b.occasionId);
      
      if (!occasionA || !occasionB) return 0;
      
      return parseISO(occasionA.date) - parseISO(occasionB.date);
    });
  };

  const filteredReminders = getFilteredReminders();

  const getFilterCounts = () => {
    const now = new Date();
    const counts = {
      all: reminders.length,
      urgent: 0,
      upcoming: 0,
      future: 0,
      overdue: 0
    };

    reminders.forEach(reminder => {
      const recipient = recipients.find(r => r.Id === reminder.recipientId);
      if (!recipient) return;
      
      const occasion = recipient.occasions?.find(o => o.Id === reminder.occasionId);
      if (!occasion) return;
      
      const daysUntil = differenceInDays(parseISO(occasion.date), now);
      
      if (daysUntil < 0) counts.overdue++;
      else if (daysUntil <= 3) counts.urgent++;
      else if (daysUntil <= 14) counts.upcoming++;
      else counts.future++;
    });

    return counts;
  };

  if (loading) return <Loading message="Loading your reminders..." />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const filterCounts = getFilterCounts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Gift Reminders
          </h1>
          <p className="text-gray-600 mt-1">
            Never miss an important occasion again
          </p>
        </div>
        
        <Button 
          variant="primary" 
          icon="Plus"
          onClick={handleCreateReminder}
        >
          Create Reminder
        </Button>
      </div>

      {/* Filter Tabs */}
      {reminders.length > 0 && (
        <Card variant="compact">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All", count: filterCounts.all },
              { key: "overdue", label: "Overdue", count: filterCounts.overdue, variant: "error" },
              { key: "urgent", label: "Urgent", count: filterCounts.urgent, variant: "warning" },
              { key: "upcoming", label: "Upcoming", count: filterCounts.upcoming, variant: "accent" },
              { key: "future", label: "Future", count: filterCounts.future, variant: "default" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === tab.key
                    ? "bg-primary-100 text-primary-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge variant={tab.variant || "default"} size="sm">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      {reminders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center bg-gradient-to-br from-red-50 to-pink-50 border-red-200" variant="compact">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="AlertTriangle" className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-700">{filterCounts.overdue}</div>
              <div className="text-sm text-red-600">Overdue</div>
            </div>
          </Card>

          <Card className="text-center bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" variant="compact">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="Clock" className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-700">{filterCounts.urgent}</div>
              <div className="text-sm text-amber-600">Urgent (≤3 days)</div>
            </div>
          </Card>

          <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" variant="compact">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="Calendar" className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">{filterCounts.upcoming}</div>
              <div className="text-sm text-blue-600">Upcoming</div>
            </div>
          </Card>

          <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" variant="compact">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="CheckCircle" className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700">{filterCounts.future}</div>
              <div className="text-sm text-green-600">Future</div>
            </div>
          </Card>
        </div>
      )}

      {/* Reminders List */}
      {filteredReminders.length > 0 ? (
        <div className="space-y-4">
          {filteredReminders.map((reminder, index) => {
            const recipient = recipients.find(r => r.Id === reminder.recipientId);
            const occasion = recipient?.occasions?.find(o => o.Id === reminder.occasionId);
            
            if (!recipient || !occasion) return null;
            
            return (
              <motion.div
                key={reminder.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <ReminderCard
                  reminder={reminder}
                  recipient={recipient}
                  occasion={occasion}
                  onSnooze={handleSnoozeReminder}
                  onFindGifts={handleFindGifts}
                />
              </motion.div>
            );
          })}
        </div>
      ) : reminders.length > 0 ? (
        <Empty
          icon="Filter"
          title={`No ${filter} reminders`}
          description={`There are no reminders in the ${filter} category right now.`}
          action={
            <Button variant="outline" onClick={() => setFilter("all")}>
              View All Reminders
            </Button>
          }
        />
      ) : (
        <Empty
          icon="Bell"
          title="No reminders yet"
          description="Create reminders for important occasions and never miss a gift-giving opportunity again."
          action={
            <Button variant="primary" icon="Plus" onClick={handleCreateReminder}>
              Create Your First Reminder
            </Button>
          }
        />
)}
    </div>
  );
};

export default Reminders;