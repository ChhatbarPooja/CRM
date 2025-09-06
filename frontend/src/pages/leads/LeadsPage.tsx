import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LEAD_STATUSES, useLeadsStore } from '@/lib/leads';
import { useAuthCheck } from '@/lib/auth';
import { UserPlus, Search, Filter, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import LeadKanbanBoard from '@/components/leads/LeadKanbanBoard';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function NewLeadDialog({ salesReps, loadingReps, children }: { salesReps: any[], loadingReps: boolean, children?: React.ReactNode }) {
  console.log(salesReps, "slaes repos")
  const navigate = useNavigate();
  const { createLead } = useLeadsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRep, setSelectedRep] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    position: '',
    status: 'New Lead',
    value: 0,
    notes: '',
    assignedTo: '',
    location: '',
    currency: 'usd',
  });
  console.log(formData, "form data")
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const lead = await createLead(formData);
      setIsOpen(false);
      toast.success('Lead created successfully');

      // Show notification about assignment if applicable
      if (formData.assignedTo) {
        const assignee = salesReps.find((rep: any) => rep._id === formData.assignedTo);
        if (assignee) {
          toast.success(`Lead assigned to ${assignee.name}`);
        }
      }

      // Navigate to the new lead
      navigate(`/leads/${lead._id}`);
    } catch (err) {
      toast.error('Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add New Lead
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
          <DialogDescription>
            Add information about your new prospect or lead.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleChange('value', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="inr">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => handleChange('assignedTo', value)}
                disabled={loadingReps}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sales rep" />
                </SelectTrigger>
                <SelectContent>
                  {salesReps.map((rep) => {
                    return (
                      <SelectItem key={rep._id} value={rep._id}>
                        {rep.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const { user } = useAuthCheck();
  const {
    leads,
    loading,
    error,
    filters,
    pagination,
    fetchLeads,
    setFilters,
    setPage
  } = useLeadsStore();
  const [salesReps, setSalesReps] = useState([]);
  const [loadingReps, setLoadingReps] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    fetchLeads();

    // Fetch sales reps for filter
    const fetchSalesReps = async () => {
      try {
        setLoadingReps(true);
        const response = await api.get('/users/sales');
        setSalesReps(response.data.data);
      } catch (err) {
        console.error('Failed to fetch sales reps', err);
      } finally {
        setLoadingReps(false);
      }
    };

    fetchSalesReps();
  }, [fetchLeads]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleStatusFilterChange = (value: string) => {
    setFilters({ status: value === 'all' ? null : value });
  };

  const handleAssigneeFilterChange = (value: string) => {
    setFilters({ assignedTo: value === 'all' ? null : value });
  };

  const loadMoreLeads = () => {
    if (pagination.hasMore) {
      setPage(pagination.page + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Leads</h1>
        <NewLeadDialog salesReps={salesReps} loadingReps={loadingReps} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-8"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusFilterChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {LEAD_STATUSES.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.assignedTo || 'all'}
          onValueChange={handleAssigneeFilterChange}
          disabled={loadingReps}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {salesReps.map((rep: any) => (
              <SelectItem key={rep._id} value={rep._id}>{rep.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs
        defaultValue="list"
        value={viewMode}
        onValueChange={setViewMode}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {loading && leads.length === 0 ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : leads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-4">No leads found</p>
                <NewLeadDialog salesReps={salesReps} loadingReps={loadingReps}>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Create your first lead
                  </Button>
                </NewLeadDialog>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {leads.map((lead) => (
                <Card
                  key={lead._id}
                  className="hover:bg-accent/50 cursor-pointer"
                  onClick={() => navigate(`/leads/${lead._id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lead.name}</span>
                          {lead.company && (
                            <span className="text-sm text-muted-foreground">
                              • {lead.company}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span>Status: {lead.status}</span>
                          <span>Value: ${lead.value ? new Intl.NumberFormat('en-US').format(lead.value) : 0}</span>
                          {lead.assignedTo && (
                            <span>Assigned to: {lead.assignedTo.name}</span>
                          )}
                          <span>Created: {format(new Date(lead.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {pagination.hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMoreLeads}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kanban">
          <LeadKanbanBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
}