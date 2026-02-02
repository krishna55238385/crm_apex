'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, FileDown, Flame, Sun, Snowflake, X, Users, Mail, Phone, SlidersHorizontal, ArrowUpDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchLeads, fetchUsers, updateLead } from "@/lib/api";
import type { Lead, User } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadsList from '@/components/leads/leads-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddLeadSheet from '@/components/leads/add-lead-sheet';
import ImportLeadsSheet from '@/components/leads/import-leads-sheet';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Bulk Action State
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignUser, setAssignUser] = useState<string>("");

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'Hot', 'Warm', 'Cold'

  const [filters, setFilters] = useState({
    status: 'all',
    owner: 'all',
    source: 'all',
    followUp: 'all',
    search: '',
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortBy, setSortBy] = useState('updated_desc');

  // Keeping Deal Score local for now or pass as range param if backend supported
  // For MVP parity, we'll request backend support later or ignore for server-side simplicity
  // const [scoreRange, setScoreRange] = useState([0, 100]); 

  const loadData = async () => {
    setIsLoading(true);
    try {
      const usersData = await fetchUsers();
      setUsers(usersData);

      const params: any = {
        page,
        limit: 50,
        status: filters.status !== 'all' ? filters.status : undefined,
        ownerId: filters.owner !== 'all' ? filters.owner : undefined,
        source: filters.source !== 'all' ? filters.source : undefined,
        followUpStatus: filters.followUp !== 'all' ? filters.followUp : undefined,
        search: filters.search || undefined,
        temperature: activeTab !== 'all' ? activeTab : undefined,
      };

      const response = await fetchLeads(params);

      // Handle fallback empty array from api.ts
      if (Array.isArray(response)) {
        setLeads(response);
        setTotalPages(1);
        setTotalLeads(response.length);
      } else {
        setLeads(response.data || []);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalLeads(response.meta?.total || 0);
      }

    } catch (error) {
      console.error("Failed to load leads data", error);
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, filters, activeTab]); // Reload when page or filters change

  // Reset page to 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [filters, activeTab]);

  const handleSelectLead = (leadId: string, isSelected: boolean) => {
    setSelectedLeads(prev =>
      isSelected ? [...prev, leadId] : prev.filter(id => id !== leadId)
    );
  };

  // --- Bulk Action Handlers ---

  const handleBulkMarkAsLost = async () => {
    if (!confirm(`Are you sure you want to mark ${selectedLeads.length} leads as Lost?`)) return;

    setIsLoading(true);
    try {
      await Promise.all(selectedLeads.map(id => updateLead(id, { status: 'Lost' })));
      toast.success(`${selectedLeads.length} leads marked as Lost`);
      setSelectedLeads([]);
      loadData();
    } catch (error) {
      console.error("Failed to bulk update status", error);
      toast.error("Failed to update leads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkEmail = () => {
    const selectedLeadObjects = leads.filter(l => selectedLeads.includes(l.id));
    const emails = selectedLeadObjects.map(l => l.email).filter(Boolean).join(',');
    if (!emails) {
      toast.error("No valid emails found in selection");
      return;
    }
    window.location.href = `mailto:?bcc=${emails}`;
  };

  const handleBulkCall = () => {
    toast.info("Bulk calling is not supported via this interface. Please use a dialer integration.");
  };

  const handleBulkAssign = async () => {
    if (!assignUser) return;
    setIsLoading(true);
    try {
      await Promise.all(selectedLeads.map(id => updateLead(id, {
        owner_id: assignUser,
        transfer_status: 'Pending',
        transfer_note: 'Bulk Assignment',
        transfer_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
      })));
      toast.success(`${selectedLeads.length} leads assigned to new owner`);
      setIsAssignDialogOpen(false);
      setSelectedLeads([]);
      setAssignUser("");
      loadData();
    } catch (error) {
      console.error("Failed to bulk assign", error);
      toast.error("Failed to assign leads");
    } finally {
      setIsLoading(false);
    }
  };


  const leadStatuses = ['New', 'Contacted', 'Qualified', 'Lost'];
  const leadSources = ['Organic', 'Referral', 'Paid', 'Social', 'Import', 'Website'];
  const followUpStatuses = ['Pending', 'Overdue', 'None'];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      owner: 'all',
      source: 'all',
      followUp: 'all',
      search: '',
    });
    setDateRange(undefined);
    setSortBy('updated_desc');
    setActiveTab('all');
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Leads</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span><span className="font-bold text-foreground">{totalLeads}</span> total leads</span>
              <span>Page {page} of {totalPages}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <ImportLeadsSheet onSuccess={loadData}>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            </ImportLeadsSheet>
            <AddLeadSheet onSuccess={loadData}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </AddLeadSheet>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/50 border-b">
        <h3 className="text-sm font-semibold mr-2 flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </h3>

        <Input
          placeholder="Search..."
          className="w-32 h-8 text-xs"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-full sm:w-auto text-xs h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {leadStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.owner} onValueChange={(value) => handleFilterChange('owner', value)}>
          <SelectTrigger className="w-full sm:w-auto text-xs h-8">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
          <SelectTrigger className="w-full sm:w-auto text-xs h-8">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {leadSources.map(source => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.followUp} onValueChange={(value) => handleFilterChange('followUp', value)}>
          <SelectTrigger className="w-full sm:w-auto text-xs h-8">
            <SelectValue placeholder="Follow-up" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Follow-ups</SelectItem>
            {followUpStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>


        <div className="h-6 border-l mx-2 hidden sm:block"></div>

        <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-0 sm:ml-auto">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      {selectedLeads.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-dashed animate-in fade-in-50">
          <p className="text-sm font-medium">{selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected</p>
          <div className="h-6 border-l mx-2"></div>

          <Button variant="ghost" size="sm" onClick={() => setIsAssignDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" /> Assign
          </Button>

          <Button variant="ghost" size="sm" onClick={handleBulkEmail}>
            <Mail className="mr-2 h-4 w-4" /> Email
          </Button>

          <Button variant="ghost" size="sm" onClick={handleBulkCall}>
            <Phone className="mr-2 h-4 w-4" /> Call
          </Button>

          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleBulkMarkAsLost}>
            <X className="mr-2 h-4 w-4" /> Mark as Lost
          </Button>

          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setSelectedLeads([])}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {selectedLeads.length} Leads</DialogTitle>
            <DialogDescription>Select a new owner for the selected leads.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={assignUser} onValueChange={setAssignUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkAssign} disabled={!assignUser || isLoading}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsList className="w-full sm:w-auto self-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Hot"><Flame className="mr-2 h-4 w-4 text-red-500" /> Hot</TabsTrigger>
          <TabsTrigger value="Warm"><Sun className="mr-2 h-4 w-4 text-yellow-500" /> Warm</TabsTrigger>
          <TabsTrigger value="Cold"><Snowflake className="mr-2 h-4 w-4 text-blue-500" /> Cold</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-grow mt-4">
          <LeadsList leads={leads} selectedLeads={selectedLeads} onSelectLead={handleSelectLead} onRefresh={loadData} />
        </TabsContent>
        <TabsContent value="Hot" className="flex-grow mt-4">
          <LeadsList leads={leads} selectedLeads={selectedLeads} onSelectLead={handleSelectLead} onRefresh={loadData} />
        </TabsContent>
        <TabsContent value="Warm" className="flex-grow mt-4">
          <LeadsList leads={leads} selectedLeads={selectedLeads} onSelectLead={handleSelectLead} onRefresh={loadData} />
        </TabsContent>
        <TabsContent value="Cold" className="flex-grow mt-4">
          <LeadsList leads={leads} selectedLeads={selectedLeads} onSelectLead={handleSelectLead} onRefresh={loadData} />
        </TabsContent>
      </Tabs>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t pt-4 mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || isLoading}
        >
          Next <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

    </div>
  );
}
