"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Search } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Define lead type
type Lead = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed"
  assignedTo: string | null
  createdAt: Date
}

// Sample data
const initialLeads: Lead[] = [
  {
    id: "1",
    name: "John Doe",
    company: "Acme Inc.",
    email: "john@acme.com",
    phone: "555-1234",
    status: "new",
    assignedTo: null,
    createdAt: new Date("2023-08-01")
  },
  {
    id: "2",
    name: "Jane Smith",
    company: "Globex Corp",
    email: "jane@globex.com",
    phone: "555-5678",
    status: "contacted",
    assignedTo: "Alice Johnson",
    createdAt: new Date("2023-07-28")
  },
  {
    id: "3",
    name: "Robert Brown",
    company: "Initech",
    email: "robert@initech.com",
    phone: "555-9012",
    status: "qualified",
    assignedTo: "Bob Williams",
    createdAt: new Date("2023-07-25")
  }
]

// Team members for assignment
const teamMembers = [
  { id: "1", name: "Alice Johnson" },
  { id: "2", name: "Bob Williams" },
  { id: "3", name: "Carol Davis" },
  { id: "4", name: "Dave Miller" },
]

const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={
          status === "new" ? "default" :
          status === "contacted" ? "secondary" :
          status === "qualified" ? "outline" :
          status === "proposal" ? "destructive" :
          status === "negotiation" ? "violet" : 
          "green"
        }>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    }
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
    cell: ({ row }) => {
      const assignedTo = row.getValue("assignedTo") as string | null
      return assignedTo || "Unassigned"
    }
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return date.toLocaleDateString()
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div className="flex space-x-2">
          <AssignLeadDialog lead={lead} />
          <Button variant="outline" onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}>
            View
          </Button>
        </div>
      )
    }
  }
]

function AssignLeadDialog({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string | undefined>(
    lead.assignedTo || undefined
  )
  
  const handleAssign = () => {
    if (selectedMember) {
      // In a real app, you would update the lead in your backend
      // For now, we'll just show a toast notification
      toast({
        title: "Lead assigned",
        description: `${lead.name} has been assigned to ${selectedMember}`,
      })
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Assign</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Lead</DialogTitle>
          <DialogDescription>
            Assign {lead.name} to a team member
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="member">Team Member</Label>
            <Select 
              value={selectedMember} 
              onValueChange={setSelectedMember}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAssign}>Assign Lead</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function NewLeadDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
    assignedTo: "",
    location: ""
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would create the lead in your backend
    // For now, we'll just show a toast notification
    toast({
      title: "Lead created",
      description: `${formData.name} has been added as a new lead`,
    })

    // Notify if assigned
    if (formData.assignedTo) {
      toast({
        title: "Lead assigned",
        description: `${formData.name} has been assigned to ${formData.assignedTo}`,
      })
    }

    setOpen(false)
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      notes: "",
      assignedTo: "",
      location: ""
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
          <DialogDescription>
            Add a new lead to your CRM system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Acme Inc."
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="New York, USA"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="555-1234"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select 
              value={formData.assignedTo} 
              onValueChange={(value) => handleChange("assignedTo", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information about this lead"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Create Lead</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        <NewLeadDialog />
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Leads</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="contacted">Contacted</TabsTrigger>
          <TabsTrigger value="qualified">Qualified</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>
                Manage all your potential customers in one place.
              </CardDescription>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 opacity-50" />
                <Input 
                  placeholder="Search leads..." 
                  className="h-8 w-[200px] lg:w-[300px]" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={filteredLeads} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Leads</CardTitle>
              <CardDescription>
                These are leads that have just entered your pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={leads.filter(lead => lead.status === "new")} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contacted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contacted Leads</CardTitle>
              <CardDescription>
                These leads have been contacted but need follow-up.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={leads.filter(lead => lead.status === "contacted")} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="qualified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Qualified Leads</CardTitle>
              <CardDescription>
                These leads have been qualified and are ready for proposals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={leads.filter(lead => lead.status === "qualified")} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}