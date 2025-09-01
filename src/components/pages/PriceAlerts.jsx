import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import AlertConfigModal from "@/components/molecules/AlertConfigModal";
import { savedGiftService } from "@/services/api/savedGiftService";
import { priceAlertService } from "@/services/api/priceAlertService";
import { giftService } from "@/services/api/giftService";
import { recipientService } from "@/services/api/recipientService";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

const PriceAlerts = () => {
  const [alerts, setAlerts] = React.useState([]);
  const [gifts, setGifts] = React.useState([]);
  const [recipients, setRecipients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterBy, setFilterBy] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("recent");
  const [selectedAlert, setSelectedAlert] = React.useState(null);
  const [showConfigModal, setShowConfigModal] = React.useState(false);
  const [globalNotificationSettings, setGlobalNotificationSettings] = React.useState({
    emailEnabled: true,
    pushEnabled: true,
    frequency: 'immediate',
    priceDropThreshold: 10,
    stockAlerts: true
  });

  React.useEffect(() => {
    loadPriceAlerts();
  }, []);

  const loadPriceAlerts = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [alertsData, giftsData, recipientsData, settingsData] = await Promise.all([
        priceAlertService.getAll(),
        giftService.getAll(),
        recipientService.getAll(),
        priceAlertService.getNotificationSettings()
      ]);
      
      setAlerts(alertsData);
      setGifts(giftsData);
      setRecipients(recipientsData);
      setGlobalNotificationSettings(settingsData);
    } catch (err) {
      setError("Failed to load price alerts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAlert = async (alertId) => {
    try {
      const updated = await priceAlertService.toggleAlert(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.Id === alertId ? updated : alert
      ));
      toast.success(
        updated.enabled 
          ? "Price alert enabled!" 
          : "Price alert disabled"
      );
    } catch (err) {
      toast.error("Failed to update alert");
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await priceAlertService.delete(alertId);
      setAlerts(prev => prev.filter(alert => alert.Id !== alertId));
      toast.success("Price alert deleted");
    } catch (err) {
      toast.error("Failed to delete alert");
    }
  };

  const handleConfigureAlert = (alert) => {
    setSelectedAlert(alert);
    setShowConfigModal(true);
  };

  const handleSaveAlertConfig = async (config) => {
    try {
      const updated = await priceAlertService.updateConfig(selectedAlert.Id, config);
      setAlerts(prev => prev.map(alert => 
        alert.Id === selectedAlert.Id ? updated : alert
      ));
      setShowConfigModal(false);
      setSelectedAlert(null);
      toast.success("Alert configuration saved!");
    } catch (err) {
      toast.error("Failed to save configuration");
    }
  };

  const handleSaveNotificationSettings = async (settings) => {
    try {
      await priceAlertService.updateNotificationSettings(settings);
      setGlobalNotificationSettings(settings);
      toast.success("Notification settings saved!");
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  const getAlertsWithDetails = () => {
    return alerts.map(alert => {
      const gift = gifts.find(g => g.Id === alert.giftId);
      const recipient = recipients.find(r => r.Id === alert.recipientId);
      return {
        ...alert,
        gift,
        recipient
      };
    }).filter(item => item.gift && item.recipient);
  };

  const filteredAndSortedAlerts = () => {
    const alertsWithDetails = getAlertsWithDetails();
    
    let filtered = alertsWithDetails.filter(alert => {
      const matchesSearch = !searchTerm || 
        alert.gift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.recipient.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === "all" || 
        (filterBy === "active" && alert.enabled) ||
        (filterBy === "triggered" && alert.lastTriggered) ||
        (filterBy === "inactive" && !alert.enabled);
      
      return matchesSearch && matchesFilter;
    });

    switch (sortBy) {
      case "recent":
return filtered.sort((a, b) => {
          const dateA = a.createdAt && typeof a.createdAt === 'string' ? parseISO(a.createdAt) : new Date();
          const dateB = b.createdAt && typeof b.createdAt === 'string' ? parseISO(b.createdAt) : new Date();
          return dateB - dateA;
        });
      case "triggered":
return filtered.sort((a, b) => {
          if (!a.lastTriggered && !b.lastTriggered) return 0;
          if (!a.lastTriggered) return 1;
          if (!b.lastTriggered) return -1;
          const dateA = a.lastTriggered && typeof a.lastTriggered === 'string' ? parseISO(a.lastTriggered) : new Date();
          const dateB = b.lastTriggered && typeof b.lastTriggered === 'string' ? parseISO(b.lastTriggered) : new Date();
          return dateB - dateA;
        });
      case "price":
        return filtered.sort((a, b) => a.gift.price - b.gift.price);
      default:
        return filtered;
    }
  };

  const getAlertStats = () => {
    const alertsWithDetails = getAlertsWithDetails();
    return {
      total: alertsWithDetails.length,
      active: alertsWithDetails.filter(a => a.enabled).length,
      triggered: alertsWithDetails.filter(a => a.lastTriggered).length,
      savings: alertsWithDetails.reduce((sum, a) => sum + (a.totalSavings || 0), 0)
    };
  };

  if (loading) return <Loading message="Loading price alerts..." />;
  if (error) return <Error message={error} onRetry={loadPriceAlerts} />;

  const stats = getAlertStats();
  const filteredAlerts = filteredAndSortedAlerts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Price Alerts</h1>
          <p className="text-gray-600 mt-2">Monitor your saved gifts for price drops and availability changes</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="primary" size="lg">
            {stats.active} active alerts
          </Badge>
          <Button variant="outline" icon="Settings" onClick={() => setShowConfigModal(true)}>
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" variant="compact">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <ApperIcon name="Bell" className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-sm text-blue-600">Total Alerts</div>
          </div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" variant="compact">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <ApperIcon name="CheckCircle" className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">{stats.active}</div>
            <div className="text-sm text-green-600">Active Alerts</div>
          </div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" variant="compact">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <ApperIcon name="TrendingDown" className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{stats.triggered}</div>
            <div className="text-sm text-amber-600">Price Drops</div>
          </div>
        </Card>

        <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200" variant="compact">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <ApperIcon name="DollarSign" className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700">${stats.savings}</div>
            <div className="text-sm text-purple-600">Total Savings</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search alerts by gift or recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/20 focus:outline-none"
            >
              <option value="all">All Alerts</option>
              <option value="active">Active Only</option>
              <option value="triggered">Recently Triggered</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/20 focus:outline-none"
            >
              <option value="recent">Recently Created</option>
              <option value="triggered">Recently Triggered</option>
              <option value="price">Price (Low to High)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Empty
          icon="Bell"
          title="No price alerts yet"
          description="Start monitoring your saved gifts for price drops and stock changes. Never miss a great deal!"
          action={
            <Button variant="primary" icon="Bookmark" onClick={() => window.location.href = "/saved"}>
              View Saved Gifts
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAlerts.map((alert) => (
            <motion.div
              key={alert.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="relative" hoverable>
                {/* Alert Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge 
                    variant={alert.enabled ? "success" : "default"} 
                    size="sm"
                  >
                    {alert.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Gift Info */}
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {alert.gift.imageUrl ? (
                        <img
                          src={alert.gift.imageUrl}
                          alt={alert.gift.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ApperIcon name="Gift" size={32} className="text-purple-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {alert.gift.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <ApperIcon name="User" size={14} />
                          <span>For {alert.recipient.name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ApperIcon name="DollarSign" size={14} />
                          <span>${alert.gift.price}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alert Configuration */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Price Drop Threshold:</span>
                      <span className="font-medium">
                        {alert.priceDropThreshold}% (${(alert.gift.price * (alert.priceDropThreshold / 100)).toFixed(2)})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stock Alerts:</span>
                      <span className="font-medium">
                        {alert.stockAlerts ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    {alert.lastTriggered && (
<div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Triggered:</span>
                        <span className="font-medium text-green-600">
                          {format(
                            alert.lastTriggered && typeof alert.lastTriggered === 'string' 
                              ? parseISO(alert.lastTriggered) 
                              : new Date(), 
                            "MMM d, yyyy"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant={alert.enabled ? "accent" : "outline"}
                      size="sm"
                      icon={alert.enabled ? "BellRing" : "Bell"}
                      onClick={() => handleToggleAlert(alert.Id)}
                      className="flex-1"
                    >
                      {alert.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon="Settings"
                      onClick={() => handleConfigureAlert(alert)}
                    >
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon="Trash2"
                      onClick={() => handleDeleteAlert(alert.Id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Alert Configuration Modal */}
      {showConfigModal && (
        <AlertConfigModal
          alert={selectedAlert}
          globalSettings={globalNotificationSettings}
          onSave={selectedAlert ? handleSaveAlertConfig : handleSaveNotificationSettings}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedAlert(null);
          }}
        />
      )}
    </div>
  );
};

export default PriceAlerts;