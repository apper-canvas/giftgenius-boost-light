import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Avatar from '@/components/atoms/Avatar';
import Input from '@/components/atoms/Input';
import SearchBar from '@/components/molecules/SearchBar';
import SocialConnectModal from '@/components/molecules/SocialConnectModal';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { socialGiftService } from '@/services/api/socialGiftService';
import { recipientService } from '@/services/api/recipientService';
import { giftService } from '@/services/api/giftService';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';

const SocialGifting = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [sharedWishlists, setSharedWishlists] = useState([]);
  const [giftActivities, setGiftActivities] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState('all');
  const [showSocialModal, setShowSocialModal] = useState(false);
const [showShareModal, setShowShareModal] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [wrappedGifts, setWrappedGifts] = useState([]);

  const preSelectedRecipientId = searchParams.get('recipient');

  useEffect(() => {
    loadData();
    if (preSelectedRecipientId) {
      setActiveTab('activities');
    }
  }, [preSelectedRecipientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsData, wishlistsData, activitiesData, recipientsData, giftsData] = await Promise.all([
        socialGiftService.getFriends(),
        socialGiftService.getSharedWishlists(),
        socialGiftService.getGiftActivities(),
        recipientService.getAll(),
        giftService.getAll()
      ]);
      
      setFriends(friendsData);
      setSharedWishlists(wishlistsData);
      setGiftActivities(activitiesData);
      setRecipients(recipientsData);
      setGifts(giftsData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load social data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!newFriendEmail.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const newFriend = await socialGiftService.addFriend({
        email: newFriendEmail,
        name: newFriendEmail.split('@')[0]
      });
      
      setFriends(prev => [newFriend, ...prev]);
      setNewFriendEmail('');
      toast.success(`Friend request sent to ${newFriendEmail}`);
    } catch (err) {
      toast.error('Failed to send friend request');
    }
  };

  const handleCreateWishlist = async () => {
    const title = prompt('Enter wishlist title:');
    if (!title) return;

    try {
      const newWishlist = await socialGiftService.createSharedWishlist({
        title,
        description: '',
        isPublic: false,
        allowContributions: true
      });
      
      setSharedWishlists(prev => [newWishlist, ...prev]);
      toast.success('Wishlist created successfully!');
    } catch (err) {
      toast.error('Failed to create wishlist');
    }
  };

