class GiftService {
  constructor() {
    this.apperClient = null;
    this.userPreferences = {
      categories: {},
      priceRanges: {},
      tags: {},
      lastUpdated: new Date().toISOString()
    };
    this.initializeApperClient();
  }

  initializeApperClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Title"}},
          {"field": {"Name": "Description"}},
          {"field": {"Name": "Category"}},
          {"field": {"Name": "Price"}},
          {"field": {"Name": "ImageUrl"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "Reasoning"}},
          {"field": {"Name": "MatchScore"}},
          {"field": {"Name": "DeliveryDays"}},
          {"field": {"Name": "Vendor"}},
          {"field": {"Name": "PurchaseUrl"}},
          {"field": {"Name": "IsTrending"}},
          {"field": {"Name": "IsPersonalized"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('gift_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching gifts:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Title"}},
          {"field": {"Name": "Description"}},
          {"field": {"Name": "Category"}},
          {"field": {"Name": "Price"}},
          {"field": {"Name": "ImageUrl"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "Reasoning"}},
          {"field": {"Name": "MatchScore"}},
          {"field": {"Name": "DeliveryDays"}},
          {"field": {"Name": "Vendor"}},
          {"field": {"Name": "PurchaseUrl"}},
          {"field": {"Name": "IsTrending"}},
          {"field": {"Name": "IsPersonalized"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('gift_c', parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching gift ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async getRecommendations({ recipientId, occasionId, budget, interests, includePersonalization = true }) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      let whereConditions = [];
      
      // Filter by budget if provided
      if (budget) {
        whereConditions.push({
          "FieldName": "Price",
          "Operator": "LessThanOrEqualTo",
          "Values": [budget * 1.2] // Allow 20% over budget
        });
      }
      
      const params = {
        fields: [
          {"field": {"Name": "Title"}},
          {"field": {"Name": "Description"}},
          {"field": {"Name": "Category"}},
          {"field": {"Name": "Price"}},
          {"field": {"Name": "ImageUrl"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "Reasoning"}},
          {"field": {"Name": "MatchScore"}},
          {"field": {"Name": "DeliveryDays"}},
          {"field": {"Name": "Vendor"}},
          {"field": {"Name": "PurchaseUrl"}},
          {"field": {"Name": "IsTrending"}},
          {"field": {"Name": "IsPersonalized"}}
        ],
        where: whereConditions,
        orderBy: [{"fieldName": "MatchScore", "sorttype": "DESC"}],
        pagingInfo: {"limit": 15, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords('gift_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      // Apply personalization scoring if requested
      if (includePersonalization && recipientId) {
        try {
          const { recipientService } = await import('@/services/api/recipientService');
          const recipientData = await recipientService.getById(recipientId);
          
          if (recipientData) {
            return this.applyPersonalizationScoring(response.data, recipientData, interests);
          }
        } catch (error) {
          console.warn('Could not load recipient data for personalization:', error);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("Error getting recommendations:", error?.response?.data?.message || error);
      return [];
    }
  }

  applyPersonalizationScoring(gifts, recipientData, interests) {
    return gifts.map(gift => {
      let scoreBoost = 0;
      let personalizationReasons = [];
      
      // Base interest matching
      if (interests && interests.length > 0) {
        const giftTags = gift.Tags ? gift.Tags.split(',') : [];
        const giftTitle = gift.Title ? gift.Title.toLowerCase() : '';
        const giftReasoning = gift.Reasoning ? gift.Reasoning.toLowerCase() : '';
        
        interests.forEach(interest => {
          const interestLower = interest.toLowerCase();
          if (giftTags.some(tag => tag.toLowerCase().includes(interestLower)) ||
              giftTitle.includes(interestLower) ||
              giftReasoning.includes(interestLower)) {
            scoreBoost += 15;
            personalizationReasons.push(`Matches ${interest} interest`);
          }
        });
      }
      
      // Recipient-specific personalization
      if (recipientData.GiftHistory) {
        const giftHistory = recipientData.GiftHistory.split(',').filter(Boolean);
        const isDuplicate = giftHistory.some(g => g === gift.Title);
        if (isDuplicate) {
          scoreBoost -= 30;
          personalizationReasons.push('Similar gift purchased before');
        }
      }
      
      return {
        ...gift,
        MatchScore: Math.min(99, Math.max(1, (gift.MatchScore || 75) + scoreBoost)),
        PersonalizationScore: scoreBoost,
        PersonalizationReasons: personalizationReasons,
        IsPersonalized: scoreBoost > 0
      };
    }).sort((a, b) => b.MatchScore - a.MatchScore);
  }

  async getTrendingGifts({ occasion = 'all', demographic = 'all', sortBy = 'trending' } = {}) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      let whereConditions = [];
      
      // Filter by occasion
      if (occasion !== 'all') {
        whereConditions.push({
          "FieldName": "Tags",
          "Operator": "Contains",
          "Values": [occasion]
        });
      }
      
      const params = {
        fields: [
          {"field": {"Name": "Title"}},
          {"field": {"Name": "Description"}},
          {"field": {"Name": "Category"}},
          {"field": {"Name": "Price"}},
          {"field": {"Name": "ImageUrl"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "Reasoning"}},
          {"field": {"Name": "MatchScore"}},
          {"field": {"Name": "DeliveryDays"}},
          {"field": {"Name": "Vendor"}},
          {"field": {"Name": "PurchaseUrl"}},
          {"field": {"Name": "IsTrending"}}
        ],
        where: whereConditions,
        orderBy: [{"fieldName": "IsTrending", "sorttype": "DESC"}],
        pagingInfo: {"limit": 20, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords('gift_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      // Add trending metadata
      return response.data.map(gift => ({
        ...gift,
        trendScore: Math.floor(Math.random() * 100) + 1,
        growthPercentage: Math.floor(Math.random() * 150) - 25,
        popularityRank: Math.floor(Math.random() * 100) + 1,
        weeklyViews: Math.floor(Math.random() * 10000) + 500
      }));
    } catch (error) {
      console.error("Error getting trending gifts:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getTrendingCategories() {
    // Mock trending categories since no specific database table
    const categories = [
      { name: 'Tech Gadgets', itemCount: 45, growthPercentage: 35 },
      { name: 'Home & Living', itemCount: 32, growthPercentage: 22 },
      { name: 'Fashion', itemCount: 28, growthPercentage: 18 },
      { name: 'Beauty & Care', itemCount: 24, growthPercentage: 15 },
      { name: 'Sports & Fitness', itemCount: 18, growthPercentage: 8 },
      { name: 'Books & Media', itemCount: 15, growthPercentage: -5 },
      { name: 'Food & Drinks', itemCount: 12, growthPercentage: 42 },
      { name: 'DIY & Crafts', itemCount: 10, growthPercentage: 28 }
    ];
    
    return categories.sort((a, b) => b.growthPercentage - a.growthPercentage);
  }

  async generateDIYInstructions(giftId) {
    try {
      const gift = await this.getById(giftId);
      
      if (!gift || gift.Category !== 'DIY') {
        throw new Error('Gift not found or not a DIY project');
      }

      // Generate detailed instructions based on gift type
      const instructionTemplates = {
        'DIY Terrarium Kit': {
          materials: [
            { item: 'Glass container or jar', quantity: '1', essential: true },
            { item: 'Small rocks or pebbles', quantity: '1 cup', essential: true },
            { item: 'Activated charcoal', quantity: '2 tbsp', essential: true },
            { item: 'Potting soil', quantity: '2 cups', essential: true },
            { item: 'Small plants (succulents recommended)', quantity: '2-3', essential: true },
            { item: 'Decorative elements (stones, figures)', quantity: 'as desired', essential: false },
            { item: 'Spray bottle', quantity: '1', essential: true },
            { item: 'Small spoon or tweezers', quantity: '1', essential: true }
          ],
          tools: ['Small spoon', 'Tweezers', 'Spray bottle'],
          difficulty: 'Beginner',
          timeEstimate: '45 minutes',
          steps: [
            {
              title: 'Prepare the Base Layer',
              description: 'Add a layer of small rocks or pebbles to the bottom of your container for drainage.',
              image: '/images/diy/terrarium-step1.jpg',
              duration: '5 minutes',
              tips: ['Use rocks about 1/4 to 1/2 inch in size', 'Layer should be about 1 inch deep']
            },
            {
              title: 'Add Charcoal Layer',
              description: 'Sprinkle activated charcoal over the rocks to prevent odors and bacterial growth.',
              image: '/images/diy/terrarium-step2.jpg',
              duration: '3 minutes',
              tips: ['A thin layer is sufficient', 'Charcoal helps keep the terrarium fresh']
            },
            {
              title: 'Create Soil Foundation',
              description: 'Add a layer of potting soil, making it deeper where you plan to plant.',
              image: '/images/diy/terrarium-step3.jpg',
              duration: '7 minutes',
              tips: ['Soil layer should be 2-3 inches deep', 'Create small hills for visual interest']
            },
            {
              title: 'Plant Your Greenery',
              description: 'Carefully plant your chosen plants, starting with the largest ones first.',
              image: '/images/diy/terrarium-step4.jpg',
              duration: '15 minutes',
              tips: ['Use tweezers for precise placement', 'Leave space for plants to grow']
            },
            {
              title: 'Add Decorative Elements',
              description: 'Place decorative stones, moss, or small figurines to personalize your terrarium.',
              image: '/images/diy/terrarium-step5.jpg',
              duration: '10 minutes',
              tips: ['Less is more with decorations', 'Consider the scale of your container']
            },
            {
              title: 'Final Watering and Setup',
              description: 'Lightly mist the terrarium and place it in a location with indirect sunlight.',
              image: '/images/diy/terrarium-step6.jpg',
              duration: '5 minutes',
              tips: ['Avoid overwatering', 'Bright, indirect light is best']
            }
          ]
        }
      };

      // Default template for other DIY projects
      const defaultTemplate = {
        materials: [
          { item: 'Basic craft materials', quantity: 'varies', essential: true },
          { item: 'Decorative elements', quantity: 'as needed', essential: false }
        ],
        tools: ['Basic crafting tools'],
        difficulty: 'Intermediate',
        timeEstimate: '1-2 hours',
        steps: [
          {
            title: 'Gather Materials',
            description: 'Collect all necessary materials and prepare your workspace.',
            image: '/images/diy/generic-step1.jpg',
            duration: '10 minutes',
            tips: ['Read through all instructions first', 'Organize materials within easy reach']
          },
          {
            title: 'Create Your Project',
            description: 'Follow the specific instructions for your chosen DIY project.',
            image: '/images/diy/generic-step2.jpg',
            duration: '60-90 minutes',
            tips: ['Take your time', 'Don\'t be afraid to get creative']
          },
          {
            title: 'Finishing Touches',
            description: 'Add final details and let your project dry or set as needed.',
            image: '/images/diy/generic-step3.jpg',
            duration: '15 minutes',
            tips: ['Allow proper drying time', 'Consider packaging for gifting']
          }
        ]
      };

      const instructions = instructionTemplates[gift.Title] || defaultTemplate;

      return {
        giftId: gift.Id,
        gift: { ...gift },
        ...instructions,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error generating DIY instructions:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async trackUserInteraction(interactionType, giftData) {
    // Update category preferences
    if (giftData.Category) {
      this.userPreferences.categories[giftData.Category] = 
        (this.userPreferences.categories[giftData.Category] || 0) + this.getInteractionWeight(interactionType);
    }
    
    // Update tag preferences
    if (giftData.Tags) {
      const tags = giftData.Tags.split(',');
      tags.forEach(tag => {
        this.userPreferences.tags[tag.trim()] = 
          (this.userPreferences.tags[tag.trim()] || 0) + this.getInteractionWeight(interactionType) * 0.5;
      });
    }
    
    // Update price range preferences
    if (giftData.Price) {
      const priceRange = Math.floor(giftData.Price / 50) * 50;
      this.userPreferences.priceRanges[priceRange] = 
        (this.userPreferences.priceRanges[priceRange] || 0) + this.getInteractionWeight(interactionType);
    }
    
    this.userPreferences.lastUpdated = new Date().toISOString();
  }

  getInteractionWeight(interactionType) {
    const weights = {
      'view': 1,
      'share': 2,
      'purchase': 5,
      'purchase_attempt': 4,
      'purchase_redirect': 4,
      'store_view': 2,
      'click': 1
    };
    return weights[interactionType] || 1;
  }
}

export const giftService = new GiftService();