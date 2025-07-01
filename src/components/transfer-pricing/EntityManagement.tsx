import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { TPEntity, TPEntityType } from '@/types/transfer-pricing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EntityManagementProps {
  onEntitySelect?: (entity: TPEntity) => void;
}

const EntityManagement: React.FC<EntityManagementProps> = ({ onEntitySelect }) => {
  const [entities, setEntities] = useState<TPEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<TPEntity | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    entity_type: 'subsidiary' as TPEntityType,
    country_code: '',
    tax_id: '',
    business_description: ''
  });

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tp_entities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert Json types to Record<string, any>
      const typedEntities: TPEntity[] = (data || []).map(entity => ({
        ...entity,
        functional_analysis: typeof entity.functional_analysis === 'object' ? entity.functional_analysis as Record<string, any> : {},
        financial_data: typeof entity.financial_data === 'object' ? entity.financial_data as Record<string, any> : {}
      }));
      
      setEntities(typedEntities);
    } catch (error) {
      console.error('Error fetching entities:', error);
      toast.error('Failed to load entities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      if (editingEntity) {
        const { error } = await supabase
          .from('tp_entities')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEntity.id);

        if (error) throw error;
        toast.success('Entity updated successfully');
      } else {
        const { error } = await supabase
          .from('tp_entities')
          .insert([{
            ...formData,
            user_id: user.id,
            functional_analysis: {},
            financial_data: {}
          }]);

        if (error) throw error;
        toast.success('Entity created successfully');
      }

      setIsCreateDialogOpen(false);
      setEditingEntity(null);
      setFormData({
        name: '',
        entity_type: 'subsidiary',
        country_code: '',
        tax_id: '',
        business_description: ''
      });
      fetchEntities();
    } catch (error) {
      console.error('Error saving entity:', error);
      toast.error('Failed to save entity');
    }
  };

  const handleDelete = async (entityId: string) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;

    try {
      const { error } = await supabase
        .from('tp_entities')
        .delete()
        .eq('id', entityId);

      if (error) throw error;
      toast.success('Entity deleted successfully');
      fetchEntities();
    } catch (error) {
      console.error('Error deleting entity:', error);
      toast.error('Failed to delete entity');
    }
  };

  const handleEdit = (entity: TPEntity) => {
    setEditingEntity(entity);
    setFormData({
      name: entity.name,
      entity_type: entity.entity_type,
      country_code: entity.country_code,
      tax_id: entity.tax_id || '',
      business_description: entity.business_description || ''
    });
    setIsCreateDialogOpen(true);
  };

  const getEntityTypeColor = (type: TPEntityType) => {
    switch (type) {
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'subsidiary': return 'bg-green-100 text-green-800';
      case 'branch': return 'bg-yellow-100 text-yellow-800';
      case 'partnership': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Entity Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEntity ? 'Edit Entity' : 'Create New Entity'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Entity Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="entity_type">Entity Type</Label>
                <Select 
                  value={formData.entity_type} 
                  onValueChange={(value: TPEntityType) => setFormData({ ...formData, entity_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent Company</SelectItem>
                    <SelectItem value="subsidiary">Subsidiary</SelectItem>
                    <SelectItem value="branch">Branch</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="country_code">Country</Label>
                <Input
                  id="country_code"
                  value={formData.country_code}
                  onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                  placeholder="e.g., US, NG, UK"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="tax_id">Tax ID (Optional)</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="business_description">Business Description</Label>
                <Textarea
                  id="business_description"
                  value={formData.business_description}
                  onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingEntity(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEntity ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {entities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No entities found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first entity for transfer pricing documentation.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Entity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map((entity) => (
            <Card 
              key={entity.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onEntitySelect?.(entity)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{entity.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(entity);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entity.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge className={getEntityTypeColor(entity.entity_type)}>
                    {entity.entity_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {entity.country_code}
                  </div>
                  
                  {entity.tax_id && (
                    <p className="text-sm text-muted-foreground">
                      Tax ID: {entity.tax_id}
                    </p>
                  )}
                  
                  {entity.business_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entity.business_description}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(entity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntityManagement;
