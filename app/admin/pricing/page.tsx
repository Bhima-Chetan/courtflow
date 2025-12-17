'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type PricingRuleType = 'TIME_OF_DAY' | 'WEEKEND' | 'COURT_TYPE' | 'DURATION' | 'CUSTOM';

type CourtType = 'INDOOR' | 'OUTDOOR';

interface PricingRuleConditions {
  startTime?: string;
  endTime?: string;
  isWeekend?: boolean;
  courtType?: CourtType;
  minDuration?: number;
}

interface PricingRule {
  id: string;
  name: string;
  type: PricingRuleType;
  isActive: boolean;
  priority: number;
  conditions: PricingRuleConditions;
  amount: number;
  isPercentage: boolean;
}

export default function PricingRulesManagement() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'TIME_OF_DAY' as PricingRuleType,
    priority: 5,
    amount: 0,
    isPercentage: false,
    startTime: '',
    endTime: '',
    courtType: 'INDOOR' as CourtType,
    minDuration: 0,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const response = await fetch('/api/admin/pricing-rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(rule: PricingRule) {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      priority: rule.priority,
      amount: rule.amount,
      isPercentage: rule.isPercentage,
      startTime: rule.conditions.startTime || '',
      endTime: rule.conditions.endTime || '',
      courtType: rule.conditions.courtType || 'INDOOR',
      minDuration: rule.conditions.minDuration || 0,
    });
    setIsDialogOpen(true);
  }

  function handleAdd() {
    setEditingRule(null);
    setFormData({
      name: '',
      type: 'TIME_OF_DAY',
      priority: 5,
      amount: 0,
      isPercentage: false,
      startTime: '',
      endTime: '',
      courtType: 'INDOOR',
      minDuration: 0,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    const conditions: PricingRuleConditions = {};
    
    if (formData.type === 'TIME_OF_DAY') {
      conditions.startTime = formData.startTime;
      conditions.endTime = formData.endTime;
    } else if (formData.type === 'WEEKEND') {
      conditions.isWeekend = true;
    } else if (formData.type === 'COURT_TYPE') {
      conditions.courtType = formData.courtType;
    } else if (formData.type === 'DURATION') {
      conditions.minDuration = formData.minDuration;
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      priority: formData.priority,
      amount: formData.amount,
      isPercentage: formData.isPercentage,
      conditions,
    };

    const url = editingRule 
      ? `/api/admin/pricing-rules/${editingRule.id}`
      : '/api/admin/pricing-rules';
    
    const method = editingRule ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchRules();
      }
    } catch (error) {
      console.error('Error saving pricing rule:', error);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/pricing-rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error toggling pricing rule:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;

    try {
      const response = await fetch(`/api/admin/pricing-rules/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error deleting pricing rule:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-dark-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Pricing Rules Management</h1>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule) => (
            <Card key={rule.id} className="bg-dark-900 border-dark-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-white">{rule.name}</div>
                    <div className="text-sm text-dark-400 font-normal mt-1">
                      {rule.isPercentage ? `+${rule.amount}%` : `+₹${rule.amount}`}
                      {' • '}
                      Priority: {rule.priority}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(rule.id, rule.isActive)}
                    className="ml-2"
                  >
                    {rule.isActive ? (
                      <ToggleRight className="h-6 w-6 text-accent-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-dark-600" />
                    )}
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Type:</span>
                    <span className="text-white">{rule.type}</span>
                  </div>
                  {rule.conditions.startTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Time:</span>
                      <span className="text-white">
                        {rule.conditions.startTime} - {rule.conditions.endTime}
                      </span>
                    </div>
                  )}
                  {rule.conditions.courtType && (
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Court Type:</span>
                      <span className="text-white">{rule.conditions.courtType}</span>
                    </div>
                  )}
                  {rule.conditions.minDuration && (
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Min Duration:</span>
                      <span className="text-white">{rule.conditions.minDuration}h</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-dark-900 border-dark-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingRule ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
              </DialogTitle>
              <DialogDescription className="text-dark-400">
                {editingRule ? 'Update pricing rule configuration below.' : 'Create a new pricing rule to apply dynamic pricing.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-dark-300 block mb-2">Rule Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Peak Hours Surcharge"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Rule Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as PricingRuleType })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="TIME_OF_DAY">Time of Day</option>
                  <option value="WEEKEND">Weekend</option>
                  <option value="COURT_TYPE">Court Type</option>
                  <option value="DURATION">Duration Based</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              {formData.type === 'TIME_OF_DAY' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-dark-300 block mb-2">Start Time</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-dark-300 block mb-2">End Time</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {formData.type === 'COURT_TYPE' && (
                <div>
                  <label className="text-sm text-dark-300 block mb-2">Court Type</label>
                  <select
                    value={formData.courtType}
                    onChange={(e) => setFormData({ ...formData, courtType: e.target.value as CourtType })}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="INDOOR">Indoor</option>
                    <option value="OUTDOOR">Outdoor</option>
                  </select>
                </div>
              )}

              {formData.type === 'DURATION' && (
                <div>
                  <label className="text-sm text-dark-300 block mb-2">Minimum Duration (hours)</label>
                  <Input
                    type="number"
                    value={formData.minDuration}
                    onChange={(e) => setFormData({ ...formData, minDuration: Number(e.target.value) })}
                    placeholder="2"
                    required
                    min="1"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-300 block mb-2">Amount</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    placeholder="800"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-dark-300 block mb-2">Type</label>
                  <select
                    value={formData.isPercentage ? 'percentage' : 'flat'}
                    onChange={(e) => setFormData({ ...formData, isPercentage: e.target.value === 'percentage' })}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="flat">Flat (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Priority (1-10)</label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                  placeholder="5"
                  required
                  min="1"
                  max="10"
                />
                <p className="text-xs text-dark-500 mt-1">Higher priority rules are applied first</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingRule ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
