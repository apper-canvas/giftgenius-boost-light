import React from "react";
import { cn } from "@/utils/cn";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { motion } from "framer-motion";
import { format, differenceInDays, parseISO } from "date-fns";

const RecipientCard = ({ recipient, onFindGifts, className, ...props }) => {
  const nextOccasion = recipient.occasions?.[0];
  const daysUntil = nextOccasion ? differenceInDays(parseISO(nextOccasion.date), new Date()) : null;

  const getUrgencyColor = (days) => {
    if (days <= 3) return "error";
    if (days <= 7) return "warning";
    return "success";
  };

  const getRelationshipIcon = (relationship) => {
    const icons = {
      "Family": "Heart",
      "Friend": "Users",
      "Partner": "Heart",
      "Colleague": "Briefcase",
      "Acquaintance": "User"
    };
    return icons[relationship] || "User";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      <Card className="relative overflow-hidden group" hoverable={false}>
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />
        
        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar
src={recipient.PhotoUrl || recipient.photoUrl}
                alt={recipient.Name || recipient.name}
                fallback={(recipient.Name || recipient.name)?.[0]}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{recipient.Name || recipient.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <ApperIcon name={getRelationshipIcon(recipient.Relationship || recipient.relationship)} size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-600">{recipient.Relationship || recipient.relationship}</span>
                  <span className="text-gray-400">•</span>
                </div>
              </div>
            </div>

            {/* Gift History Count */}
            {recipient.giftHistory && recipient.giftHistory.length > 0 && (
              <Badge variant="outline" size="sm">
                {recipient.giftHistory.length} gifts
              </Badge>
            )}
          </div>

          {/* Next Occasion */}
          {nextOccasion && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Calendar" size={16} className="text-purple-600" />
                  <span className="font-medium text-gray-900">{nextOccasion.type}</span>
                </div>
                {daysUntil !== null && (
                  <Badge variant={getUrgencyColor(daysUntil)} size="sm">
                    {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {format(parseISO(nextOccasion.date), "MMM d, yyyy")}
                </span>
                {nextOccasion.budget && (
                  <span className="font-medium text-green-600">
                    Budget: ${nextOccasion.budget}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Interests */}
{(recipient.interests || recipient.Interests) && (recipient.interests || recipient.Interests).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {(recipient.interests || recipient.Interests).slice(0, 4).map((interest, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    {interest}
                  </Badge>
                ))}
                {recipient.interests.length > 4 && (
                  <Badge variant="outline" size="sm">
                    +{recipient.interests.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Location */}
{(recipient.Location || recipient.location) && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ApperIcon name="MapPin" size={14} />
              <span>{recipient.Location || recipient.location}</span>
            </div>
          )}

          {/* Action Button */}
<div className="pt-2 space-y-2">
            <Button 
              variant="primary" 
              size="md" 
              className="w-full"
              icon="Sparkles"
              onClick={() => onFindGifts?.(recipient)}
            >
              Find Perfect Gifts
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                icon="Users2"
                onClick={() => window.location.href = `/group-gifts?recipient=${recipient.Id}`}
              >
                Group Gift
              </Button>
              
              <Button 
                variant="accent" 
                size="sm" 
                icon="Share2"
                onClick={() => window.location.href = `/social?recipient=${recipient.Id}`}
              >
                Social Gifts
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default RecipientCard;