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
import SearchBar from '@/components/molecules/SearchBar';
import { ecommerceService } from '@/services/api/ecommerceService';
import { toast } from 'react-toastify';

const EcommerceStores = () => {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStore || searchQuery) {
      loadProducts();
    }
  }, [selectedStore, searchQuery, selectedCategory, priceRange]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const storeData = await ecommerceService.getAllStores();
      setStores(storeData);
    } catch (err) {
      setError('Failed to load stores');
      console.error('Error loading stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productData = await ecommerceService.searchProducts({
        store: selectedStore?.id,
        query: searchQuery,
        category: selectedCategory,
        priceMin: priceRange.min ? parseFloat(priceRange.min) : undefined,
        priceMax: priceRange.max ? parseFloat(priceRange.max) : undefined
      });
      setProducts(productData);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setProducts([]);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePurchase = async (product) => {
    try {
      const purchaseUrl = await ecommerceService.getPurchaseUrl(product);
      if (purchaseUrl) {
        window.open(purchaseUrl, '_blank');
        toast.success(`Opening ${product.title} in ${product.storeName}...`);
      } else {
        toast.error('Purchase link not available');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Unable to open purchase link');
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'fashion', name: 'Fashion & Style' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'books', name: 'Books & Media' },
    { id: 'toys', name: 'Toys & Games' },
    { id: 'beauty', name: 'Beauty & Health' },
    { id: 'sports', name: 'Sports & Outdoors' }
  ];

  if (loading && stores.length === 0) return <Loading />;
  if (error && stores.length === 0) return <Error message={error} onRetry={loadStores} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            E-commerce Stores
          </h1>
          <p className="text-gray-600">
            Browse and shop from your favorite online stores in one place
          </p>
        </div>
      </div>

      {/* Store Selection */}
      {!selectedStore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Choose Your Store
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => (
                <motion.div
                  key={store.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer border-2 hover:border-primary-300 transition-colors"
                    onClick={() => handleStoreSelect(store)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                        <ApperIcon name={store.icon} size={24} className="text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{store.name}</h3>
                        <p className="text-sm text-gray-600">{store.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" size="sm">
                            {store.categories.length} categories
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {store.productCount}+ items
                          </Badge>
                        </div>
                      </div>
                      <ApperIcon name="ChevronRight" size={20} className="text-gray-400" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Store Products View */}
      {selectedStore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Back Button & Store Header */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              icon="ArrowLeft"
              onClick={() => {
                setSelectedStore(null);
                setProducts([]);
                setSearchQuery('');
              }}
            >
              Back to Stores
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                <ApperIcon name={selectedStore.icon} size={20} className="text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedStore.name}</h2>
                <p className="text-sm text-gray-600">{selectedStore.description}</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card>
            <div className="space-y-4">
              <SearchBar
                placeholder={`Search products in ${selectedStore.name}...`}
                onSearch={handleSearch}
                className="w-full"
              />
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Price:</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-20 text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-20 text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Products Grid */}
          {loading && <Loading />}
          {error && <Error message={error} onRetry={loadProducts} />}
          
          {!loading && !error && products.length === 0 && (
            <Empty
              icon="Search"
              title="No products found"
              description="Try adjusting your search criteria or browse different categories"
            />
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden group" hoverable>
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-card mb-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover rounded-t-card"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ApperIcon name="Package" size={48} className="text-gray-400" />
                        </div>
                      )}
                      
                      {/* Store Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm">
                          {product.storeName}
                        </Badge>
                      </div>

                      {/* Sale Badge */}
                      {product.onSale && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="accent" size="sm">
                            Sale
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                          {product.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold gradient-text">
                              ${product.price}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                          {product.rating && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Star" size={12} className="text-amber-400 fill-current" />
                              <span className="text-sm text-gray-600">{product.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" size="sm">
                          {product.category}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePurchase(product)}
                          className="w-full"
                          icon="ExternalLink"
                        >
                          Buy Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Add to saved/wishlist functionality
                            toast.success('Added to saved items!');
                          }}
                          className="w-full"
                          icon="Bookmark"
                        >
                          Save for Later
                        </Button>
                      </div>

                      {/* Shipping Info */}
                      {product.shipping && (
                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="Truck" size={12} />
                            <span>{product.shipping}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EcommerceStores;