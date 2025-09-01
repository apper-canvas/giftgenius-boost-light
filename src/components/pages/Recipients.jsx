import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import RecipientCard from "@/components/molecules/RecipientCard";
import GiftResults from "@/components/organisms/GiftResults";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { recipientService } from "@/services/api/recipientService";
import { toast } from "react-toastify";

const Recipients = () => {
  const [recipients, setRecipients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [selectedRecipient, setSelectedRecipient] = React.useState(null);
  const [selectedOccasion, setSelectedOccasion] = React.useState(null);
  
  const location = useLocation();

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    relationship: "",
    age: "",
    interests: "",
    location: "",
    occasionType: "",
    occasionDate: "",
    budget: "",
    notes: ""
  });

  React.useEffect(() => {
    loadRecipients();
    
    // Check if we have a selected recipient from navigation state
    if (location.state?.selectedRecipient) {
      setSelectedRecipient(location.state.selectedRecipient);
      if (location.state.selectedRecipient.occasions?.[0]) {
        setSelectedOccasion(location.state.selectedRecipient.occasions[0]);
      }
    }
  }, [location.state]);

  const loadRecipients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await recipientService.getAll();
      setRecipients(data);
    } catch (err) {
      setError("Failed to load recipients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.relationship || !formData.age) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const newRecipient = {
        name: formData.name,
        relationship: formData.relationship,
        age: parseInt(formData.age),
        interests: formData.interests.split(",").map(i => i.trim()).filter(Boolean),
        location: formData.location,
        photoUrl: "", // Will be generated based on name
        occasions: formData.occasionType ? [{
          type: formData.occasionType,
          date: formData.occasionDate,
          budget: formData.budget ? parseInt(formData.budget) : null,
          notes: formData.notes
        }] : [],
        giftHistory: []
      };

      const created = await recipientService.create(newRecipient);
      setRecipients(prev => [created, ...prev]);
      setShowAddForm(false);
      setFormData({
        name: "",
        relationship: "",
        age: "",
        interests: "",
        location: "",
        occasionType: "",
        occasionDate: "",
        budget: "",
        notes: ""
      });
      
      toast.success(`${created.name} has been added to your recipients!`);
    } catch (err) {
      toast.error("Failed to add recipient. Please try again.");
    }
  };

const handleFindGifts = async (recipient) => {
    // Track user interaction for learning
    try {
      await recipientService.trackInteraction(recipient.Id, 'view');
    } catch (error) {
      console.warn('Could not track interaction:', error);
    }
    
    setSelectedRecipient(recipient);
    // Use the first occasion or create a default one
    if (recipient.occasions && recipient.occasions.length > 0) {
      setSelectedOccasion(recipient.occasions[0]);
    } else {
      // Create a default occasion for gift searching
      setSelectedOccasion({
        Id: 1,
        type: "General",
        date: new Date().toISOString(),
        budget: 100,
        notes: ""
      });
    }
  };

  const handleBackToRecipients = () => {
    setSelectedRecipient(null);
    setSelectedOccasion(null);
  };

const filteredRecipients = recipients.filter(recipient =>
    (recipient.name || recipient.Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipient.relationship || recipient.Relationship || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((recipient.interests || recipient.Interests || []).some(interest => 
      (interest || '').toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const handleCreateGroupGift = (recipient) => {
    // Navigate to group gifts page with recipient pre-selected
    window.location.href = `/group-gifts?recipient=${recipient.Id}`;
  };

  // If we have a selected recipient and occasion, show gift results
  if (selectedRecipient && selectedOccasion) {
    return (
      <GiftResults 
        recipient={selectedRecipient}
        occasion={selectedOccasion}
        onBack={handleBackToRecipients}
      />
    );
  }

  if (loading) return <Loading message="Loading your recipients..." />;
  if (error) return <Error message={error} onRetry={loadRecipients} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Your Recipients
          </h1>
          <p className="text-gray-600 mt-1">
            Manage the special people in your life and find perfect gifts for them
          </p>
        </div>
        
        <Button 
          variant="primary" 
          icon="Plus"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Recipient
        </Button>
      </div>

      {/* Add Recipient Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <form onSubmit={handleAddRecipient} className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <ApperIcon name="UserPlus" className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Add New Recipient</h3>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Name *"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter their name"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/20 focus:outline-none transition-all duration-200"
                  >
                    <option value="">Select relationship</option>
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Partner">Partner</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Acquaintance">Acquaintance</option>
                  </select>
                </div>

                <Input
                  label="Age *"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter their age"
                />

                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>

              <Input
                label="Interests (comma-separated)"
                value={formData.interests}
                onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                placeholder="music, books, cooking, travel, technology"
              />

              {/* Optional Occasion */}
              <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <ApperIcon name="Calendar" size={18} />
                  <span>Add Upcoming Occasion (Optional)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occasion Type
                    </label>
                    <select
                      value={formData.occasionType}
                      onChange={(e) => setFormData(prev => ({ ...prev, occasionType: e.target.value }))}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:border-secondary-400 focus:ring-1 focus:ring-secondary-400 focus:outline-none"
                    >
                      <option value="">Select occasion</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Graduation">Graduation</option>
                      <option value="Christmas">Christmas</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Thank You">Thank You</option>
                    </select>
                  </div>

                  <Input
                    label="Date"
                    type="date"
                    value={formData.occasionDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, occasionDate: e.target.value }))}
                  />

                  <Input
                    label="Budget ($)"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="100"
                  />

                  <Input
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special notes..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" icon="Plus">
                  Add Recipient
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Search */}
      {recipients.length > 0 && (
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <SearchBar
              placeholder="Search recipients..."
              onSearch={setSearchTerm}
            />
          </div>
        </div>
      )}

      {/* Recipients Grid */}
      {filteredRecipients.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredRecipients.map((recipient, index) => (
            <motion.div
              key={recipient.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <RecipientCard
                recipient={recipient}
                onFindGifts={handleFindGifts}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : recipients.length > 0 ? (
        <Empty
          icon="Search"
          title="No recipients found"
          description={`No recipients match "${searchTerm}". Try adjusting your search terms.`}
          action={
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          }
        />
      ) : (
        <Empty
          icon="Users"
          title="No recipients yet"
          description="Start by adding someone special to your recipients list. Our AI will help you find perfect gifts for any occasion."
          action={
            <Button variant="primary" icon="Plus" onClick={() => setShowAddForm(true)}>
              Add Your First Recipient
            </Button>
          }
        />
      )}
    </div>
  );
};

export default Recipients;