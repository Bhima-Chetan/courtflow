'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type CoachStatus = 'ACTIVE' | 'INACTIVE';

interface Coach {
  id: string;
  name: string;
  bio: string | null;
  specialization: string | null;
  hourlyRate: number;
  imageUrl: string | null;
  status: CoachStatus;
}

export default function CoachesManagement() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    specialization: '',
    hourlyRate: 0,
    status: 'ACTIVE' as CoachStatus,
  });

  useEffect(() => {
    fetchCoaches();
  }, []);

  async function fetchCoaches() {
    try {
      const response = await fetch('/api/admin/coaches');
      if (response.ok) {
        const data = await response.json();
        setCoaches(data);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(coach: Coach) {
    setEditingCoach(coach);
    setFormData({
      name: coach.name,
      bio: coach.bio || '',
      specialization: coach.specialization || '',
      hourlyRate: coach.hourlyRate,
      status: coach.status,
    });
    setIsDialogOpen(true);
  }

  function handleAdd() {
    setEditingCoach(null);
    setFormData({
      name: '',
      bio: '',
      specialization: '',
      hourlyRate: 0,
      status: 'ACTIVE',
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const url = editingCoach 
      ? `/api/admin/coaches/${editingCoach.id}`
      : '/api/admin/coaches';
    
    const method = editingCoach ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchCoaches();
      }
    } catch (error) {
      console.error('Error saving coach:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this coach?')) return;

    try {
      const response = await fetch(`/api/admin/coaches/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCoaches();
      }
    } catch (error) {
      console.error('Error deleting coach:', error);
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
          <h1 className="text-3xl font-bold text-white">Coaches Management</h1>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Coach
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <Card key={coach.id} className="bg-dark-900 border-dark-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <div className="text-white">{coach.name}</div>
                    <div className="text-sm text-accent-400 font-normal mt-1">
                      ₹{coach.hourlyRate}/hr
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    coach.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {coach.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coach.specialization && (
                  <div className="text-secondary-400 text-sm mb-2">
                    {coach.specialization}
                  </div>
                )}
                {coach.bio && (
                  <p className="text-dark-400 text-sm mb-4 line-clamp-2">{coach.bio}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(coach)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(coach.id)}
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
                {editingCoach ? 'Edit Coach' : 'Add New Coach'}
              </DialogTitle>
              <DialogDescription className="text-dark-400">
                {editingCoach ? 'Update coach information below.' : 'Fill in the details to add a new coach.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-dark-300 block mb-2">Coach Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Specialization</label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g., Singles & Doubles Strategy"
                />
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Hourly Rate (₹)</label>
                <Input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  placeholder="4000"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as CoachStatus })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Former national player with 10+ years of coaching experience..."
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingCoach ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
