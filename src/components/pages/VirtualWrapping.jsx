import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { giftService } from '@/services/api/giftService';
import { virtualWrappingService } from '@/services/api/virtualWrappingService';
import { toast } from 'react-toastify';

const VirtualWrapping = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const giftId = searchParams.get('giftId');

  const [gift, setGift] = useState(null);
  const [wrappingTemplates, setWrappingTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [personalMessage, setPersonalMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [giftId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [giftData, templatesData] = await Promise.all([
        giftId ? giftService.getById(giftId) : null,
        virtualWrappingService.getAll()
      ]);

      setGift(giftData);
      setWrappingTemplates(templatesData);

      // Pre-select first template if available
      if (templatesData.length > 0) {
        setSelectedTemplate(templatesData[0]);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load gift wrapping options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWrappedGift = async () => {
    if (!selectedTemplate || !personalMessage.trim() || !senderName.trim()) {
      toast.warning('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      
      const wrappedGift = await virtualWrappingService.create({
        giftId: gift?.Id,
        templateId: selectedTemplate.Id,
        personalMessage: personalMessage.trim(),
        senderName: senderName.trim(),
        recipientName: recipientName.trim() || 'Special Someone',
        gift: gift
      });

      toast.success('Gift wrapped beautifully! Ready to share!');
      navigate(`/social?wrappedGiftId=${wrappedGift.Id}`);
    } catch (err) {
      toast.error('Failed to wrap gift. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    toast.info(`Selected ${template.name} wrapping`);
  };

  const getTemplatesByCategory = (category) => {
    return wrappingTemplates.filter(template => template.category === category);
  };

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;
  if (!gift && giftId) return <Empty message="Gift not found" />;

  const categories = ['Holiday', 'Birthday', 'Wedding', 'Baby', 'Seasonal', 'Classic'];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ApperIcon name="Gift" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold gradient-text">Virtual Gift Wrapping</h1>
              <p className="text-gray-600">Add a personal touch with beautiful wrapping paper and heartfelt messages</p>
            </div>
          </motion.div>

          {gift && (
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Package" size={24} className="text-gray-400" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">{gift.title}</h3>
                  <p className="text-sm text-gray-600">${gift.price}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {!isPreviewMode ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Wrapping Paper Selection */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ApperIcon name="Palette" size={24} />
                  Choose Wrapping Paper
                </h2>
                <Badge variant="accent" size="sm">
                  {wrappingTemplates.length} designs available
                </Badge>
              </div>

              {categories.map((category) => {
                const categoryTemplates = getTemplatesByCategory(category);
                if (categoryTemplates.length === 0) return null;

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <ApperIcon name="Tag" size={18} />
                      {category}
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categoryTemplates.map((template) => (
                        <motion.div
                          key={template.Id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTemplateSelect(template)}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedTemplate?.Id === template.Id
                              ? 'ring-2 ring-purple-500 shadow-lg'
                              : 'hover:shadow-md'
                          }`}
                        >
                          <Card className="p-3 space-y-2">
                            <div 
                              className="w-full h-24 rounded-lg bg-gradient-to-br"
                              style={{ 
                                background: template.gradient || `linear-gradient(135deg, ${template.primaryColor}, ${template.secondaryColor})`,
                                backgroundImage: template.pattern ? `url(${template.pattern})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            />
                            <div className="text-center">
                              <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                              <p className="text-xs text-gray-500">{template.description}</p>
                            </div>
                            {selectedTemplate?.Id === template.Id && (
                              <div className="flex justify-center">
                                <Badge variant="success" size="sm">
                                  <ApperIcon name="Check" size={12} />
                                  Selected
                                </Badge>
                              </div>
                            )}
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Message & Details */}
            <div className="space-y-6">
              <Card className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ApperIcon name="MessageSquare" size={20} />
                  Personal Message
                </h2>

                <div className="space-y-4">
                  <Input
                    label="From"
                    placeholder="Your name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                  />

                  <Input
                    label="To (optional)"
                    placeholder="Recipient's name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 ease-out focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/20 focus:outline-none hover:border-gray-300 resize-none"
                      rows="4"
                      placeholder="Write your heartfelt message here..."
                      value={personalMessage}
                      onChange={(e) => setPersonalMessage(e.target.value)}
                      maxLength="300"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">Make it personal and meaningful!</p>
                      <span className="text-xs text-gray-400">{personalMessage.length}/300</span>
                    </div>
                  </div>

                  {/* Quick Message Suggestions */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Happy Birthday! Hope you love this! 🎉",
                        "Thinking of you ❤️",
                        "Hope this brings a smile to your face! 😊",
                        "Just because you're amazing! ✨"
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setPersonalMessage(suggestion)}
                          className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Preview & Actions */}
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ApperIcon name="Eye" size={18} />
                  Preview & Share
                </h3>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsPreviewMode(true)}
                    disabled={!selectedTemplate || !personalMessage.trim()}
                    icon="Eye"
                  >
                    Preview Wrapped Gift
                  </Button>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleSaveWrappedGift}
                    disabled={!selectedTemplate || !personalMessage.trim() || !senderName.trim() || isSaving}
                    icon={isSaving ? "Loader2" : "Gift"}
                  >
                    {isSaving ? 'Wrapping Gift...' : 'Wrap & Share Gift'}
                  </Button>
                </div>

                <div className="text-xs text-center text-gray-500 space-y-1">
                  <p>✨ Your gift will be beautifully wrapped and ready to share</p>
                  <p>🎁 Recipients will see your personalized message</p>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gift Preview</h2>
              <p className="text-gray-600">See how your wrapped gift will look</p>
            </div>

            <Card className="p-8 text-center space-y-6">
              {/* Wrapped Gift Visualization */}
              <div className="relative mx-auto w-64 h-64">
                <div 
                  className="w-full h-full rounded-xl shadow-lg transform rotate-3"
                  style={{ 
                    background: selectedTemplate?.gradient || `linear-gradient(135deg, ${selectedTemplate?.primaryColor}, ${selectedTemplate?.secondaryColor})`,
                    backgroundImage: selectedTemplate?.pattern ? `url(${selectedTemplate?.pattern})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-2 bg-yellow-400 rounded-full shadow-md"></div>
                  <div className="w-2 h-16 bg-yellow-400 rounded-full shadow-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute -top-2 -right-2"
                >
                  <ApperIcon name="Sparkles" size={24} className="text-yellow-500" />
                </motion.div>
              </div>

              {/* Gift Card */}
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">To: {recipientName || 'Special Someone'}</p>
                    <p className="text-sm text-gray-600">From: {senderName}</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-800 italic">"{personalMessage}"</p>
                  </div>
                </div>
              </Card>

              {/* Gift Details */}
              {gift && (
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-gray-900">{gift.title}</h3>
                  <p className="text-sm text-gray-600">${gift.price}</p>
                  <Badge variant="accent" size="sm">Wrapped with {selectedTemplate?.name}</Badge>
                </div>
              )}
            </Card>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setIsPreviewMode(false)}
                icon="ArrowLeft"
              >
                Back to Edit
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveWrappedGift}
                disabled={isSaving}
                icon={isSaving ? "Loader2" : "Share2"}
              >
                {isSaving ? 'Wrapping...' : 'Share Wrapped Gift'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VirtualWrapping;