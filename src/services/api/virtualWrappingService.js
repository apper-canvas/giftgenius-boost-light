import wrappingTemplatesData from "@/services/mockData/virtualWrapping.json";

class VirtualWrappingService {
  constructor() {
    this.templates = [...wrappingTemplatesData];
    this.wrappedGifts = [];
  }

  async getAll() {
    await this.delay(300);
    return [...this.templates];
  }

  async getById(id) {
    await this.delay(150);
    const template = this.templates.find(t => t.Id === parseInt(id));
    return template ? { ...template } : null;
  }

  async getByCategory(category) {
    await this.delay(200);
    return this.templates.filter(template => template.category === category);
  }

  async create(wrappingData) {
    await this.delay(400);
    
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
    await this.delay(200);
    return [...this.wrappedGifts];
  }

  async getWrappedGiftById(id) {
    await this.delay(150);
    const wrappedGift = this.wrappedGifts.find(wg => wg.Id === parseInt(id));
    return wrappedGift ? { ...wrappedGift } : null;
  }

  async shareWrappedGift(id, shareData = {}) {
    await this.delay(300);
    const index = this.wrappedGifts.findIndex(wg => wg.Id === parseInt(id));
    if (index === -1) throw new Error("Wrapped gift not found");
    
    this.wrappedGifts[index] = {
      ...this.wrappedGifts[index],
      isShared: true,
      sharedAt: new Date().toISOString(),
      shareData: shareData,
      viewCount: this.wrappedGifts[index].viewCount + 1
    };
    
    return { ...this.wrappedGifts[index] };
  }

  async updateWrappedGift(id, updateData) {
    await this.delay(300);
    const index = this.wrappedGifts.findIndex(wg => wg.Id === parseInt(id));
    if (index === -1) throw new Error("Wrapped gift not found");
    
    this.wrappedGifts[index] = { 
      ...this.wrappedGifts[index], 
      ...updateData, 
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.wrappedGifts[index] };
  }

  async delete(id) {
    await this.delay(250);
    const index = this.wrappedGifts.findIndex(wg => wg.Id === parseInt(id));
    if (index === -1) throw new Error("Wrapped gift not found");
    
    const deleted = this.wrappedGifts.splice(index, 1)[0];
    return { ...deleted };
  }

  // Get popular wrapping templates
  async getPopularTemplates(limit = 6) {
    await this.delay(200);
    
    // Simulate popularity based on usage
    const templatesWithPopularity = this.templates.map(template => ({
      ...template,
      usageCount: Math.floor(Math.random() * 100) + 10,
      rating: (Math.random() * 2 + 3).toFixed(1) // 3.0 - 5.0 rating
    }));
    
    return templatesWithPopularity
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // Get seasonal templates
  async getSeasonalTemplates() {
    await this.delay(200);
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    let seasonalCategory = 'Classic';
    if (currentMonth >= 11 || currentMonth <= 1) seasonalCategory = 'Holiday';
    else if (currentMonth >= 2 && currentMonth <= 4) seasonalCategory = 'Seasonal';
    else if (currentMonth >= 6 && currentMonth <= 8) seasonalCategory = 'Birthday';
    
    return this.templates.filter(template => 
      template.category === seasonalCategory || template.seasonal === true
    );
  }

  getNextWrappedGiftId() {
    return Math.max(...this.wrappedGifts.map(wg => wg.Id), 0) + 1;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const virtualWrappingService = new VirtualWrappingService();