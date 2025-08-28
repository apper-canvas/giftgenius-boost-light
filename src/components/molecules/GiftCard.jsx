import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const GiftCard = ({ gift, onSave, onBuy, onViewInstructions, className, ...props }) => {
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(gift);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return "success";
    if (score >= 75) return "accent";
    if (score >= 60) return "primary";
    return "default";
  };

  const getDeliveryIcon = (days) => {
    if (days <= 1) return "Zap";
    if (days <= 3) return "Truck";
    return "Package";
  };

  return (
    <motion.div
    initial={{
        opacity: 0,
        y: 20
    }}
    animate={{
        opacity: 1,
        y: 0
    }}
    whileHover={{
        y: -4,
        scale: 1.02
    }}
    transition={{
        duration: 0.2,
        ease: "easeOut"
    }}
    className={className}>
    <Card className="relative overflow-hidden group" hoverable={false}>
        {/* Save Button */}
        <button
            onClick={handleSave}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200">
            <ApperIcon
                name={isSaved ? "Heart" : "Heart"}
                size={18}
                className={isSaved ? "text-red-500 fill-current" : "text-gray-400 hover:text-red-500"} />
        </button>
        {/* Gift Image */}
        <div
            className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-card mb-4">
            {gift.imageUrl ? <img
                src={gift.imageUrl}
                alt={gift.title}
                className="w-full h-full object-cover rounded-t-card" /> : <div className="w-full h-full flex items-center justify-center">
                <ApperIcon name="Gift" size={48} className="text-purple-300" />
            </div>})
                      
                      {/* Trending Badge */}
            {gift.isTrending && <div className="absolute top-3 left-3">
                <Badge
                    variant="accent"
                    size="sm"
                    className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                    <ApperIcon name="TrendingUp" size={12} className="mr-1" />Trending
                                  </Badge>
            </div>}
            {/* Match Score Badge */}
            <div className="absolute bottom-3 left-3">
                <Badge variant={getMatchScoreColor(gift.matchScore)} size="sm">
                    {gift.matchScore}% match
                                </Badge>
            </div>
            {/* Gift Details */}
            <div className="space-y-4">
                {/* Title and Price */}
                <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {gift.title}
                    </h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <span className="text-2xl font-bold gradient-text">${gift.price}
                            </span>
                            <div className="flex items-center space-x-1 text-gray-600">
                                <ApperIcon name={getDeliveryIcon(gift.deliveryDays)} size={16} />
                                <span className="text-sm">{gift.deliveryDays}days</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Reasoning */}
                <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                        {gift.reasoning}
                    </p>
                </div>
                {/* Tags */}
                {gift.tags && gift.tags.length > 0 && <div className="flex flex-wrap gap-2">
                    {gift.tags.slice(0, 3).map((tag, index) => <Badge key={index} variant="outline" size="sm">
                        {tag}
                    </Badge>)}
                </div>}
                {/* Action Buttons */}
                {/* Action Buttons */}
                <div
                    className={`grid gap-2 pt-2 ${gift.category === "DIY" ? "grid-cols-2" : "grid-cols-2"}`}>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSave} className="flex-1">
                            <ApperIcon name={isSaved ? "Check" : "Bookmark"} size={16} />
                            {isSaved ? "Saved" : "Save"}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: gift.title,
                                        text: `Check out this gift idea: ${gift.title} - ${gift.reasoning}`,
                                        url: gift.purchaseUrl || window.location.href
                                    });
                                } else {
                                    navigator.clipboard.writeText(`${gift.title} - ${gift.purchaseUrl || window.location.href}`);

                                    onSave?.({
                                        ...gift,
                                        shared: true
                                    });
                                }
                            }}>
                            <ApperIcon name="Share2" size={16} />
                        </Button>
                    </div>
                    {gift.category === "DIY" && <Button variant="success" size="sm" onClick={() => onViewInstructions?.(gift)}>
                        <ApperIcon name="BookOpen" size={16} />Instructions
                                      </Button>}
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onBuy?.(gift)}
                        className={gift.category === "DIY" ? "" : "col-span-2"}>
                        <ApperIcon name="ShoppingCart" size={16} />Buy Now
                                    </Button>
                </div>
                {/* Vendor */}
                <div
                    className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>From {gift.vendor}</span>
                    <div className="flex items-center space-x-1">
                        <ApperIcon name="Star" size={12} className="text-amber-400 fill-current" />
                        <span>4.8</span>
                    </div>
                </div>
            </div>
        </div></Card>
</motion.div>
  );
};

export default GiftCard;