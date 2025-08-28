class EcommerceService {
  constructor() {
    this.stores = [
      {
        id: 'amazon',
        name: 'Amazon',
        description: 'Everything from A to Z',
        icon: 'Package',
        categories: ['electronics', 'home', 'books', 'fashion', 'toys', 'beauty', 'sports'],
        productCount: 1000000,
        searchEndpoint: 'https://www.amazon.com/s?k=',
        affiliateId: 'giftgenius-20'
      },
      {
        id: 'etsy',
        name: 'Etsy',
        description: 'Handmade and vintage items',
        icon: 'Heart',
        categories: ['fashion', 'home', 'jewelry', 'art', 'crafts'],
        productCount: 90000000,
        searchEndpoint: 'https://www.etsy.com/search?q=',
        affiliateId: 'giftgenius'
      },
      {
        id: 'target',
        name: 'Target',
        description: 'Expect More. Pay Less.',
        icon: 'Target',
        categories: ['home', 'fashion', 'beauty', 'electronics', 'toys'],
        productCount: 500000,
        searchEndpoint: 'https://www.target.com/s?searchTerm=',
        affiliateId: 'giftgenius'
      },
      {
        id: 'walmart',
        name: 'Walmart',
        description: 'Save Money. Live Better.',
        icon: 'ShoppingCart',
        categories: ['electronics', 'home', 'fashion', 'grocery', 'toys'],
        productCount: 750000,
        searchEndpoint: 'https://www.walmart.com/search?query=',
        affiliateId: 'giftgenius'
      },
      {
        id: 'bestbuy',
        name: 'Best Buy',
        description: 'Electronics & Technology',
        icon: 'Smartphone',
        categories: ['electronics', 'gaming', 'home', 'appliances'],
        productCount: 100000,
        searchEndpoint: 'https://www.bestbuy.com/site/searchpage.jsp?st=',
        affiliateId: 'giftgenius'
      },
      {
        id: 'wayfair',
        name: 'Wayfair',
        description: 'Home goods & furniture',
        icon: 'Home',
        categories: ['home', 'furniture', 'decor', 'garden'],
        productCount: 350000,
        searchEndpoint: 'https://www.wayfair.com/keyword.php?keyword=',
        affiliateId: 'giftgenius'
      }
    ];

    // Mock product data for demonstration
    this.mockProducts = [
      {
        id: 'prod_1',
        title: 'Wireless Bluetooth Headphones',
        price: 79.99,
        originalPrice: 99.99,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        category: 'electronics',
        storeName: 'Amazon',
        storeId: 'amazon',
        rating: 4.5,
        onSale: true,
        shipping: 'Free 2-day shipping',
        purchaseUrl: 'https://amazon.com/dp/example'
      },
      {
        id: 'prod_2',
        title: 'Handmade Ceramic Mug Set',
        price: 45.00,
        imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300',
        category: 'home',
        storeName: 'Etsy',
        storeId: 'etsy',
        rating: 4.8,
        shipping: '3-5 business days',
        purchaseUrl: 'https://etsy.com/listing/example'
      },
      {
        id: 'prod_3',
        title: 'Organic Cotton T-Shirt',
        price: 24.99,
        originalPrice: 34.99,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
        category: 'fashion',
        storeName: 'Target',
        storeId: 'target',
        rating: 4.2,
        onSale: true,
        shipping: 'Free store pickup',
        purchaseUrl: 'https://target.com/p/example'
      },
      {
        id: 'prod_4',
        title: 'Smart Home Security Camera',
        price: 129.99,
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=300',
        category: 'electronics',
        storeName: 'Best Buy',
        storeId: 'bestbuy',
        rating: 4.6,
        shipping: 'Free shipping on orders $35+',
        purchaseUrl: 'https://bestbuy.com/site/example'
      },
      {
        id: 'prod_5',
        title: 'Modern Table Lamp',
        price: 89.99,
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
        category: 'home',
        storeName: 'Wayfair',
        storeId: 'wayfair',
        rating: 4.4,
        shipping: 'Free shipping over $35',
        purchaseUrl: 'https://wayfair.com/example'
      },
      {
        id: 'prod_6',
        title: 'Yoga Mat with Carrying Strap',
        price: 39.99,
        originalPrice: 49.99,
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300',
        category: 'sports',
        storeName: 'Walmart',
        storeId: 'walmart',
        rating: 4.3,
        onSale: true,
        shipping: 'Free 2-day shipping',
        purchaseUrl: 'https://walmart.com/ip/example'
      }
    ];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAllStores() {
    await this.delay(300);
    return [...this.stores];
  }

  async getStoreById(storeId) {
    await this.delay(200);
    return this.stores.find(store => store.id === storeId);
  }

  async searchProducts({ store, query, category, priceMin, priceMax } = {}) {
    await this.delay(500);
    
    let filteredProducts = [...this.mockProducts];

    // Filter by store
    if (store) {
      filteredProducts = filteredProducts.filter(product => product.storeId === store);
    }

    // Filter by search query
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }

    // Filter by price range
    if (priceMin !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price >= priceMin);
    }
    if (priceMax !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price <= priceMax);
    }

    return filteredProducts;
  }

  async getPurchaseUrl(productOrGift) {
    await this.delay(200);
    
    // If it's already a product with a purchase URL
    if (productOrGift.purchaseUrl) {
      return productOrGift.purchaseUrl;
    }

    // If it's a gift, try to find the best purchase URL
    if (productOrGift.title) {
      const searchResults = await this.searchProducts({ 
        query: productOrGift.title,
        priceMax: (productOrGift.price || 0) * 1.2 // Allow 20% price variance
      });

      if (searchResults.length > 0) {
        // Return the best match (first result for now)
        return searchResults[0].purchaseUrl;
      }
    }

    // Fallback: construct search URLs for major stores
    const searchQuery = encodeURIComponent(productOrGift.title || productOrGift.name || '');
    const defaultStore = this.stores[0]; // Amazon as default
    return `${defaultStore.searchEndpoint}${searchQuery}&tag=${defaultStore.affiliateId}`;
  }

  async getStoreAvailability(gift) {
    await this.delay(300);
    
    const availability = [];
    const searchQuery = gift.title || gift.name || '';

    for (const store of this.stores) {
      // Simulate checking product availability in each store
      const isAvailable = Math.random() > 0.3; // 70% chance of availability
      const price = gift.price ? gift.price * (0.9 + Math.random() * 0.2) : Math.random() * 100 + 10;

      if (isAvailable) {
        availability.push({
          storeId: store.id,
          storeName: store.name,
          storeIcon: store.icon,
          price: Math.round(price * 100) / 100,
          available: true,
          shipping: this.getRandomShipping(),
          purchaseUrl: `${store.searchEndpoint}${encodeURIComponent(searchQuery)}&tag=${store.affiliateId}`
        });
      }
    }

    // Sort by price (lowest first)
    return availability.sort((a, b) => a.price - b.price);
  }

  getRandomShipping() {
    const shippingOptions = [
      'Free 2-day shipping',
      'Free shipping over $35',
      'Free store pickup',
      '3-5 business days',
      'Next day delivery available',
      'Free shipping on orders $25+'
    ];
    return shippingOptions[Math.floor(Math.random() * shippingOptions.length)];
  }

  async getProductsByCategory(category, limit = 20) {
    await this.delay(400);
    return this.searchProducts({ category, limit });
  }

  async getFeaturedDeals(limit = 10) {
    await this.delay(350);
    const deals = this.mockProducts
      .filter(product => product.onSale)
      .slice(0, limit);
    return deals;
  }

  async getStoreRecommendations(userPreferences = {}) {
    await this.delay(250);
    
    // Simple recommendation based on user preferences
    let recommendedStores = [...this.stores];
    
    if (userPreferences.categories && userPreferences.categories.length > 0) {
      recommendedStores = recommendedStores.filter(store =>
        store.categories.some(cat => userPreferences.categories.includes(cat))
      );
    }

    return recommendedStores.slice(0, 6);
  }
}

// Create singleton instance
export const ecommerceService = new EcommerceService();