'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type EquipmentType = 'RACKET' | 'SHOES' | 'SHUTTLECOCK' | 'OTHER';
type EquipmentStatus = 'ACTIVE' | 'INACTIVE';

interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  size: string | null;
  totalQuantity: number;
  availableQty: number;
  pricePerHour: number;
  perSlotMax: number;
  description: string | null;
  status: EquipmentStatus;
}

export default function EquipmentManagement() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'RACKET' as EquipmentType,
    size: '',
    totalQuantity: 0,
    pricePerHour: 0,
    perSlotMax: 1,
    description: '',
    status: 'ACTIVE' as EquipmentStatus,
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  async function fetchEquipment() {
    try {
      const response = await fetch('/api/admin/equipment');
      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(item: Equipment) {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      type: item.type,
      size: item.size || '',
      totalQuantity: item.totalQuantity,
      pricePerHour: item.pricePerHour,
      perSlotMax: item.perSlotMax,
      description: item.description || '',
      status: item.status,
    });
    setIsDialogOpen(true);
  }

  function handleAdd() {
    setEditingEquipment(null);
    setFormData({
      name: '',
      type: 'RACKET',
      size: '',
      totalQuantity: 0,
      pricePerHour: 0,
      perSlotMax: 1,
      description: '',
      status: 'ACTIVE',
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const url = editingEquipment 
      ? `/api/admin/equipment/${editingEquipment.id}`
      : '/api/admin/equipment';
    
    const method = editingEquipment ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          size: formData.size || null,
        }),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        fetchEquipment();
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
      const response = await fetch(`/api/admin/equipment/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchEquipment();
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
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
          <h1 className="text-3xl font-bold text-white">Equipment Management</h1>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Equipment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <Card key={item.id} className="bg-dark-900 border-dark-800">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <div className="text-white">{item.name}</div>
                    <div className="text-sm text-accent-400 font-normal mt-1">
                      ₹{item.pricePerHour}/hr
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {item.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Type:</span>
                    <span className="text-white">{item.type}</span>
                  </div>
                  {item.size && (
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Size:</span>
                      <span className="text-white">{item.size}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Inventory:</span>
                    <span className="text-white">{item.availableQty} / {item.totalQuantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-400">Max per booking:</span>
                    <span className="text-white">{item.perSlotMax}</span>
                  </div>
                </div>
                {item.description && (
                  <p className="text-dark-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
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
                {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
              </DialogTitle>
              <DialogDescription className="text-dark-400">
                {editingEquipment ? 'Update equipment details below.' : 'Fill in the details to add new equipment.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-dark-300 block mb-2">Equipment Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Professional Racket"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-300 block mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EquipmentType })}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="RACKET">Racket</option>
                    <option value="SHOES">Shoes</option>
                    <option value="SHUTTLECOCK">Shuttlecock</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-dark-300 block mb-2">Size (optional)</label>
                  <Input
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g., 8, 9, 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-300 block mb-2">Total Quantity</label>
                  <Input
                    type="number"
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: Number(e.target.value) })}
                    placeholder="10"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="text-sm text-dark-300 block mb-2">Max per Booking</label>
                  <Input
                    type="number"
                    value={formData.perSlotMax}
                    onChange={(e) => setFormData({ ...formData, perSlotMax: Number(e.target.value) })}
                    placeholder="4"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Price per Hour (₹)</label>
                <Input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) })}
                  placeholder="300"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-dark-300 block mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="High-quality badminton racket..."
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingEquipment ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
