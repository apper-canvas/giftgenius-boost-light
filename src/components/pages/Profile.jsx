import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import SocialConnectModal from "@/components/molecules/SocialConnectModal";
import { userService } from "@/services/api/userService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Profile = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("profile");
  const [showSocialModal, setShowSocialModal] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    location: "",
    birthday: "",
    bio: ""
  });
  
  const [preferences, setPreferences] = React.useState({
    giftCategories: [],
    priceRange: { min: 0, max: 500 },
    occasions: [],
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
  });

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [userData, userPrefs] = await Promise.all([
        userService.getProfile(),
        userService.getPreferences()
      ]);
      
      setUser(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        location: userData.location || "",
        birthday: userData.birthday || "",
        bio: userData.bio || ""
      });
      setPreferences(userPrefs);
    } catch (err) {
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      const updated = await userService.updateProfile(formData);
      setUser(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleUpdatePreferences = async (newPrefs) => {
    try {
      const updated = await userService.updatePreferences(newPrefs);
      setPreferences(updated);
      toast.success("Preferences updated successfully!");
    } catch (err) {
      toast.error("Failed to update preferences. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await userService.deleteAccount();
        toast.success("Account deleted successfully!");
        // Redirect to home or login page
        window.location.href = "/";
      } catch (err) {
        toast.error("Failed to delete account. Please try again.");
      }
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: "User" },
    { id: "preferences", name: "Preferences", icon: "Settings" },
    { id: "orders", name: "Order History", icon: "ShoppingBag" },
    { id: "social", name: "Social", icon: "Users" },
    { id: "privacy", name: "Privacy", icon: "Shield" }
  ];

  const giftCategories = [
    "Electronics", "Books", "Clothing", "Home & Garden", "Sports",
    "Art & Crafts", "Music", "Games", "Food & Drink", "Beauty",
    "Travel", "Health", "Kids", "Pets", "Jewelry"
  ];

  const occasions = [
    "Birthday", "Anniversary", "Wedding", "Christmas", "Holiday",
    "Graduation", "Thank You", "Just Because", "Get Well Soon"
  ];

  if (loading) return <Loading message="Loading your profile..." />;
  if (error) return <Error message={error} onRetry={loadUserData} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            My Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings, preferences, and privacy options
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline"
            icon="UserPlus"
            onClick={() => setShowSocialModal(true)}
          >
            Connect Social
          </Button>
          {activeTab === "profile" && (
            <Button 
              variant="primary"
              icon={isEditing ? "Check" : "Edit"}
              onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar 
            name={user?.name || "User"} 
            size="xl"
            className="ring-4 ring-white shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">{user?.name || "Welcome!"}</h2>
            <p className="text-gray-600">{user?.email}</p>
            {user?.location && (
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
                <ApperIcon name="MapPin" size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">{user.location}</span>
              </div>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <Badge variant="success" size="sm">Active User</Badge>
              <Badge variant="outline" size="sm">{user?.totalRecipients || 0} Recipients</Badge>
              <Badge variant="outline" size="sm">{user?.totalOrders || 0} Orders</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ApperIcon name={tab.icon} size={18} />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "profile" && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <ApperIcon name="User" size={20} />
                <span>Personal Information</span>
              </h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                  
                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Country"
                    disabled={!isEditing}
                  />
                  
                  <Input
                    label="Birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/20 focus:outline-none transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-4">
                    <Button type="submit" variant="primary" icon="Check">
                      Save Changes
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-6">
            {/* Gift Preferences */}
            <Card>
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <ApperIcon name="Gift" size={20} />
                <span>Gift Preferences</span>
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Favorite Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {giftCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          const updatedCategories = preferences.giftCategories.includes(category)
                            ? preferences.giftCategories.filter(c => c !== category)
                            : [...preferences.giftCategories, category];
                          handleUpdatePreferences({
                            ...preferences,
                            giftCategories: updatedCategories
                          });
                        }}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          preferences.giftCategories.includes(category)
                            ? "bg-primary-100 text-primary-700 border-2 border-primary-300"
                            : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range: ${preferences.priceRange.min} - ${preferences.priceRange.max}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Minimum ($)"
                      type="number"
                      value={preferences.priceRange.min}
                      onChange={(e) => handleUpdatePreferences({
                        ...preferences,
                        priceRange: { ...preferences.priceRange, min: parseInt(e.target.value) || 0 }
                      })}
                    />
                    <Input
                      label="Maximum ($)"
                      type="number"
                      value={preferences.priceRange.max}
                      onChange={(e) => handleUpdatePreferences({
                        ...preferences,
                        priceRange: { ...preferences.priceRange, max: parseInt(e.target.value) || 500 }
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Favorite Occasions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {occasions.map((occasion) => (
                      <button
                        key={occasion}
                        onClick={() => {
                          const updatedOccasions = preferences.occasions.includes(occasion)
                            ? preferences.occasions.filter(o => o !== occasion)
                            : [...preferences.occasions, occasion];
                          handleUpdatePreferences({
                            ...preferences,
                            occasions: updatedOccasions
                          });
                        }}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          preferences.occasions.includes(occasion)
                            ? "bg-secondary-100 text-secondary-700 border-2 border-secondary-300"
                            : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {occasion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <ApperIcon name="Bell" size={20} />
                <span>Notifications</span>
              </h3>
              
              <div className="space-y-4">
                {Object.entries(preferences.notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleUpdatePreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, [key]: e.target.checked }
                      })}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            {user?.orderHistory && user.orderHistory.length > 0 ? (
              user.orderHistory.map((order) => (
                <Card key={order.Id} className="hover:shadow-card-hover transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <ApperIcon name="ShoppingBag" className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{order.giftName}</h4>
                        <p className="text-sm text-gray-600">
                          For {order.recipientName} • {format(new Date(order.date), 'MMM dd, yyyy')}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge 
                            variant={order.status === 'delivered' ? 'success' : 'outline'}
                            size="sm"
                          >
                            {order.status}
                          </Badge>
                          <span className="text-lg font-semibold text-primary-600">
                            ${order.price}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Empty
                icon="ShoppingBag"
                title="No orders yet"
                description="When you make your first gift purchase, it will appear here."
                action={
                  <Button variant="primary" onClick={() => window.location.href = "/recipients"}>
                    Find Gifts
                  </Button>
                }
              />
            )}
          </div>
        )}

        {activeTab === "social" && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center space-x-2">
                  <ApperIcon name="Users" size={20} />
                  <span>Social Connections</span>
                </h3>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowSocialModal(true)}
                >
                  <ApperIcon name="Plus" size={16} />
                  Connect Account
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Users" className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Friends</h4>
                      <p className="text-sm text-gray-600">{user?.friendCount || 0} connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Gift" className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Shared Wishlists</h4>
                      <p className="text-sm text-gray-600">{user?.wishlistCount || 0} lists</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <ApperIcon name="Shield" size={20} />
                <span>Privacy Settings</span>
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  {Object.entries(preferences.privacy).map(([key, value]) => (
                    <label key={key} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleUpdatePreferences({
                          ...preferences,
                          privacy: { ...preferences.privacy, [key]: e.target.checked }
                        })}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-1"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {key === 'shareActivity' && 'Allow friends to see your gift activities and recommendations'}
                          {key === 'publicProfile' && 'Make your profile visible to other users'}
                          {key === 'allowFriendRequests' && 'Allow other users to send you friend requests'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
                  <div className="space-y-3">
                    <Button variant="outline" icon="Download">
                      Export My Data
                    </Button>
                    <Button 
                      variant="outline" 
                      icon="Trash"
                      onClick={handleDeleteAccount}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Social Connect Modal */}
      <SocialConnectModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />
    </div>
  );
};

export default Profile;