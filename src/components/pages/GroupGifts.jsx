import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Avatar from '@/components/atoms/Avatar';
import SearchBar from '@/components/molecules/SearchBar';
import GroupGiftModal from '@/components/molecules/GroupGiftModal';
import ContributorModal from '@/components/molecules/ContributorModal';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { groupGiftService } from '@/services/api/groupGiftService';
import { recipientService } from '@/services/api/recipientService';
import { giftService } from '@/services/api/giftService';
import { toast } from 'react-toastify';
import { format, parseISO, isPast } from 'date-fns';

const GroupGifts = () => {
  const [searchParams] = useSearchParams();
  const [groupGifts, setGroupGifts] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributorModal, setShowContributorModal] = useState(false);
  const [selectedGroupGift, setSelectedGroupGift] = useState(null);
  const [stats, setStats] = useState(null);

  const preSelectedRecipientId = searchParams.get('recipient');
  const preSelectedGiftId = searchParams.get('gift');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupGiftsData, recipientsData, giftsData, statsData] = await Promise.all([
        groupGiftService.getAll(),
        recipientService.getAll(),
        giftService.getAll(),
        groupGiftService.getContributionStats()
      ]);
      
      setGroupGifts(groupGiftsData);
      setRecipients(recipientsData);
      setGifts(giftsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load group gifts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroupGift = async (groupGiftData) => {
    try {
      const newGroupGift = await groupGiftService.create(groupGiftData);
      setGroupGifts(prev => [newGroupGift, ...prev]);
      setShowCreateModal(false);
      toast.success('Group gift created successfully!');
      
      // Auto-invite if emails provided
      if (groupGiftData.invitedContributors && groupGiftData.invitedContributors.length > 0) {
        await groupGiftService.inviteContributors(newGroupGift.Id, groupGiftData.invitedContributors);
        toast.info(`Invitations sent to ${groupGiftData.invitedContributors.length} people`);
      }
      
      await loadData();
    } catch (err) {
      toast.error('Failed to create group gift');
    }
  };

  const handleAddContribution = async (contributionData) => {
    try {
      await groupGiftService.addContribution(selectedGroupGift.Id, contributionData);
      setShowContributorModal(false);
      setSelectedGroupGift(null);
      toast.success('Contribution added successfully!');
      await loadData();
    } catch (err) {
      toast.error('Failed to add contribution');
    }
  };

  const handleInviteMore = async (groupGiftId, invitations) => {
    try {
      const newInvitations = await groupGiftService.inviteContributors(groupGiftId, invitations);
      toast.success(`Sent ${newInvitations.length} new invitations`);
      await loadData();
    } catch (err) {
      toast.error('Failed to send invitations');
    }
  };

  const handleDeleteGroupGift = async (id) => {
    if (window.confirm('Are you sure you want to delete this group gift?')) {
      try {
        await groupGiftService.delete(id);
        setGroupGifts(prev => prev.filter(g => g.Id !== id));
        toast.success('Group gift deleted successfully');
      } catch (err) {
        toast.error('Failed to delete group gift');
      }
    }
  };

  const getRecipientName = (recipientId) => {
    const recipient = recipients.find(r => r.Id === recipientId);
    return recipient?.name || 'Unknown Recipient';
  };

  const getGiftName = (giftId) => {
    if (!giftId) return null;
    const gift = gifts.find(g => g.Id === giftId);
    return gift?.name || 'Unknown Gift';
  };

  const filteredGroupGifts = groupGifts.filter(groupGift => {
    const matchesSearch = 
(groupGift.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRecipientName(groupGift.recipientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (groupGift.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || groupGift.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status, deadline) => {
    if (status === 'completed') return 'success';
    if (isPast(parseISO(deadline))) return 'error';
    return 'accent';
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Group Gifts</h1>
          <p className="text-gray-600 mt-1">Collaborate on meaningful gifts together</p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowCreateModal(true)}
        >
          Create Group Gift
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <ApperIcon name="Users2" size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGroupGifts}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent-100 rounded-lg">
                <ApperIcon name="Clock" size={20} className="text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeGroupGifts}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ApperIcon name="CheckCircle" size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedGroupGifts}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <ApperIcon name="DollarSign" size={20} className="text-secondary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Raised</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toFixed(0)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-96">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search group gifts..."
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Status:</span>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All', count: groupGifts.length },
              { key: 'active', label: 'Active', count: groupGifts.filter(g => g.status === 'active').length },
              { key: 'completed', label: 'Completed', count: groupGifts.filter(g => g.status === 'completed').length }
            ].map(filter => (
              <Button
                key={filter.key}
                variant={statusFilter === filter.key ? "primary" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(filter.key)}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Group Gifts Grid */}
      {filteredGroupGifts.length === 0 ? (
        <Empty 
          message={searchTerm || statusFilter !== 'all' ? "No group gifts match your criteria" : "No group gifts created yet"}
          action={{
            label: "Create First Group Gift",
            onClick: () => setShowCreateModal(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGroupGifts.map((groupGift, index) => (
            <motion.div
              key={groupGift.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{groupGift.title}</h3>
                    <p className="text-gray-600 mt-1">For {getRecipientName(groupGift.recipientId)}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={getStatusColor(groupGift.status, groupGift.deadline)}>
                        {groupGift.status}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {groupGift.occasionType}
                      </Badge>
                      {getGiftName(groupGift.giftId) && (
                        <Badge variant="secondary" size="sm">
                          {getGiftName(groupGift.giftId)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="MoreHorizontal"
                      onClick={() => handleDeleteGroupGift(groupGift.Id)}
                    />
                  </div>
                </div>

                {/* Description */}
                {groupGift.description && (
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                    {groupGift.description}
                  </p>
                )}

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      ${groupGift.currentAmount} / ${groupGift.targetAmount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(groupGift.currentAmount, groupGift.targetAmount)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {getProgressPercentage(groupGift.currentAmount, groupGift.targetAmount).toFixed(1)}% complete
                  </p>
                </div>

                {/* Contributors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Contributors ({groupGift.contributors.length})
                    </span>
                    {groupGift.invitedContributors.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {groupGift.invitedContributors.length} invited
                      </span>
                    )}
                  </div>
                  
                  {groupGift.contributors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {groupGift.contributors.slice(0, 3).map((contributor) => (
                        <div key={contributor.Id} className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
                          <Avatar
                            fallback={contributor.name[0]}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-medium">{contributor.name}</p>
                            <p className="text-xs text-green-600">${contributor.amount}</p>
                          </div>
                        </div>
                      ))}
                      {groupGift.contributors.length > 3 && (
                        <div className="flex items-center justify-center bg-gray-100 p-2 rounded-lg border text-sm text-gray-600">
                          +{groupGift.contributors.length - 3} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No contributions yet</p>
                  )}
                </div>

                {/* Deadline */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ApperIcon name="Calendar" size={14} />
                  <span>Deadline: {format(parseISO(groupGift.deadline), 'MMM d, yyyy')}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon="Plus"
                    onClick={() => {
                      setSelectedGroupGift(groupGift);
                      setShowContributorModal(true);
                    }}
                  >
                    Add Contribution
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="UserPlus"
                    onClick={() => {
                      const emails = prompt('Enter email addresses (comma separated):');
                      if (emails) {
                        const invitations = emails.split(',')
                          .map(email => ({ email: email.trim() }))
                          .filter(inv => inv.email);
                        handleInviteMore(groupGift.Id, invitations);
                      }
                    }}
                  >
                    Invite Contributors
                  </Button>
                  
                  {groupGift.giftId && (
                    <Button
                      variant="accent"
                      size="sm"
                      icon="ExternalLink"
                      onClick={() => toast.info('Redirecting to gift purchase...')}
                    >
                      Buy Gift
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <GroupGiftModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroupGift}
          recipients={recipients}
          gifts={gifts}
          preSelectedRecipientId={preSelectedRecipientId}
          preSelectedGiftId={preSelectedGiftId}
        />
      )}

      {showContributorModal && selectedGroupGift && (
        <ContributorModal
          isOpen={showContributorModal}
          onClose={() => {
            setShowContributorModal(false);
            setSelectedGroupGift(null);
          }}
          onSubmit={handleAddContribution}
          groupGift={selectedGroupGift}
        />
      )}
    </div>
  );
};

export default GroupGifts;