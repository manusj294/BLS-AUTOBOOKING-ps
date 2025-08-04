"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { StampIcon as Passport, MapPin, Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { visaTypesData } from "@/visa-types"

interface VisaSelectionProps {
  onVisaSelected: (selection: VisaSelectionData) => void
  initialData?: VisaSelectionData
}

export interface VisaSelectionData {
  visaTypeId: string
  visaSubTypeId: string
  locationId: string
  categoryId: string
  applicantGroupId?: string
}

export default function VisaSelection({ onVisaSelected, initialData }: VisaSelectionProps) {
  const [selectedVisaTypeId, setSelectedVisaTypeId] = useState<string>(initialData?.visaTypeId || "")
  const [selectedVisaSubTypeId, setSelectedVisaSubTypeId] = useState<string>(initialData?.visaSubTypeId || "")
  const [selectedLocationId, setSelectedLocationId] = useState<string>(initialData?.locationId || "")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialData?.categoryId || "")
  const [selectedApplicantGroupId, setSelectedApplicantGroupId] = useState<string>(initialData?.applicantGroupId || "")
  const [isGroupBooking, setIsGroupBooking] = useState<boolean>(false)
  const [availableSubTypes, setAvailableSubTypes] = useState<any[]>([])
  const [availableLocations, setAvailableLocations] = useState<any[]>([])

  // Filter available subtypes based on selected visa type
  useEffect(() => {
    if (selectedVisaTypeId) {
      const filteredSubTypes = visaTypesData.visaSubTypes.filter((subType) => subType.typeId === selectedVisaTypeId)
      setAvailableSubTypes(filteredSubTypes)

      // Reset subtype if current selection is not valid for the new visa type
      if (selectedVisaSubTypeId && !filteredSubTypes.some((st) => st.id === selectedVisaSubTypeId)) {
        setSelectedVisaSubTypeId("")
      }
    } else {
      setAvailableSubTypes([])
      setSelectedVisaSubTypeId("")
    }
  }, [selectedVisaTypeId, selectedVisaSubTypeId])

  // Filter available locations based on selected visa type
  useEffect(() => {
    if (selectedVisaTypeId) {
      const filteredLocations = visaTypesData.locations.filter((location) =>
        location.visaTypeIds.includes(selectedVisaTypeId),
      )
      setAvailableLocations(filteredLocations)

      // Reset location if current selection is not valid for the new visa type
      if (selectedLocationId && !filteredLocations.some((loc) => loc.id === selectedLocationId)) {
        setSelectedLocationId("")
      }
    } else {
      setAvailableLocations([])
      setSelectedLocationId("")
    }
  }, [selectedVisaTypeId, selectedLocationId])

  // Check if the selected subtype is for family group
  useEffect(() => {
    const selectedSubType = visaTypesData.visaSubTypes.find((st) => st.id === selectedVisaSubTypeId)
    setIsGroupBooking(selectedSubType?.subCode === "FAMILY_GROUP")
  }, [selectedVisaSubTypeId])

  // Update parent component when selection changes
  useEffect(() => {
    if (selectedVisaTypeId && selectedVisaSubTypeId && selectedLocationId && selectedCategoryId) {
      const selectionData: VisaSelectionData = {
        visaTypeId: selectedVisaTypeId,
        visaSubTypeId: selectedVisaSubTypeId,
        locationId: selectedLocationId,
        categoryId: selectedCategoryId,
      }

      if (isGroupBooking && selectedApplicantGroupId) {
        selectionData.applicantGroupId = selectedApplicantGroupId
      }

      onVisaSelected(selectionData)
    }
  }, [
    selectedVisaTypeId,
    selectedVisaSubTypeId,
    selectedLocationId,
    selectedCategoryId,
    selectedApplicantGroupId,
    isGroupBooking,
    onVisaSelected,
  ])

  const isSelectionComplete = () => {
    if (isGroupBooking) {
      return (
        selectedVisaTypeId &&
        selectedVisaSubTypeId &&
        selectedLocationId &&
        selectedCategoryId &&
        selectedApplicantGroupId
      )
    }
    return selectedVisaTypeId && selectedVisaSubTypeId && selectedLocationId && selectedCategoryId
  }

  const getVisaTypeName = (id: string) => {
    const visaType = visaTypesData.visaTypes.find((vt) => vt.id === id)
    return visaType?.name || ""
  }

  const getVisaSubTypeName = (id: string) => {
    const visaSubType = visaTypesData.visaSubTypes.find((vst) => vst.id === id)
    return visaSubType?.name || ""
  }

  const getLocationName = (id: string) => {
    const location = visaTypesData.locations.find((loc) => loc.id === id)
    return location?.name || ""
  }

  const getCategoryName = (id: string) => {
    const category = visaTypesData.applicationCategories.find((cat) => cat.id === id)
    return category?.name || ""
  }

  const getApplicantGroupName = (id: string) => {
    const group = visaTypesData.applicantGroups.find((g) => g.id === id)
    return group?.name || ""
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Passport className="w-6 h-6 text-blue-600" />
          BLS Spain Algeria Visa Selection
        </CardTitle>
        <CardDescription className="text-gray-600 mt-1">
          Select your visa type, location, and appointment category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Please select your visa type, application center location, and appointment category to proceed with
              booking.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="visaType" className="text-sm font-medium text-gray-700">
                Visa Type *
              </Label>
              <Select value={selectedVisaTypeId} onValueChange={setSelectedVisaTypeId}>
                <SelectTrigger id="visaType">
                  <SelectValue placeholder="Select visa type" />
                </SelectTrigger>
                <SelectContent>
                  {visaTypesData.visaTypes.map((visaType) => (
                    <SelectItem key={visaType.id} value={visaType.id}>
                      {visaType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="visaSubType" className="text-sm font-medium text-gray-700">
                Visa Sub-Type *
              </Label>
              <Select
                value={selectedVisaSubTypeId}
                onValueChange={setSelectedVisaSubTypeId}
                disabled={!selectedVisaTypeId || availableSubTypes.length === 0}
              >
                <SelectTrigger id="visaSubType">
                  <SelectValue placeholder={!selectedVisaTypeId ? "Select visa type first" : "Select visa sub-type"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubTypes.map((subType) => (
                    <SelectItem key={subType.id} value={subType.id}>
                      {subType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                Application Center Location *
              </Label>
              <Select
                value={selectedLocationId}
                onValueChange={setSelectedLocationId}
                disabled={!selectedVisaTypeId || availableLocations.length === 0}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder={!selectedVisaTypeId ? "Select visa type first" : "Select location"} />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Appointment Category *
              </Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={!selectedLocationId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder={!selectedLocationId ? "Select location first" : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {visaTypesData.applicationCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Family Group Selection - Conditional */}
          {isGroupBooking && (
            <div className="border-l-4 border-blue-500 pl-6 space-y-4 bg-blue-50 p-4 rounded-r-lg">
              <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Family Group Details
              </h4>
              <div className="space-y-3">
                <Label htmlFor="applicantGroup" className="text-sm font-medium text-gray-700">
                  Number of Family Members *
                </Label>
                <Select value={selectedApplicantGroupId} onValueChange={setSelectedApplicantGroupId}>
                  <SelectTrigger id="applicantGroup">
                    <SelectValue placeholder="Select number of members" />
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypesData.applicantGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Selection Summary */}
          {selectedVisaTypeId && (
            <div className="mt-6 p-4 bg-white rounded-lg border shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3">Your Selection</h4>
              <div className="space-y-2">
                {selectedVisaTypeId && (
                  <div className="flex items-center gap-2">
                    <Passport className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Visa Type:</span>
                    <Badge variant="outline" className="ml-auto">
                      {getVisaTypeName(selectedVisaTypeId)}
                    </Badge>
                  </div>
                )}
                {selectedVisaSubTypeId && (
                  <div className="flex items-center gap-2">
                    <Passport className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Visa Sub-Type:</span>
                    <Badge variant="outline" className="ml-auto">
                      {getVisaSubTypeName(selectedVisaSubTypeId)}
                    </Badge>
                  </div>
                )}
                {selectedLocationId && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Location:</span>
                    <Badge variant="outline" className="ml-auto">
                      {getLocationName(selectedLocationId)}
                    </Badge>
                  </div>
                )}
                {selectedCategoryId && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Category:</span>
                    <Badge variant="outline" className="ml-auto">
                      {getCategoryName(selectedCategoryId)}
                    </Badge>
                  </div>
                )}
                {isGroupBooking && selectedApplicantGroupId && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Group Size:</span>
                    <Badge variant="outline" className="ml-auto">
                      {getApplicantGroupName(selectedApplicantGroupId)}
                    </Badge>
                  </div>
                )}
              </div>

              {isSelectionComplete() && (
                <div className="mt-4 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">Selection complete! You can now proceed to booking.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
