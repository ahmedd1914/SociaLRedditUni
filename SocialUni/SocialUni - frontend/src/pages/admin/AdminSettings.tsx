import React, { useState } from 'react';
import { MdSettings, MdSave, MdRefresh } from 'react-icons/md';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'SocialUni',
    siteDescription: 'A social media platform for university students',
    maintenance: false,
    registrationOpen: true,
    maxFileSize: 5,
    postReportThreshold: 5,
    commentReportThreshold: 3,
    defaultTimeZone: 'UTC',
    emailVerificationRequired: true
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : 
              value
    }));
    
    setSaved(false);
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      // Clear saved status after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleReset = () => {
    // Reset to defaults
    setSettings({
      siteName: 'SocialUni',
      siteDescription: 'A social media platform for university students',
      maintenance: false,
      registrationOpen: true,
      maxFileSize: 5,
      postReportThreshold: 5,
      commentReportThreshold: 3,
      defaultTimeZone: 'UTC',
      emailVerificationRequired: true
    });
    setSaved(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <MdSettings className="text-2xl mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Admin Settings</h1>
      </div>

      <div className="bg-base-100 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Site Name</span>
            </label>
            <input 
              type="text" 
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className="input input-bordered w-full" 
            />
          </div>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Default Timezone</span>
            </label>
            <select 
              name="defaultTimeZone"
              value={settings.defaultTimeZone}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
            </select>
          </div>
          
          <div className="form-control w-full md:col-span-2">
            <label className="label">
              <span className="label-text">Site Description</span>
            </label>
            <textarea 
              name="siteDescription"
              value={settings.siteDescription}
              onChange={handleChange}
              className="textarea textarea-bordered w-full" 
              rows={3}
            />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">User Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Registration Open</span> 
              <input 
                type="checkbox" 
                name="registrationOpen"
                checked={settings.registrationOpen}
                onChange={handleChange}
                className="toggle toggle-primary" 
              />
            </label>
          </div>
          
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Email Verification Required</span> 
              <input 
                type="checkbox" 
                name="emailVerificationRequired"
                checked={settings.emailVerificationRequired}
                onChange={handleChange}
                className="toggle toggle-primary" 
              />
            </label>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">Content Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Max File Upload Size (MB)</span>
            </label>
            <input 
              type="number" 
              name="maxFileSize"
              value={settings.maxFileSize}
              onChange={handleChange}
              min="1"
              max="50"
              className="input input-bordered w-full" 
            />
          </div>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Post Report Threshold</span>
            </label>
            <input 
              type="number" 
              name="postReportThreshold"
              value={settings.postReportThreshold}
              onChange={handleChange}
              min="1"
              max="100"
              className="input input-bordered w-full" 
            />
          </div>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Comment Report Threshold</span>
            </label>
            <input 
              type="number" 
              name="commentReportThreshold"
              value={settings.commentReportThreshold}
              onChange={handleChange}
              min="1"
              max="100"
              className="input input-bordered w-full" 
            />
          </div>
          
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Maintenance Mode</span> 
              <input 
                type="checkbox" 
                name="maintenance"
                checked={settings.maintenance}
                onChange={handleChange}
                className="toggle toggle-warning" 
              />
            </label>
          </div>
        </div>
        
        <div className="mt-8 flex gap-4">
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : (
              <>
                <MdSave className="mr-1" />
                Save Settings
              </>
            )}
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={handleReset}
          >
            <MdRefresh className="mr-1" />
            Reset to Defaults
          </button>
          
          {saved && (
            <span className="text-success self-center">
              Settings saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 