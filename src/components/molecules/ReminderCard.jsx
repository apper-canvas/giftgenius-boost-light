import React from "react";
import { cn } from "@/utils/cn";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { motion } from "framer-motion";
import { format, differenceInDays, parseISO } from "date-fns";

const ReminderCard = ({ reminder, recipient, occasion, onSnooze, onFindGifts, className, ...props }) => {
  const daysUntil = differenceInDays(parseISO(occasion.date), new Date());
  
  const getUrgencyColor = (days) => {
    if (days <= 1) return "error";
    if (days <= 3) return "warning";
    if (days <= 7) return "accent";
    return "success";
  };

  const getOccasionIcon = (type) => {
    const icons = {
      "Birthday": "Cake",
      "Anniversary": "Heart",
      "Wedding": "Heart",
      "Graduation": "GraduationCap",
      "Christmas": "Gift",
      "Holiday": "Calendar",
      "Thank You": "Smile"
    };
    return icons[type] || "Calendar";
  };

  const urgencyColor = getUrgencyColor(daysUntil);
  const isUrgent = daysUntil <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={className}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-200",
        isUrgent && "ring-2 ring-red-200 bg-red-50/50"
      )}>
        {/* Urgency Indicator */}
        {isUrgent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500" />
        )}

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                <ApperIcon 
                  name={getOccasionIcon(occasion.type)} 
                  size={24} 
                  className="text-purple-600" 
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
{recipient.Name || recipient.name}'s {occasion.Type || occasion.type}
                </h3>
                <p className="text-sm text-gray-600">
                  {format(parseISO(occasion.Date || occasion.date), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>
            
            <Badge variant={urgencyColor} size="lg">
              {daysUntil === 0 ? "Today!" : 
               daysUntil === 1 ? "Tomorrow" : 
               daysUntil < 0 ? "Overdue!" :
               `${daysUntil} days`}
            </Badge>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {occasion.budget && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Budget:</span>
                <span className="font-medium text-green-600">${occasion.budget}</span>
              </div>
            )}
            
{(recipient.Relationship || recipient.relationship) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Relationship:</span>
                <span className="text-sm font-medium">{recipient.Relationship || recipient.relationship}</span>
              </div>
            )}

            {(recipient.Age || recipient.age) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Age:</span>
                <span className="text-sm font-medium text-gray-900">{recipient.age} years old</span>
              </div>
            )}
          </div>

          {/* Interests Preview */}
{(recipient.interests || recipient.Interests) && (recipient.interests || recipient.Interests).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {(recipient.interests || recipient.Interests).slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    {interest}
                  </Badge>
                ))}
                {(recipient.interests || recipient.Interests).length > 3 && (
                  <Badge variant="outline" size="sm">
                    +{(recipient.interests || recipient.Interests).length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {occasion.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <ApperIcon name="StickyNote" size={16} className="text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">{occasion.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              icon="Clock"
              onClick={() => onSnooze?.(reminder)}
            >
              Snooze
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              icon="Sparkles"
              onClick={() => onFindGifts?.(recipient, occasion)}
            >
              Find Gifts
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ReminderCard;