import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Avatar from "@/components/atoms/Avatar";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { recipientService } from "@/services/api/recipientService";
import { reminderService } from "@/services/api/reminderService";
import { userService } from "@/services/api/userService";
import { format, differenceInDays, parseISO } from "date-fns";
import { toast } from "react-toastify";
const Home = () => {
const [recipients, setRecipients] = React.useState([]);
  const [reminders, setReminders] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [recommendations, setRecommendations] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [recipientsData, remindersData, userData, recommendationsData] = await Promise.all([
        recipientService.getAll(),
        reminderService.getUpcoming(),
        userService.getProfile(),
        userService.getPersonalizedRecommendations()
      ]);
      
      setRecipients(recipientsData.slice(0, 6)); // Show latest 6 recipients
      setReminders(remindersData.slice(0, 4)); // Show upcoming 4 reminders
      setUser(userData);
      setRecommendations(recommendationsData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFindGifts = (recipient) => {
    navigate("/recipients", { state: { selectedRecipient: recipient } });
  };

const handleQuickGift = () => {
    navigate("/recipients");
    toast.info("Select a recipient to find perfect gifts!");
  };

  const handleDIYProjects = () => {
    navigate("/recipients");
    toast.info("Find DIY gift ideas with step-by-step instructions!");
  };

  if (loading) return <Loading message="Loading your dashboard..." />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const urgentReminders = reminders.filter(reminder => {
    const recipient = recipients.find(r => r.Id === reminder.recipientId);
    const occasion = recipient?.occasions?.find(o => o.Id === reminder.occasionId);
    if (!occasion) return false;
    const daysUntil = differenceInDays(parseISO(occasion.date), new Date());
    return daysUntil <= 7;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl font-display font-bold gradient-text mb-4">
          Welcome to GiftGenius
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your AI-powered assistant for finding the perfect gifts for every occasion
        </p>
      </motion.div>

{/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* AI Recommendations Section */}
<Card className="md:col-span-full mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center space-x-2 mb-2">
                <ApperIcon name="Brain" size={20} className="text-indigo-600" />
                <span>Personalized for {user?.name?.split(' ')[0] || 'You'}</span>
                <Badge variant="success" size="sm" className="ml-2">AI Powered</Badge>
              </h3>
              <p className="text-gray-600 text-sm">
                Based on your favorite categories: {recommendations?.categories?.join(', ') || 'Electronics, Books, Art & Crafts'}
              </p>
              {recommendations?.suggestedGifts && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {recommendations.suggestedGifts.slice(0, 3).map((gift) => (
                    <div key={gift.Id} className="bg-white px-3 py-1 rounded-full border border-indigo-200 text-sm">
                      ${gift.price} {gift.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/profile')}
                variant="outline" 
                size="sm"
              >
                <ApperIcon name="Settings" size={16} />
                Preferences
              </Button>
              <Button 
                onClick={() => navigate('/recipients')}
                variant="primary" 
                size="sm"
              >
                <ApperIcon name="ArrowRight" size={16} />
                Explore More
              </Button>
            </div>
          </div>
        </Card>

        {/* Trending Gifts Section */}
        <Card className="md:col-span-full mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center space-x-2 mb-2">
                <ApperIcon name="TrendingUp" size={20} className="text-primary-500" />
                <span>Trending This Week</span>
              </h3>
              <p className="text-gray-600 text-sm">Discover what's popular right now</p>
            </div>
            <Button 
              onClick={() => navigate('/trends')}
              variant="primary" 
              size="sm"
            >
              <ApperIcon name="ArrowRight" size={16} />
              View All Trends
            </Button>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200" hoverable>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="UserPlus" className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add Recipient</h3>
                <p className="text-gray-600 text-sm">Create a profile for someone special</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => navigate("/recipients")}>
                Get Started
              </Button>
            </div>
          </Card>

<Card className="text-center bg-gradient-to-br from-accent-50 to-orange-50 border-accent-200" hoverable>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="Sparkles" className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Account</h3>
                <p className="text-gray-600 text-sm">Manage preferences, orders, and social connections</p>
                {user && (
                  <div className="mt-2">
                    <Badge variant="outline" size="sm">{user.totalRecipients} Recipients</Badge>
                    <Badge variant="outline" size="sm" className="ml-1">{user.totalOrders} Orders</Badge>
                  </div>
                )}
</div>
              <Button variant="accent" size="sm" onClick={() => navigate("/profile")}>
                View Profile
              </Button>
            </div>
          </Card>

          <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" hoverable>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="Hammer" className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">DIY Projects</h3>
                <p className="text-gray-600 text-sm">Create personalized gifts with step-by-step guides</p>
              </div>
              <Button variant="success" size="sm" onClick={handleDIYProjects}>
                Get Started
              </Button>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Urgent Reminders */}
      {urgentReminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <ApperIcon name="AlertCircle" className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Urgent Reminders</h2>
              <Badge variant="error" size="sm">{urgentReminders.length}</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgentReminders.slice(0, 4).map((reminder) => {
                const recipient = recipients.find(r => r.Id === reminder.recipientId);
                const occasion = recipient?.occasions?.find(o => o.Id === reminder.occasionId);
                if (!recipient || !occasion) return null;
                
                const daysUntil = differenceInDays(parseISO(occasion.date), new Date());
                
                return (
                  <div key={reminder.Id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Avatar src={recipient.photoUrl} fallback={recipient.name[0]} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {recipient.name}'s {occasion.type}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(occasion.date), "MMM d, yyyy")} • 
                          <span className={`ml-1 font-medium ${daysUntil <= 1 ? "text-red-600" : "text-amber-600"}`}>
                            {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                          </span>
                        </p>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => handleFindGifts(recipient)}>
                        Find Gifts
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent Recipients */}
      {recipients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your Recipients</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/recipients")}>
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipients.map((recipient, index) => (
              <motion.div
                key={recipient.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="group" hoverable>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar
                        src={recipient.photoUrl}
                        fallback={recipient.name[0]}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {recipient.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {recipient.relationship} • {recipient.age} years old
                        </p>
                        {recipient.location && (
                          <div className="flex items-center space-x-1 mt-1">
                            <ApperIcon name="MapPin" size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{recipient.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Next Occasion */}
                    {recipient.occasions?.[0] && (
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-900">
                            {recipient.occasions[0].type}
                          </span>
                          <span className="text-xs text-purple-700">
                            {format(parseISO(recipient.occasions[0].date), "MMM d")}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Interests */}
                    {recipient.interests && recipient.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recipient.interests.slice(0, 3).map((interest, idx) => (
                          <Badge key={idx} variant="outline" size="sm">
                            {interest}
                          </Badge>
                        ))}
                        {recipient.interests.length > 3 && (
                          <Badge variant="outline" size="sm">
                            +{recipient.interests.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

<Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full"
                      icon="Store"
                      onClick={() => navigate("/stores")}
                    >
                      Shop for Gifts
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {recipients.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center py-12">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
                <ApperIcon name="Users" className="w-10 h-10 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to find amazing gifts?
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Start by adding someone special to your recipients list, and let our AI help you discover perfect gifts for any occasion.
                </p>
              </div>
<Button variant="primary" icon="Plus" onClick={() => navigate("/recipients")}>
                Add Your First Recipient
              </Button>
              <Button variant="outline" icon="Store" onClick={() => navigate("/stores")} className="ml-3">
                Browse Gift Stores
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Home;