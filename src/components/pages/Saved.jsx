import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import GiftCard from "@/components/molecules/GiftCard";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { savedGiftService } from "@/services/api/savedGiftService";
import { giftService } from "@/services/api/giftService";
import { recipientService } from "@/services/api/recipientService";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import AlertConfigModal from "@/components/molecules/AlertConfigModal";

const Saved = () => {
const [savedGifts, setSavedGifts] = React.useState([]);
  const [gifts, setGifts] = React.useState([]);
  const [recipients, setRecipients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState("recent");
  const [filterBy, setFilterBy] = React.useState("all");
  const [selectedSavedGift, setSelectedSavedGift] = React.useState(null);
  const [showAlertConfig, setShowAlertConfig] = React.useState(false);
  React.useEffect(() => {
    loadSavedGifts();
  }, []);

  const loadSavedGifts = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [savedData, giftsData, recipientsData] = await Promise.all([
        savedGiftService.getAll(),
        giftService.getAll(),
        recipientService.getAll()
      ]);
      
      setSavedGifts(savedData);
      setGifts(giftsData);
      setRecipients(recipientsData);
    } catch (err) {
      setError("Failed to load saved gifts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveGift = async (savedGift) => {
    try {
      await savedGiftService.delete(savedGift.Id);
      setSavedGifts(prev => prev.filter(sg => sg.Id !== savedGift.Id));
      toast.success("Gift removed from saved list");
    } catch (err) {
      toast.error("Failed to remove gift. Please try again.");
    }
  };

const handleBuyGift = async (gift) => {
    try {
      const { ecommerceService } = await import('@/services/api/ecommerceService');
      const purchaseUrl = await ecommerceService.getPurchaseUrl(gift);
      
      if (purchaseUrl) {
        window.open(purchaseUrl, '_blank');
        toast.success(`Opening ${gift.title} in store...`);
        
        // Track purchase attempt
        const { giftService } = await import('@/services/api/giftService');
        await giftService.trackUserInteraction('purchase_attempt', gift);
      } else {
        toast.warning('Purchase link not available for this item');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Unable to open purchase link');
    }
  };

const handlePriceAlertToggle = async (savedGift) => {
    if (!savedGift.priceAlert) {
      // Open configuration modal for new alerts
      setSelectedSavedGift(savedGift);
      setShowAlertConfig(true);
    } else {
      // Simple toggle for existing alerts
      try {
        const updated = await savedGiftService.update(savedGift.Id, {
          ...savedGift,
          priceAlert: false
        });
        
        setSavedGifts(prev => prev.map(sg => 
          sg.Id === savedGift.Id ? updated : sg
        ));
        
        toast.success("Price alert disabled");
      } catch (err) {
        toast.error("Failed to update price alert");
      }
    }
  };

  const handleSaveAlertConfig = async (config) => {
    try {
      await savedGiftService.createPriceAlert(selectedSavedGift.Id, config);
      
      const updated = await savedGiftService.update(selectedSavedGift.Id, {
        ...selectedSavedGift,
        priceAlert: true
      });
      
      setSavedGifts(prev => prev.map(sg => 
        sg.Id === selectedSavedGift.Id ? updated : sg
      ));
      
      setShowAlertConfig(false);
      setSelectedSavedGift(null);
      toast.success("Price alert configured and enabled!");
    } catch (err) {
      toast.error("Failed to configure price alert");
    }
  };

  const getSavedGiftsWithDetails = () => {
    return savedGifts.map(savedGift => {
      const gift = gifts.find(g => g.Id === savedGift.giftId);
      const recipient = recipients.find(r => r.Id === savedGift.recipientId);
      return {
        ...savedGift,
        gift,
        recipient
      };
    }).filter(item => item.gift && item.recipient);
  };

  const filteredAndSortedGifts = React.useMemo(() => {
    let filtered = getSavedGiftsWithDetails();

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.gift.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gift.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== "all") {
      filtered = filtered.filter(item => item.gift.category === filterBy);
    }

    // Sort
    switch (sortBy) {
      case "recent":
return filtered.sort((a, b) => {
          const dateA = a.savedDate && typeof a.savedDate === 'string' ? parseISO(a.savedDate) : new Date();
          const dateB = b.savedDate && typeof b.savedDate === 'string' ? parseISO(b.savedDate) : new Date();
          return dateB - dateA;
        });
      case "price-low":
        return filtered.sort((a, b) => a.gift.price - b.gift.price);
      case "price-high":
        return filtered.sort((a, b) => b.gift.price - a.gift.price);
      case "match":
        return filtered.sort((a, b) => b.gift.matchScore - a.gift.matchScore);
      case "recipient":
        return filtered.sort((a, b) => a.recipient.name.localeCompare(b.recipient.name));
      default:
        return filtered;
    }
  }, [savedGifts, gifts, recipients, searchTerm, sortBy, filterBy]);

  const getUniqueCategories = () => {
    const categories = new Set(gifts.map(g => g.category));
    return Array.from(categories).sort();
  };

  const sortOptions = [
    { value: "recent", label: "Recently Saved", icon: "Clock" },
    { value: "price-low", label: "Price: Low to High", icon: "ArrowUp" },
    { value: "price-high", label: "Price: High to Low", icon: "ArrowDown" },
    { value: "match", label: "Best Match", icon: "Target" },
    { value: "recipient", label: "Recipient Name", icon: "User" }
  ];

  if (loading) return <Loading message="Loading your saved gifts..." />;
  if (error) return <Error message={error} onRetry={loadSavedGifts} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Saved Gifts
          </h1>
          <p className="text-gray-600 mt-1">
            Your collection of perfect gift ideas
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="primary" size="lg">
            {filteredAndSortedGifts.length} saved
          </Badge>
          {savedGifts.filter(sg => sg.priceAlert).length > 0 && (
            <Badge variant="accent" size="lg">
              {savedGifts.filter(sg => sg.priceAlert).length} price alerts
            </Badge>
          )}
        </div>
      </div>

      {savedGifts.length > 0 && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search saved gifts..."
                onSearch={setSearchTerm}
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Category:</span>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-secondary-400 focus:ring-1 focus:ring-secondary-400 focus:outline-none"
                >
<option value="all">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-secondary-400 focus:ring-1 focus:ring-secondary-400 focus:outline-none"
                >
{sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200" variant="compact">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <ApperIcon name="Bookmark" className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-700">{savedGifts.length}</div>
                <div className="text-sm text-purple-600">Total Saved</div>
              </div>
            </Card>

            <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" variant="compact">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <ApperIcon name="DollarSign" className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700">
                  ${Math.round(getSavedGiftsWithDetails().reduce((total, item) => total + item.gift.price, 0))}
                </div>
                <div className="text-sm text-green-600">Total Value</div>
              </div>
            </Card>

            <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" variant="compact">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <ApperIcon name="Users" className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {new Set(savedGifts.map(sg => sg.recipientId)).size}
                </div>
                <div className="text-sm text-blue-600">Recipients</div>
              </div>
            </Card>

            <Card className="text-center bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" variant="compact">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <ApperIcon name="Bell" className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-amber-700">
                  {savedGifts.filter(sg => sg.priceAlert).length}
                </div>
                <div className="text-sm text-amber-600">Price Alerts</div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Saved Gifts Grid */}
      {filteredAndSortedGifts.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredAndSortedGifts.map((savedItem, index) => (
            <motion.div
              key={savedItem.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative"
            >
              {/* Saved Info Banner */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-t-card flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <ApperIcon name="User" size={12} />
                  <span>For {savedItem.recipient.name}</span>
                </span>
<span>
                  {format(
                    savedItem.savedDate && typeof savedItem.savedDate === 'string' 
                      ? parseISO(savedItem.savedDate) 
                      : new Date(), 
                    "MMM d"
                  )}
                </span>
              </div>
              
              <div className="pt-6">
                <GiftCard
                  gift={savedItem.gift}
                  onSave={() => handleUnsaveGift(savedItem)}
                  onBuy={handleBuyGift}
                />
              </div>

              {/* Additional Actions */}
              <div className="mt-3 flex gap-2">
                <Button
                  variant={savedItem.priceAlert ? "accent" : "outline"}
                  size="sm"
                  icon={savedItem.priceAlert ? "BellRing" : "Bell"}
                  onClick={() => handlePriceAlertToggle(savedItem)}
                  className="flex-1"
                >
                  {savedItem.priceAlert ? "Alert On" : "Price Alert"}
                </Button>
                
                {savedItem.notes && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="StickyNote"
                    title={savedItem.notes}
                  >
                    Note
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : savedGifts.length > 0 ? (
        <Empty
          icon="Search"
          title="No matching saved gifts"
          description={`No saved gifts match your search "${searchTerm}" or selected filters.`}
          action={
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setFilterBy("all");
            }}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <Empty
          icon="Bookmark"
          title="No saved gifts yet"
          description="Start exploring gift recommendations and save your favorites for later. Perfect gifts are just a click away!"
          action={
            <Button variant="primary" icon="Sparkles" onClick={() => window.location.href = "/recipients"}>
              Find Gifts to Save
            </Button>
          }
        />
      )}
{/* Alert Configuration Modal */}
      {showAlertConfig && selectedSavedGift && (
        <AlertConfigModal
          alert={{
            ...selectedSavedGift,
            gift: selectedSavedGift.gift,
            recipient: selectedSavedGift.recipient
          }}
          onSave={handleSaveAlertConfig}
          onClose={() => {
            setShowAlertConfig(false);
            setSelectedSavedGift(null);
          }}
        />
      )}
    </div>
  );
};

export default Saved;