const handleShareGift = async (giftId, friendIds) => {
    try {
      await socialGiftService.shareGift(giftId, friendIds);
      
      // Send notifications to friends about the shared gift
      for (const friendId of friendIds) {
        await socialGiftService.sendFriendActivityNotification(friendId, 'shared_gift', { giftId });
      }
      
      toast.success('Gift shared successfully!');
      loadData();
    } catch (err) {
      toast.error('Failed to share gift');
    }
  };

  const handleWrapGift = (gift) => {
    window.open(`/virtual-wrapping?giftId=${gift.Id}`, '_blank');
    toast.info('Opening gift wrapping studio...');
  };

  const handleToggleWishlistPrivacy = async (wishlistId, isPublic) => {
    try {
      await socialGiftService.updateWishlistPrivacy(wishlistId, !isPublic);
      setSharedWishlists(prev => 
        prev.map(w => w.Id === wishlistId ? { ...w, isPublic: !isPublic } : w)
      );
      toast.success(`Wishlist ${!isPublic ? 'made public' : 'made private'}`);
    } catch (err) {
      toast.error('Failed to update privacy settings');
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWishlists = sharedWishlists.filter(wishlist => {
    const matchesSearch = wishlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wishlist.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrivacy = privacyFilter === 'all' || 
                          (privacyFilter === 'public' && wishlist.isPublic) ||
                          (privacyFilter === 'private' && !wishlist.isPublic);
    return matchesSearch && matchesPrivacy;
  });

  const filteredActivities = giftActivities.filter(activity => {
    const matchesSearch = activity.giftTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.friendName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRecipient = !preSelectedRecipientId || 
                           activity.recipientId === parseInt(preSelectedRecipientId);
    
    return matchesSearch && matchesRecipient;
  });

  if (loading) return <Loading message="Loading your social network..." />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const tabs = [
    { id: 'friends', label: 'Friends', icon: 'Users', count: friends.length },
    { id: 'wishlists', label: 'Shared Wishlists', icon: 'Heart', count: sharedWishlists.length },
    { id: 'activities', label: 'Gift Activities', icon: 'Activity', count: giftActivities.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text">Social Gifting</h1>
          <p className="text-gray-600 mt-1">
            Connect with friends, share gift ideas, and see what others are gifting
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="accent"
            icon="Link"
            onClick={() => setShowSocialModal(true)}
          >
            Connect Social Media
          </Button>
          <Button
            variant="primary"
            icon="Plus"
            onClick={handleCreateWishlist}
          >
            Create Wishlist
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ApperIcon name="Users" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Friends</p>
              <p className="text-2xl font-bold text-gray-900">{friends.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ApperIcon name="Heart" size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Shared Wishlists</p>
              <p className="text-2xl font-bold text-gray-900">{sharedWishlists.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ApperIcon name="Share2" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Activities</p>
              <p className="text-2xl font-bold text-gray-900">{giftActivities.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
              <Badge variant="outline" size="sm">{tab.count}</Badge>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-96">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Search ${activeTab}...`}
          />
        </div>
        
        {activeTab === 'wishlists' && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Privacy:</span>
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'public', label: 'Public' },
                { key: 'private', label: 'Private' }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={privacyFilter === filter.key ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setPrivacyFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Sections */}
      {activeTab === 'friends' && (
        <div className="space-y-6">
          {/* Add Friend */}
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Input
                placeholder="Enter friend's email address"
                value={newFriendEmail}
                onChange={(e) => setNewFriendEmail(e.target.value)}
                className="flex-1"
              />
              <Button variant="primary" onClick={handleAddFriend} icon="UserPlus">
                Add Friend
              </Button>
            </div>
          </Card>

          {/* Friends List */}
          {filteredFriends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((friend, index) => (
                <motion.div
                  key={friend.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={friend.photoUrl}
                        alt={friend.name}
                        fallback={friend.name[0]}
                        size="md"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{friend.name}</h3>
                        <p className="text-sm text-gray-600">{friend.email}</p>
                      </div>
                      <Badge variant={friend.status === 'connected' ? 'success' : 'outline'} size="sm">
                        {friend.status}
                      </Badge>
                    </div>

                    {friend.mutualFriends > 0 && (
                      <p className="text-xs text-gray-500">
                        {friend.mutualFriends} mutual friends
                      </p>
                    )}

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Joined {format(parseISO(friend.joinedAt), 'MMM yyyy')}</span>
                      {friend.lastActive && (
                        <span>Active {format(parseISO(friend.lastActive), 'MMM d')}</span>
                      )}
                    </div>

<div className="flex gap-2">
                      <Button variant="primary" size="sm" className="flex-1">
                        <ApperIcon name="MessageCircle" size={14} />
                        Message
                      </Button>
                      <Button 
                        variant="accent" 
                        size="sm"
                        onClick={() => window.open('/virtual-wrapping', '_blank')}
                      >
                        <ApperIcon name="Gift" size={14} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ApperIcon name="MoreHorizontal" size={14} />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Empty
              icon="Users"
              title="No friends found"
              description="Start building your social network by adding friends via email."
              action={
                <Button variant="primary" icon="UserPlus" onClick={() => document.querySelector('input').focus()}>
                  Add Your First Friend
                </Button>
              }
            />
          )}
        </div>
      )}

      {activeTab === 'wishlists' && (
        <div className="space-y-4">
          {filteredWishlists.length > 0 ? (
            <div className="space-y-4">
              {filteredWishlists.map((wishlist, index) => (
                <motion.div
                  key={wishlist.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{wishlist.title}</h3>
                          <Badge variant={wishlist.isPublic ? 'success' : 'outline'} size="sm">
                            {wishlist.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                        {wishlist.description && (
                          <p className="text-gray-600 mb-3">{wishlist.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <ApperIcon name="Gift" size={14} />
                            <span>{wishlist.items.length} items</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <ApperIcon name="Users" size={14} />
                            <span>{wishlist.collaborators.length} collaborators</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <ApperIcon name="Calendar" size={14} />
                            <span>{format(parseISO(wishlist.createdAt), 'MMM d, yyyy')}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={wishlist.isPublic ? "Eye" : "EyeOff"}
                          onClick={() => handleToggleWishlistPrivacy(wishlist.Id, wishlist.isPublic)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="MoreHorizontal"
                        />
                      </div>
                    </div>

                    {/* Collaborators */}
                    {wishlist.collaborators.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Collaborators</p>
                        <div className="flex flex-wrap gap-2">
                          {wishlist.collaborators.map((collaborator) => (
                            <div key={collaborator.Id} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                              <Avatar
                                fallback={collaborator.name[0]}
                                size="xs"
                              />
                              <span className="text-sm">{collaborator.name}</span>
                              {collaborator.role === 'owner' && (
                                <Badge variant="primary" size="xs">Owner</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Items Preview */}
                    {wishlist.items.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Recent Items</p>
                        <div className="flex space-x-3">
                          {wishlist.items.slice(0, 3).map((item) => (
                            <div key={item.Id} className="flex items-center space-x-2 bg-white border rounded-lg p-2 text-sm">
                              <ApperIcon name="Gift" size={14} className="text-gray-400" />
                              <span className="truncate max-w-32">{item.title}</span>
                              <span className="font-medium text-green-600">${item.price}</span>
                            </div>
                          ))}
                          {wishlist.items.length > 3 && (
                            <div className="flex items-center justify-center bg-gray-100 border rounded-lg p-2 text-sm text-gray-500">
                              +{wishlist.items.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="primary" size="sm" icon="Eye">
                        View Wishlist
                      </Button>
                      <Button variant="secondary" size="sm" icon="UserPlus">
                        Invite Friends
                      </Button>
                      <Button variant="outline" size="sm" icon="Share2">
                        Share Link
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Empty
              icon="Heart"
              title="No wishlists found"
              description="Create shared wishlists to collaborate on gift ideas with friends."
              action={
                <Button variant="primary" icon="Plus" onClick={handleCreateWishlist}>
                  Create Your First Wishlist
                </Button>
              }
            />
          )}
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-4">
          {preSelectedRecipientId && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-3">
                <ApperIcon name="Info" size={20} className="text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    Showing gift activities for {recipients.find(r => r.Id === parseInt(preSelectedRecipientId))?.name}
                  </p>
                  <p className="text-sm text-blue-700">
                    See what your friends have gifted to this person
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.history.back()}
                  icon="X"
                />
              </div>
            </Card>
          )}

          {filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
<motion.div
                  key={activity.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <Avatar
                        src={activity.friendPhotoUrl}
                        alt={activity.friendName}
                        fallback={activity.friendName[0]}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">{activity.friendName}</p>
                          <Badge variant={activity.type === 'gifted' ? 'success' : activity.type === 'suggested' ? 'accent' : activity.type === 'wrapped' ? 'primary' : 'outline'} size="sm">
                            {activity.type === 'wrapped' ? 'wrapped gift' : activity.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {activity.type === 'gifted' 
                            ? `gifted "${activity.giftTitle}" to ${activity.recipientName}`
                            : activity.type === 'suggested'
                            ? `suggested "${activity.giftTitle}" for ${activity.recipientName}`
                            : activity.type === 'wrapped'
                            ? `wrapped "${activity.giftTitle}" with a personal message`
                            : `shared "${activity.giftTitle}"`
                          }
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{format(parseISO(activity.timestamp), 'MMM d, yyyy')}</span>
                          {activity.occasion && <span>• {activity.occasion}</span>}
                          {activity.price && (
                            <span className="font-medium text-green-600">• ${activity.price}</span>
                          )}
                          {activity.wrappingStyle && (
                            <span className="flex items-center space-x-1 text-purple-600">
                              <ApperIcon name="Gift" size={12} />
                              <span>{activity.wrappingStyle}</span>
                            </span>
                          )}
                          {activity.privacy === 'private' && (
                            <span className="flex items-center space-x-1 text-amber-600">
                              <ApperIcon name="Lock" size={12} />
                              <span>Private</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {activity.canView && (
                          <Button variant="outline" size="sm" icon="Eye">
                            View
                          </Button>
                        )}
                        {activity.type !== 'wrapped' && (
                          <Button 
                            variant="accent" 
                            size="sm" 
                            icon="Gift"
                            onClick={() => window.open(`/virtual-wrapping?giftId=${activity.giftId}`, '_blank')}
                          >
                            Wrap
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" icon="MoreHorizontal" />
                      </div>
                    </div>

                    {activity.notes && (
                      <div className="ml-12 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">"{activity.notes}"</p>
                      </div>
                    )}

                    {activity.reactions && activity.reactions.length > 0 && (
                      <div className="ml-12 flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Heart" size={14} className="text-red-500" />
                          <span className="text-sm text-gray-600">{activity.reactions.filter(r => r.type === 'like').length}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="MessageCircle" size={14} className="text-blue-500" />
                          <span className="text-sm text-gray-600">{activity.reactions.filter(r => r.type === 'comment').length}</span>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Empty
              icon="Activity"
              title="No gift activities"
              description={preSelectedRecipientId 
                ? "No friends have shared gifts for this recipient yet."
                : "No recent gift activities from your friends."
              }
            />
          )}
        </div>
      )}

      {/* Social Connect Modal */}
      <SocialConnectModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />
    </div>
  );
};

export default SocialGifting;