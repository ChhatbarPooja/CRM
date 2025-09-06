import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LEAD_STATUSES, useLeadsStore, Lead } from '@/lib/leads';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

export default function LeadKanbanBoard() {
  const navigate = useNavigate();
  const { leads, loading, error, fetchLeads, updateLeadStatus } = useLeadsStore();
  const [groupedLeads, setGroupedLeads] = useState<{ [key: string]: Lead[] }>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (leads.length > 0) {
      const grouped = LEAD_STATUSES.reduce((acc, status) => {
        acc[status] = leads.filter(lead => lead.status === status);
        return acc;
      }, {} as { [key: string]: Lead[] });
      setGroupedLeads(grouped);
    }
  }, [leads]);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const id = active.id;
    const lead = leads.find(lead => lead._id === id);
    
    if (lead) {
      setActiveId(id);
      setActiveLead(lead);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (!over || !active) {
      setActiveId(null);
      setActiveLead(null);
      return;
    }
    
    const leadId = active.id;
    const newStatus = over.id;
    
    if (newStatus && LEAD_STATUSES.includes(newStatus)) {
      try {
        // Update lead status
        await updateLeadStatus(leadId, newStatus);
        
        // No need to manually update the UI here as the state will be updated
        // through the updateLead function in the store
      } catch (error) {
        console.error('Failed to update lead status', error);
      }
    }
    
    setActiveId(null);
    setActiveLead(null);
  };

  const handleCardClick = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  if (loading && Object.keys(groupedLeads).length === 0) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {LEAD_STATUSES.map(status => (
            <KanbanColumn 
              key={status} 
              status={status} 
              leads={groupedLeads[status] || []}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeId && activeLead ? (
            <div className="w-[250px]">
              <KanbanCard lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}