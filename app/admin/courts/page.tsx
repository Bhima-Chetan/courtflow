'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type CourtType = 'INDOOR' | 'OUTDOOR';
type CourtStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

interface Court {
  id: string;
  name: string;
  type: CourtType;
  status: CourtStatus;
  baseRate: number;
  description: string | null;
  imageUrl: string | null;
}

export default function CourtsManagement() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'INDOOR' as CourtType,
    status: 'ACTIVE' as CourtStatus,
    baseRate: 0,
    description: '',
  });

  useEffect(() => {
    fetchCourts();
  }, []);

  async function fetchCourts() {
    try {
      const response = await fetch('/api/admin/courts');
      if (response.ok) {
        const data = await response.json();
        setCourts(data);
      }
    } catch (error) {
      console.error('Error fetching courts:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(court: Court) {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      type: court.type,
      status: court.status,
      baseRate: court.baseRate,
      description: court.description || '',
    });
    setIsDialogOpen(true);
  }

  function handleAdd() {
    setEditingCourt(null);
    setFormData({
      name: '',
      type: 'INDOOR',
      status: 'ACTIVE',
      baseRate: 0,
      description: '',
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const url = editingCourt 
      ? `/api/admin/courts/${editingCourt.id}`
      : '/api/admin/courts';
    
    const method = editingCourt ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchCourts();
      }
    } catch (error) {
      console.error('Error saving court:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this court?')) return;

    try {
      const response = await fetch(`/api/admin/courts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCourts();
      }
    } catch (error) {
      console.error('Error deleting court:', error);
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
          <h1 className="text-3xl font-bold text-white">Courts Management</h1>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Court
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <Card key={court.id} className="bg-dark-900 border-dark-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <div className="text-white">{court.name}</div>
                    <div className="text-sm text-dark-400 font-normal mt-1">
                      {court.type} • ₹{court.baseRate}/hr
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    court.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                    court.status === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {court.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {court.description && (
                  <p className="text-dark-400 text-sm mb-4">{court.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(court)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(court.id)}
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
                {editingCourt ? 'Edit Court' : 'Add New Court'}
              </DialogTitle>
              <DialogDescription className="text-dark-400">
                {editingCourt ? 'Update court information below.' : 'Fill in the details to add a new court.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-dark-300 block mb-2">Court Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Court 1 - Indoor Premium"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as CourtType })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="INDOOR">Indoor</option>
                  <option value="OUTDOOR">Outdoor</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as CourtStatus })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Base Rate (₹/hour)</label>
                <Input
                  type="number"
                  value={formData.baseRate}
                  onChange={(e) => setFormData({ ...formData, baseRate: Number(e.target.value) })}
                  placeholder="3500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Professional indoor badminton court..."
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingCourt ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
