import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const SocialConnectModal = ({ isOpen, onClose }) => {
  const [connections, setConnections] = useState({
    instagram: { connected: false, importing: false },
    facebook: { connected: false, importing: false },
    twitter: { connected: false, importing: false },
    pinterest: { connected: false, importing: false },
    tiktok: { connected: false, importing: false }
  });

const [importPreferences, setImportPreferences] = useState({
    posts: true,
    likes: true,
    saved: true,
    follows: false,
    stories: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    shareWithApp: true,
    anonymizeData: false,
    deleteAfterImport: false,
    updateUserProfile: true
  });

  const [isImporting, setIsImporting] = useState(false);

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'Instagram',
      color: 'from-pink-500 to-purple-600',
      description: 'Import posts, stories, and saved items to understand your style preferences'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'Facebook',
      color: 'from-blue-500 to-blue-600',
      description: 'Analyze your interests, pages you like, and event participation'
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: 'Twitter',
      color: 'from-gray-700 to-gray-900',
      description: 'Review your tweets, likes, and followed accounts for interest insights'
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: 'Pinterest',
      color: 'from-red-500 to-red-600',
      description: 'Access your boards and pins to understand your aesthetic preferences'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'Video',
      color: 'from-black to-gray-800',
      description: 'Analyze your liked videos and followed creators for trending interests'
    }
  ];

  const handleConnect = async (platformId) => {
    setConnections(prev => ({
      ...prev,
      [platformId]: { ...prev[platformId], importing: true }
    }));

    // Simulate OAuth flow
    setTimeout(() => {
      setConnections(prev => ({
        ...prev,
        [platformId]: { connected: true, importing: false }
      }));
      
      const platform = platforms.find(p => p.id === platformId);
      toast.success(`Successfully connected to ${platform.name}!`);
    }, 2000);
  };

  const handleDisconnect = (platformId) => {
    setConnections(prev => ({
      ...prev,
      [platformId]: { connected: false, importing: false }
    }));
    
    const platform = platforms.find(p => p.id === platformId);
    toast.info(`Disconnected from ${platform.name}`);
  };

const handleImportWishlists = async () => {
    const connectedPlatforms = Object.entries(connections)
      .filter(([_, data]) => data.connected)
      .map(([platform, _]) => platform);

    if (connectedPlatforms.length === 0) {
      toast.warning('Please connect at least one social media account first');
      return;
    }

    setIsImporting(true);
    
    // Simulate import process with user preference integration
    setTimeout(async () => {
      setIsImporting(false);
      
      if (privacySettings.updateUserProfile) {
        try {
          // Update user preferences based on imported data
          const { userService } = await import('@/services/api/userService');
          await userService.updatePreferences({
            importedFrom: connectedPlatforms,
            lastImport: new Date().toISOString()
          });
        } catch (error) {
          console.warn('Could not update user preferences:', error);
        }
      }
      
      toast.success(`Successfully imported wishlists from ${connectedPlatforms.length} platform(s)!`);
      onClose();
    }, 3000);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const connectedCount = Object.values(connections).filter(conn => conn.connected).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <Card className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Connect Social Media</h2>
<p className="text-gray-600 mt-1">
                Import your wishlists and preferences from social platforms to get better gift suggestions and share with friends
              </p>
              {connectedCount > 0 && (
                <Badge variant="success" className="mt-2">
                  {connectedCount} platform{connectedCount !== 1 ? 's' : ''} connected
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon="X"
              onClick={onClose}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Connections */}
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ApperIcon name="Link" size={20} />
                Available Platforms
              </h3>

              <div className="space-y-4">
                {platforms.map((platform) => {
                  const connectionData = connections[platform.id];
                  const isConnected = connectionData.connected;
                  const isConnecting = connectionData.importing;

                  return (
                    <Card key={platform.id} className="p-4 border-2 hover:border-purple-200 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-12 h-12 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center`}>
                            <ApperIcon name={platform.icon} size={20} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{platform.name}</h4>
                              {isConnected && (
                                <Badge variant="success" size="sm">
                                  <ApperIcon name="Check" size={12} />
                                  Connected
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                          </div>
                        </div>
                        <div className="ml-3">
                          {isConnected ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnect(platform.id)}
                              icon="Unlink"
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleConnect(platform.id)}
                              disabled={isConnecting}
                              icon={isConnecting ? "Loader2" : "Link"}
                            >
                              {isConnecting ? 'Connecting...' : 'Connect'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Settings and Preferences */}
            <div className="space-y-6">
              {/* Import Preferences */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="Settings" size={20} />
                  Import Preferences
                </h3>
                <Card className="p-4">
                  <div className="space-y-3">
                    {[
                      { key: 'posts', label: 'Posts & Content', desc: 'Analyze your posts for interests' },
                      { key: 'likes', label: 'Likes & Reactions', desc: 'Review items you\'ve liked' },
                      { key: 'saved', label: 'Saved Items', desc: 'Import your saved/bookmarked content' },
                      { key: 'follows', label: 'Followed Accounts', desc: 'Analyze accounts you follow' },
                      { key: 'stories', label: 'Story Interactions', desc: 'Include story views and reactions' }
                    ].map((pref) => (
<label key={pref.key} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={importPreferences[pref.key]}
                          onChange={(e) => setImportPreferences(prev => ({
                            ...prev,
                            [pref.key]: e.target.checked
                          }))}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-0.5"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">{pref.label}</span>
                          <p className="text-xs text-gray-500">{pref.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Privacy Settings */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="Shield" size={20} />
                  Privacy & Security
                </h3>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 mb-1">
                        <ApperIcon name="Info" size={16} />
                        <span className="text-sm font-medium">Data Usage</span>
                      </div>
                      <p className="text-xs text-blue-700">
                        We only analyze your public content and preferences. Private data remains private.
                      </p>
                    </div>

                    <div className="space-y-3">
{[
                        { key: 'shareWithApp', label: 'Allow data sharing with gift recommendations', desc: 'Enable for personalized suggestions' },
                        { key: 'anonymizeData', label: 'Anonymize imported data', desc: 'Remove personal identifiers' },
                        { key: 'deleteAfterImport', label: 'Delete data after processing', desc: 'Remove imported data once analyzed' },
                        { key: 'updateUserProfile', label: 'Update my account preferences', desc: 'Sync imported preferences with your profile' }
                      ].map((setting) => (
                        <label key={setting.key} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings[setting.key]}
                            onChange={(e) => setPrivacySettings(prev => ({
                              ...prev,
                              [setting.key]: e.target.checked
                            }))}
                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 mt-0.5"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                            <p className="text-xs text-gray-500">{setting.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Import Action */}
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="text-center space-y-3">
                  <ApperIcon name="Sparkles" size={32} className="mx-auto text-purple-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Ready to Import?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Connect your accounts and import wishlists to get AI-powered gift suggestions
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleImportWishlists}
                    disabled={isImporting || connectedCount === 0}
                    icon={isImporting ? "Loader2" : "Download"}
                    className="w-full"
                  >
                    {isImporting ? 'Importing Wishlists...' : 'Import Wishlists'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <div className="text-xs text-gray-500">
              <ApperIcon name="Lock" size={12} className="inline mr-1" />
              Your data is encrypted and secure
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SocialConnectModal;