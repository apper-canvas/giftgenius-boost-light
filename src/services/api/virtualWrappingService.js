class VirtualWrappingService {
  constructor() {
    this.apperClient = null;
    this.wrappedGifts = []; // Mock storage for wrapped gifts
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
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Description"}},
          {"field": {"Name": "Category"}},
          {"field": {"Name": "PrimaryColor"}},
          {"field": {"Name": "SecondaryColor"}},
          {"field": {"Name": "Gradient"}},
          {"field": {"Name": "Pattern"}},
          {"field": {"Name": "ThemeStyle"}},
          {"field": {"Name": "IsAnimated"}},
          {"field": {"Name": "PreviewImage"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('virtual_wrapping_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(template => ({
        ...template,
        name: template.Name,
        description: template.Description,
        category: template.Category,
        primaryColor: template.PrimaryColor,
        secondaryColor: template.SecondaryColor,
        gradient: template.Gradient,
        pattern: template.Pattern,
        themeStyle: template.ThemeStyle,
        isAnimated: template.IsAnimated || false,
        previewImage: template.PreviewImage
      }));
    } catch (error) {
      console.error("Error fetching virtual wrapping templates:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Description"}},
          {"field": {"Name": "Category"}},
          {"field": {"Name": "PrimaryColor"}},
          {"field": {"Name": "SecondaryColor"}},
          {"field": {"Name": "Gradient"}},
          {"field": {"Name": "Pattern"}},
          {"field": {"Name": "ThemeStyle"}},
          {"field": {"Name": "IsAnimated"}},
          {"field": {"Name": "PreviewImage"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById('virtual_wrapping_c', parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }
      
      const template = response.data;
      return {
        ...template,
        name: template.Name,
        description: template.Description,
        category: template.Category,
        primaryColor: template.PrimaryColor,
        secondaryColor: template.SecondaryColor,
        gradient: template.Gradient,
        pattern: template.Pattern,
        themeStyle: template.ThemeStyle,
        isAnimated: template.IsAnimated || false,
        previewImage: template.PreviewImage
      };
    } catch (error) {
      console.error(`Error fetching virtual wrapping template ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async getByCategory(category) {
    try {
      if (!this.apperClient) this.initializeApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Description"}},
          {"field": {"Name": "Category"}},
          {"field": {"Name": "PrimaryColor"}},
          {"field": {"Name": "SecondaryColor"}},
          {"field": {"Name": "Gradient"}},
          {"field": {"Name": "Pattern"}},
          {"field": {"Name": "ThemeStyle"}},
          {"field": {"Name": "IsAnimated"}},
          {"field": {"Name": "PreviewImage"}}
        ],
        where: [
          {"FieldName": "Category", "Operator": "EqualTo", "Values": [category]}
        ]
      };
      
      const response = await this.apperClient.fetchRecords('virtual_wrapping_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data.map(template => ({
        ...template,
        name: template.Name,
        description: template.Description,
        category: template.Category,
        primaryColor: template.PrimaryColor,
        secondaryColor: template.SecondaryColor,
        gradient: template.Gradient,
        pattern: template.Pattern,
        themeStyle: template.ThemeStyle,
        isAnimated: template.IsAnimated || false,
        previewImage: template.PreviewImage
      }));
    } catch (error) {
      console.error(`Error fetching virtual wrapping templates for category ${category}:`, error?.response?.data?.message || error);
      return [];
    }
  }

  // Mock wrapped gifts functionality (would need separate wrapped_gifts table)
  async create(wrappingData) {
    const newWrappedGift = {
      Id: this.getNextWrappedGiftId(),
      ...wrappingData,
      createdAt: new Date().toISOString(),
      isShared: false,
      viewCount: 0
    };
    
    this.wrappedGifts.push(newWrappedGift);
    return { ...newWrappedGift };
  }

  async getWrappedGifts() {
    return [...this.wrappedGifts];
  }

  async getWrappedGiftById(id) {
    const wrappedGift = this.wrappedGifts.find(wg => wg.Id === parseInt(id));
    return wrappedGift ? { ...wrappedGift } : null;
  }

  async getPopularTemplates(limit = 6) {
    try {
      const templates = await this.getAll();
      
      // Simulate popularity based on usage
      const templatesWithPopularity = templates.map(template => ({
        ...template,
        usageCount: Math.floor(Math.random() * 100) + 10,
        rating: (Math.random() * 2 + 3).toFixed(1) // 3.0 - 5.0 rating
      }));
      
      return templatesWithPopularity
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting popular templates:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getSeasonalTemplates() {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    let seasonalCategory = 'Classic';
    if (currentMonth >= 11 || currentMonth <= 1) seasonalCategory = 'Holiday';
    else if (currentMonth >= 2 && currentMonth <= 4) seasonalCategory = 'Seasonal';
    else if (currentMonth >= 6 && currentMonth <= 8) seasonalCategory = 'Birthday';
    
    return this.getByCategory(seasonalCategory);
  }

  getNextWrappedGiftId() {
    return Math.max(...this.wrappedGifts.map(wg => wg.Id), 0) + 1;
  }
}

export const virtualWrappingService = new VirtualWrappingService();