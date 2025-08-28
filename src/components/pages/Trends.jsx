import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import GiftCard from '@/components/molecules/GiftCard';
import { giftService } from '@/services/api/giftService';
import { toast } from 'react-toastify';

const Trends = () => {
  const [trendingGifts, setTrendingGifts] = useState([]);
  const [trendCategories, setTrendCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [selectedDemographic, setSelectedDemographic] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  const occasions = [
    { value: 'all', label: 'All Occasions' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'graduation', label: 'Graduation' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'holiday', label: 'Holiday' }
  ];

  const demographics = [
    { value: 'all', label: 'All Demographics' },
    { value: 'teen', label: 'Teens (13-17)' },
    { value: 'young-adult', label: 'Young Adults (18-29)' },
    { value: 'adult', label: 'Adults (30-49)' },
    { value: 'senior', label: 'Seniors (50+)' },
    { value: 'family', label: 'Families' }
  ];

  useEffect(() => {
    loadTrendingData();
  }, [selectedOccasion, selectedDemographic, sortBy]);

  const loadTrendingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [gifts, categories] = await Promise.all([
        giftService.getTrendingGifts({
          occasion: selectedOccasion,
          demographic: selectedDemographic,
          sortBy
        }),
        giftService.getTrendingCategories()
      ]);
      
      setTrendingGifts(gifts);
      setTrendCategories(categories);
    } catch (err) {
      setError('Failed to load trending data');
      toast.error('Failed to load trending gifts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSaveGift = async (gift) => {
    try {
      // In a real app, this would save to user's saved gifts
      toast.success(`${gift.title} saved to your favorites!`);
    } catch (error) {
      toast.error('Failed to save gift');
    }
  };

  const handleBuyGift = (gift) => {
    if (gift.purchaseUrl) {
      window.open(gift.purchaseUrl, '_blank');
      toast.info('Redirecting to purchase...');
    } else {
      toast.warning('Purchase link not available');
    }
  };

  const filteredGifts = trendingGifts.filter(gift =>
    gift.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gift.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTrendingData} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-2">
          <ApperIcon name="TrendingUp" size={32} className="text-primary-500" />
          <h1 className="text-4xl font-bold gradient-text">Trending Gifts</h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover what's popular right now - trending gifts for every occasion and recipient
        </p>
      </motion.div>

      {/* Trending Categories Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
            <ApperIcon name="BarChart3" size={20} />
            <span>Popular Categories This Week</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendCategories.map((category, index) => (
              <div
                key={category.name}
                className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-md transition-all duration-200"
              >
                <div className="text-2xl font-bold gradient-text">
                  {category.growthPercentage > 0 ? '+' : ''}{category.growthPercentage}%
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {category.name}
                </div>
                <div className="text-xs text-gray-500">
                  {category.itemCount} items
                </div>
                <Badge 
                  variant={category.growthPercentage > 20 ? 'success' : category.growthPercentage > 0 ? 'accent' : 'default'}
                  size="sm"
                  className="mt-2"
                >
                  {category.growthPercentage > 20 ? 'Hot' : category.growthPercentage > 0 ? 'Rising' : 'Stable'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <ApperIcon name="Filter" size={20} />
              <span>Filter Trends</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <Input
                  placeholder="Search trending gifts..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  icon="Search"
                />
              </div>

              {/* Occasion Filter */}
              <div>
                <select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                >
                  {occasions.map(occasion => (
                    <option key={occasion.value} value={occasion.value}>
                      {occasion.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Demographic Filter */}
              <div>
                <select
                  value={selectedDemographic}
                  onChange={(e) => setSelectedDemographic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                >
                  {demographics.map(demo => (
                    <option key={demo.value} value={demo.value}>
                      {demo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                >
                  <option value="trending">Most Trending</option>
                  <option value="popular">Most Popular</option>
                  <option value="recent">Recently Added</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            Trending Now 
            <span className="text-gray-500 text-base ml-2 font-normal">
              ({filteredGifts.length} gifts found)
            </span>
          </h2>
          
          {/* View Toggle */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <ApperIcon name="Grid3X3" size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <ApperIcon name="List" size={16} />
            </Button>
          </div>
        </div>

        {filteredGifts.length === 0 ? (
          <Empty 
            message="No trending gifts found"
            description="Try adjusting your filters or search terms"
            icon="TrendingUp"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGifts.map((gift, index) => (
              <motion.div
                key={gift.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <GiftCard
                  gift={gift}
                  onSave={handleSaveGift}
                  onBuy={handleBuyGift}
                  showTrending={true}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Load More */}
      {filteredGifts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-8"
        >
          <Button variant="outline" size="lg">
            <ApperIcon name="RefreshCw" size={16} />
            Load More Trending Gifts
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Trends;