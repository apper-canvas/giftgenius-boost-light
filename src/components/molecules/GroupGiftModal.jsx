import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { format, addDays } from 'date-fns';

const GroupGiftModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  recipients = [], 
  gifts = [],
  preSelectedRecipientId = null,
  preSelectedGiftId = null
}) => {
  const [formData, setFormData] = useState({
    title: '',
    recipientId: preSelectedRecipientId || '',
    giftId: preSelectedGiftId || '',
    occasionType: 'Birthday',
    targetAmount: '',
    deadline: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    description: '',
    createdBy: 'user@example.com' // In real app, get from auth
  });
  
  const [inviteEmails, setInviteEmails] = useState(['']);
  const [errors, setErrors] = useState({});

  const occasionTypes = [
    'Birthday', 'Wedding', 'Baby Shower', 'Graduation', 
    'Holiday', 'Anniversary', 'Retirement', 'Housewarming', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };

  const addEmailField = () => {
    setInviteEmails(prev => [...prev, '']);
  };

  const removeEmailField = (index) => {
    if (inviteEmails.length > 1) {
      setInviteEmails(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.recipientId) {
      newErrors.recipientId = 'Recipient is required';
    }
    
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const validEmails = inviteEmails
      .filter(email => email.trim() && email.includes('@'))
      .map(email => ({ email: email.trim() }));

    const submitData = {
      ...formData,
      invitedContributors: validEmails
    };

    onSubmit(submitData);
  };

const selectedRecipient = recipients.find(r => r.Id === parseInt(formData.recipientId));
  const selectedGift = gifts.find(g => g.Id === parseInt(formData.giftId));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Create Group Gift</h2>
              <p className="text-gray-600">Collaborate with others on a meaningful gift</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon="X"
              onClick={onClose}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Gift Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gift Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Sarah's Wedding Gift"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    value={formData.recipientId}
                    onChange={(e) => handleInputChange('recipientId', e.target.value)}
                  >
                    <option value="">Select recipient...</option>
{recipients.map(recipient => (
                      <option key={recipient.Id} value={recipient.Id}>
                        {recipient.Name || recipient.name} ({recipient.Relationship || recipient.relationship})
                      </option>
                    ))}
                  </select>
                  {errors.recipientId && (
                    <p className="text-sm text-red-600 mt-1">{errors.recipientId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occasion Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    value={formData.occasionType}
                    onChange={(e) => handleInputChange('occasionType', e.target.value)}
                  >
                    {occasionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Gift (Optional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  value={formData.giftId}
                  onChange={(e) => handleInputChange('giftId', e.target.value)}
                >
                  <option value="">No specific gift selected</option>
{gifts.slice(0, 20).map(gift => (
                    <option key={gift.Id} value={gift.Id}>
                      {gift.Title || gift.name} - ${gift.Price || gift.price}
                    </option>
                  ))}
                </select>
                {selectedGift && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">{selectedGift.name}</p>
                    <p className="text-sm text-blue-700">${selectedGift.price}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Amount *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.targetAmount}
                    onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                    error={errors.targetAmount}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline *
                  </label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    error={errors.deadline}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  rows={3}
                  placeholder="Tell contributors about this gift idea..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </div>

            {/* Recipient Preview */}
            {selectedRecipient && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Gift For:</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-purple-700 font-medium">
{(selectedRecipient.Name || selectedRecipient.name)[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedRecipient.Name || selectedRecipient.name}</p>
                    <p className="text-sm text-gray-600">{selectedRecipient.Relationship || selectedRecipient.relationship}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Invite Contributors */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Invite Contributors</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon="Plus"
                  onClick={addEmailField}
                >
                  Add Email
                </Button>
              </div>
              
              <div className="space-y-2">
                {inviteEmails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="email"
                      placeholder="friend@example.com"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {inviteEmails.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon="X"
                        onClick={() => removeEmailField(index)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Contributors will receive an email invitation to participate in this group gift.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon="Users2"
              >
                Create Group Gift
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default GroupGiftModal;