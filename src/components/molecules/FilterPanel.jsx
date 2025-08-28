import React from "react";
import { cn } from "@/utils/cn";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const FilterPanel = ({ className, filters, onFiltersChange, onReset }) => {
  const categories = ["Products", "Experiences", "DIY"];
  
  const materials = [
    "Wood", "Metal", "Glass", "Ceramic", "Fabric", "Leather", 
    "Plastic", "Paper", "Bamboo", "Stone", "Silicone"
  ];

  const handleCategoryToggle = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const handleMaterialToggle = (material) => {
    const newMaterials = filters.materials?.includes(material)
      ? filters.materials.filter(m => m !== material)
      : [...(filters.materials || []), material];
    
    onFiltersChange({
      ...filters,
      materials: newMaterials
    });
  };

  const handlePriceChange = (field, value) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [field]: parseInt(value) || 0
      }
    });
  };

  const handleAgeRangeChange = (field, value) => {
    onFiltersChange({
      ...filters,
      ageRange: {
        ...filters.ageRange,
        [field]: parseInt(value) || (field === 'min' ? 1 : 100)
      }
    });
  };

  const handleDeliveryChange = (value) => {
    onFiltersChange({
      ...filters,
      maxDeliveryDays: parseInt(value) || 30
    });
  };

  return (
    <Card className={cn("space-y-6", className)} variant="compact">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <ApperIcon name="RotateCcw" size={16} />
          Reset
        </Button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-400"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
</div>

      {/* Materials Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Materials</h4>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {materials.map((material) => (
            <label key={material} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.materials?.includes(material) || false}
                onChange={() => handleMaterialToggle(material)}
                className="w-3 h-3 text-primary-500 border-gray-300 rounded focus:ring-primary-400"
              />
              <span className="text-xs text-gray-700">{material}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Eco-Friendly Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Special Criteria</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={filters.ecoFriendly}
              onChange={(e) => onFiltersChange({
                ...filters,
                ecoFriendly: e.target.checked
              })}
              className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-400"
            />
            <div className="flex items-center space-x-2">
              <ApperIcon name="Leaf" size={16} className="text-green-500" />
              <span className="text-sm text-gray-700">Eco-Friendly</span>
            </div>
          </label>
        </div>
      </div>
      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Price Range</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Min ($)</label>
            <input
              type="number"
              value={filters.priceRange.min}
              onChange={(e) => handlePriceChange("min", e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-secondary-400 focus:ring-1 focus:ring-secondary-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Max ($)</label>
            <input
              type="number"
              value={filters.priceRange.max}
              onChange={(e) => handlePriceChange("max", e.target.value)}
              placeholder="1000"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-secondary-400 focus:ring-1 focus:ring-secondary-400 focus:outline-none"
            />
          </div>
        </div>
</div>

      {/* Recipient Age Range */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Recipient Age Range</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Min Age</label>
            <input
              type="number"
              min="1"
              max="100"
              value={filters.ageRange?.min || 1}
              onChange={(e) => handleAgeRangeChange("min", e.target.value)}
              placeholder="1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-secondary-400 focus:ring-1 focus:ring-secondary-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Max Age</label>
            <input
              type="number"
              min="1"
              max="100"
              value={filters.ageRange?.max || 100}
              onChange={(e) => handleAgeRangeChange("max", e.target.value)}
              placeholder="100"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-secondary-400 focus:ring-1 focus:ring-secondary-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Ages {filters.ageRange?.min || 1} - {filters.ageRange?.max || 100}</span>
        </div>
      </div>

      {/* Delivery Time */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Max Delivery Time</h4>
        <div className="space-y-2">
          <input
            type="range"
            min="1"
            max="30"
            value={filters.maxDeliveryDays}
            onChange={(e) => handleDeliveryChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-primary"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>1 day</span>
            <span className="font-medium text-secondary-600">{filters.maxDeliveryDays} days</span>
            <span>30 days</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FilterPanel;