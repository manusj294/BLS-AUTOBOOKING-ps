"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  History,
  Search,
  Calendar,
  Clock,
  MapPin,
  StampIcon as Passport,
  FileText,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  CreditCard,
  FileDown,
  Mail,
  Phone,
} from "lucide-react"

interface BookingHistoryProps {
  onStatusUpdate: (status: any) => void
}

export default function BookingHistory({ onStatusUpdate }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Load booking history on component mount
  useEffect(() => {
    loadBookingHistory()
  }, [])

  // Filter bookings when search term or status filter changes
  useEffect(() => {
    filterBookings()
  }, [searchTerm, statusFilter, bookings])

  // Load booking history from API
  const loadBookingHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/booking/history")
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        onStatusUpdate({ totalBookings: data.bookings?.length || 0 })
      } else {
        console.error("Failed to load booking history")
      }
    } catch (error) {
      console.error("Error loading booking history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter bookings based on search term and status filter
  const filterBookings = () => {
    let filtered = [...bookings]

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.confirmationNumber.toLowerCase().includes(term) ||
          booking.applicantName.toLowerCase().includes(term) ||
          booking.passportNumber.toLowerCase().includes(term) ||
          booking.visaTypeName.toLowerCase().includes(term) ||
          booking.locationName.toLowerCase().includes(term),
      )
    }

    setFilteredBookings(filtered)
  }

  // View booking details
  const viewBookingDetails = async (bookingId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/booking/history/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedBooking(data.booking)
        setIsDetailsOpen(true)
      } else {
        console.error("Failed to load booking details")
      }
    } catch (error) {
      console.error("Error loading booking details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Export booking history to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Confirmation Number",
      "Date",
      "Time",
      "Visa Type",
      "Location",
      "Applicant Name",
      "Passport Number",
      "Status",
    ]
    const rows = filteredBookings.map((booking) => [
      booking.confirmationNumber,
      booking.date,
      booking.time,
      booking.visaTypeName,
      booking.locationName,
      booking.applicantName,
      booking.passportNumber,
      booking.status,
    ])
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bls-booking-history-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "completed":
        return "success"
      case "cancelled":
        return "destructive"
      case "rescheduled":
        return "warning"
      default:
        return "secondary"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      case "rescheduled":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-6 h-6 text-blue-600" />
                Booking History
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                View and manage your visa appointment bookings
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadBookingHistory}
                disabled={isLoading}
                className="flex items-center gap-1 bg-transparent"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={filteredBookings.length === 0}
                className="flex items-center gap-1 bg-transparent"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search by confirmation number, name, or passport..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="statusFilter" className="sr-only">
                Status Filter
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="statusFilter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading booking history...</p>
              </div>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-4 md:p-6 flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{booking.confirmationNumber}</h3>
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="capitalize">
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Date:</span>
                          <span className="text-sm font-medium">{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Time:</span>
                          <span className="text-sm font-medium">{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Passport className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Visa Type:</span>
                          <span className="text-sm font-medium">{booking.visaTypeName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Location:</span>
                          <span className="text-sm font-medium">{booking.locationName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Applicant:</span>
                          <span className="text-sm font-medium">{booking.applicantName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Passport:</span>
                          <span className="text-sm font-medium">{booking.passportNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 md:p-6 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Created</p>
                        <p className="text-sm font-medium">{formatDate(booking.createdAt)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewBookingDetails(booking.id)}
                        className="whitespace-nowrap"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {searchTerm || statusFilter !== "all"
                  ? "No bookings match your search criteria. Try adjusting your filters."
                  : "No booking history found. Book an appointment to see it here."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Booking Details
            </DialogTitle>
            <DialogDescription>Confirmation Number: {selectedBooking?.confirmationNumber}</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="applicant">Applicant</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Appointment Information</h3>
                    <Badge variant={getStatusBadgeVariant(selectedBooking.status)} className="capitalize">
                      {getStatusIcon(selectedBooking.status)}
                      <span className="ml-1">{selectedBooking.status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm font-medium">{formatDate(selectedBooking.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Time:</span>
                        <span className="text-sm font-medium">{selectedBooking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="text-sm font-medium">{selectedBooking.locationName}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Passport className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Visa Type:</span>
                        <span className="text-sm font-medium">{selectedBooking.visaTypeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Passport className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Visa Sub-Type:</span>
                        <span className="text-sm font-medium">{selectedBooking.visaSubTypeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm font-medium">{formatDate(selectedBooking.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mt-4">Payment Information</h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Payment Method:</span>
                        <span className="text-sm font-medium">{selectedBooking.payment.method}</span>
                      </div>
                      <Badge
                        variant={
                          selectedBooking.payment.status === "Paid"
                            ? "success"
                            : selectedBooking.payment.status === "Failed"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {selectedBooking.payment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="text-sm font-medium">
                        {selectedBooking.payment.amount} {selectedBooking.payment.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Reference:</span>
                      <span className="text-sm font-medium">{selectedBooking.payment.reference}</span>
                    </div>
                  </div>

                  {selectedBooking.additionalServices.length > 0 && (
                    <>
                      <h3 className="font-semibold text-gray-900 mt-4">Additional Services</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedBooking.additionalServices.map((service, index) => (
                          <Badge key={index} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}

                  <h3 className="font-semibold text-gray-900 mt-4">Status History</h3>
                  <div className="space-y-2">
                    {selectedBooking.statusHistory.map((status, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.status)}
                          <span className="text-sm font-medium capitalize">{status.status}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(status.timestamp)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                      onClick={() => {
                        // Generate and download PDF (mock functionality)
                        alert("Downloading booking confirmation PDF...")
                      }}
                    >
                      <FileDown className="w-4 h-4" />
                      Download Confirmation
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="applicant" className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Applicant Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">First Name:</span>
                        <span className="text-sm font-medium">{selectedBooking.applicantDetails.firstName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Last Name:</span>
                        <span className="text-sm font-medium">{selectedBooking.applicantDetails.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Date of Birth:</span>
                        <span className="text-sm font-medium">
                          {formatDate(selectedBooking.applicantDetails.dateOfBirth)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Nationality:</span>
                        <span className="text-sm font-medium">{selectedBooking.applicantDetails.nationality}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Passport className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Passport Number:</span>
                        <span className="text-sm font-medium">{selectedBooking.applicantDetails.passportNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{selectedBooking.applicantDetails.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-medium">{selectedBooking.applicantDetails.phone}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Document Uploads</h3>
                  <div className="space-y-2">
                    {selectedBooking.documents.map((document, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">{document.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500">{formatDate(document.uploadDate)}</span>
                          <Badge
                            variant={document.status === "Uploaded" ? "success" : "warning"}
                            className="capitalize"
                          >
                            {document.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
