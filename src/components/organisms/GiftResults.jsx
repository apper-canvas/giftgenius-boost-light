import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { giftService } from "@/services/api/giftService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import FilterPanel from "@/components/molecules/FilterPanel";
import GiftCard from "@/components/molecules/GiftCard";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Recipients from "@/components/pages/Recipients";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const GiftResults = ({ recipient, occasion, onBack }) => {
  const [gifts, setGifts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState("match");
  
const [filters, setFilters] = React.useState({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    maxDeliveryDays: 7,
    ecoFriendly: false
  });

  const sortOptions = [
    { value: "match", label: "Best Match", icon: "Target" },
    { value: "price-low", label: "Price: Low to High", icon: "ArrowUp" },
    { value: "price-high", label: "Price: High to Low", icon: "ArrowDown" },
    { value: "delivery", label: "Fastest Delivery", icon: "Zap" }
  ];

  React.useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const data = await giftService.getRecommendations({
        recipientId: recipient.Id,
        occasionId: occasion.Id,
        budget: occasion.budget,
        interests: recipient.interests
      });
      
      setGifts(data);
    } catch (err) {
      setError("Failed to load gift recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGift = async (gift) => {
    try {
      toast.success(`${gift.title} saved to your list!`);
    } catch (err) {
      toast.error("Failed to save gift. Please try again.");
    }
  };

const handleBuyGift = async (gift) => {
    try {
      const { ecommerceService } = await import('@/services/api/ecommerceService');
      const purchaseUrl = await ecommerceService.getPurchaseUrl(gift);
      
      if (purchaseUrl) {
        window.open(purchaseUrl, '_blank');
        toast.success(`Opening ${gift.title} in your preferred store...`);
        
        // Track successful purchase redirect
        const { giftService } = await import('@/services/api/giftService');
        await giftService.trackUserInteraction('purchase_redirect', gift);
      } else {
        toast.warning('Purchase link not available for this item');
      }
    } catch (error) {
      console.error('Purchase redirect error:', error);
      toast.error('Unable to open purchase link');
    }
  };

  const filteredAndSortedGifts = React.useMemo(() => {
    let filtered = gifts.filter(gift => {
      // Search filter
      if (searchTerm && !gift.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(gift.category)) {
        return false;
      }
      
      // Price filter
      if (gift.price < filters.priceRange.min || gift.price > filters.priceRange.max) {
        return false;
      }
      
      // Delivery filter
// Delivery filter
      if (gift.deliveryDays > filters.maxDeliveryDays) {
        return false;
      }
      
// Eco-friendly filter
      if (filters.ecoFriendly) {
        const ecoFriendlyTags = ['eco-friendly', 'organic', 'sustainable', 'bamboo'];
        const hasEcoFriendlyTag = gift.tags && gift.tags.some(tag => 
          ecoFriendlyTags.some(ecoTag => tag.toLowerCase().includes(ecoTag))
        );
        if (!hasEcoFriendlyTag) {
          return false;
        }
      }
      
      return true;
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        return filtered.sort((a, b) => a.price - b.price);
      case "price-high":
        return filtered.sort((a, b) => b.price - a.price);
      case "delivery":
        return filtered.sort((a, b) => a.deliveryDays - b.deliveryDays);
      case "match":
      default:
        return filtered.sort((a, b) => b.matchScore - a.matchScore);
    }
  }, [gifts, searchTerm, filters, sortBy]);

  const resetFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: 0, max: 1000 },
      maxDeliveryDays: 7,
      ecoFriendly: false
    });
    setSearchTerm("");
    setSortBy("match");
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadGifts} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" icon="ArrowLeft" onClick={onBack}>
            Back to Recipients
          </Button>
          <h1 className="text-3xl font-display font-bold text-gray-900 mt-2">
            Perfect Gifts for {recipient.name}
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered recommendations for their {occasion.type}
</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="accent" size="lg">
            {filteredAndSortedGifts.length} suggestions
          </Badge>
          {occasion.budget && (
            <Badge variant="success" size="lg">
              Budget: ${occasion.budget}
            </Badge>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            icon="Users2"
            onClick={() => window.location.href = `/group-gifts?recipient=${recipient.Id}&occasion=${occasion.Id}`}
          >
            Create Group Gift
          </Button>
        </div>
      </div>

      {/* Recipient Info Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {recipient.name[0]}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {recipient.name} • {recipient.age} years old
            </h3>
            <p className="text-gray-600">
              {recipient.relationship} • {occasion.type}
            </p>
            {recipient.interests && (
              <div className="flex flex-wrap gap-2 mt-2">
                {recipient.interests.slice(0, 5).map((interest, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search gifts..."
                onSearch={setSearchTerm}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-secondary-400 focus:ring-1 focus:ring-secondary-400 focus:outline-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          {filteredAndSortedGifts.length === 0 ? (
            <Empty
              title="No gifts match your criteria"
              description="Try adjusting your filters or search terms to see more recommendations."
              action={
                <Button variant="outline" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              }
            />
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredAndSortedGifts.map((gift, index) => (
                <motion.div
                  key={gift.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
<GiftCard
                    gift={gift}
                    onSave={handleSaveGift}
                    onBuy={handleBuyGift}
                    onViewInstructions={(gift) => window.location.href = `/diy-instructions/${gift.Id}`}
                    onCreateGroupGift={() => window.location.href = `/group-gifts?recipient=${recipient.Id}&gift=${gift.Id}`}
                    recipient={recipient}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftResults;