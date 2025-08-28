import giftsData from "@/services/mockData/gifts.json";
class GiftService {
  constructor() {
    this.data = [...giftsData];
  }

  async getAll() {
    await this.delay(200);
    return [...this.data];
  }

  async getById(id) {
    await this.delay(150);
    const gift = this.data.find(g => g.Id === parseInt(id));
    return gift ? { ...gift } : null;
  }

  async getRecommendations({ recipientId, occasionId, budget, interests }) {
    await this.delay(800); // Simulate AI processing time
    
    let recommendations = [...this.data];
    
    // Filter by budget if provided
    if (budget) {
      recommendations = recommendations.filter(gift => gift.price <= budget * 1.2); // Allow 20% over budget
    }
    
    // Boost match scores based on interests
    if (interests && interests.length > 0) {
      recommendations = recommendations.map(gift => {
        let scoreBoost = 0;
        const giftTags = gift.tags || [];
        const giftTitle = gift.title.toLowerCase();
        const giftReasoning = gift.reasoning.toLowerCase();
        
        interests.forEach(interest => {
          const interestLower = interest.toLowerCase();
          // Check if interest matches tags, title, or reasoning
          if (giftTags.some(tag => tag.toLowerCase().includes(interestLower)) ||
              giftTitle.includes(interestLower) ||
              giftReasoning.includes(interestLower)) {
            scoreBoost += 15;
          }
        });
        
        return {
          ...gift,
          matchScore: Math.min(99, gift.matchScore + scoreBoost)
        };
      });
    }
    
    // Sort by match score and return top recommendations
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
.slice(0, 15); // Return top 15 recommendations
  }

  // Get trending gifts with filters
  async getTrendingGifts({ occasion = 'all', demographic = 'all', sortBy = 'trending' } = {}) {
    await this.delay(800);
    
    let gifts = [...this.data];
    
    // Add trending data to gifts
    gifts = gifts.map(gift => ({
      ...gift,
      trendScore: Math.floor(Math.random() * 100) + 1,
      growthPercentage: Math.floor(Math.random() * 150) - 25, // -25 to +125
      popularityRank: Math.floor(Math.random() * 100) + 1,
      weeklyViews: Math.floor(Math.random() * 10000) + 500,
      isTrending: Math.random() > 0.4 // 60% chance of trending
    }));
    
    // Filter by occasion
    if (occasion !== 'all') {
      gifts = gifts.filter(gift => 
        gift.tags?.some(tag => tag.toLowerCase().includes(occasion.toLowerCase())) ||
        gift.title.toLowerCase().includes(occasion.toLowerCase())
      );
    }
    
    // Filter by demographic
    if (demographic !== 'all') {
      const demographicKeywords = {
        'teen': ['teen', 'young', 'student', 'school'],
        'young-adult': ['adult', 'professional', 'career', 'modern'],
        'adult': ['mature', 'sophisticated', 'premium', 'luxury'],
        'senior': ['classic', 'traditional', 'comfort', 'elegant'],
        'family': ['family', 'kids', 'children', 'home']
      };
      
      const keywords = demographicKeywords[demographic] || [];
      if (keywords.length > 0) {
        gifts = gifts.filter(gift =>
          keywords.some(keyword =>
            gift.title.toLowerCase().includes(keyword) ||
            gift.reasoning.toLowerCase().includes(keyword) ||
            gift.tags?.some(tag => tag.toLowerCase().includes(keyword))
          )
        );
      }
    }
    
    // Sort results
    switch (sortBy) {
      case 'trending':
        gifts.sort((a, b) => b.trendScore - a.trendScore);
        break;
      case 'popular':
        gifts.sort((a, b) => b.weeklyViews - a.weeklyViews);
        break;
      case 'recent':
        gifts.sort((a, b) => b.Id - a.Id);
        break;
      case 'price-asc':
        gifts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        gifts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      default:
        gifts.sort((a, b) => b.trendScore - a.trendScore);
    }
    
    return gifts.slice(0, 20);
  }

  // Get trending categories
  async getTrendingCategories() {
    await this.delay(600);
    
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
    await this.delay(500);
    const gift = await this.getById(giftId);
    
    if (!gift || gift.category !== 'DIY') {
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

    const instructions = instructionTemplates[gift.title] || defaultTemplate;

    return {
      giftId: gift.Id,
      gift: { ...gift },
      ...instructions,
      createdAt: new Date().toISOString()
    };
  }

  async getByCategory(category) {
    await this.delay(250);
    return this.data.filter(gift => gift.category === category);
  }

  async create(giftData) {
    await this.delay(400);
    const newGift = {
      Id: this.getNextId(),
      ...giftData,
      tags: giftData.tags || []
    };
    this.data.push(newGift);
    return { ...newGift };
  }
async update(id, giftData) {
    await this.delay(350);
    const index = this.data.findIndex(g => g.Id === parseInt(id));
    if (index === -1) throw new Error("Gift not found");
    
    this.data[index] = { ...this.data[index], ...giftData, Id: parseInt(id) };
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay(250);
    const index = this.data.findIndex(g => g.Id === parseInt(id));
    if (index === -1) throw new Error("Gift not found");
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  getNextId() {
    return Math.max(...this.data.map(g => g.Id), 0) + 1;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const giftService = new GiftService();