"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  Save,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  Camera,
  Users,
  Plus,
  Minus,
  MapPin,
  Plane,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ImageIcon,
  Briefcase,
  FileText,
  Globe,
  Building,
  Fingerprint,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { DatePicker } from "@/ui/date-picker"
import { FileUpload } from "@/ui/file-upload"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ApplicantFormProps {
  onDataChange: (data: any) => void
}

export default function ApplicantForm({ onDataChange }: ApplicantFormProps) {
  const [isGroupBooking, setIsGroupBooking] = useState(false)
  const [numberOfApplicants, setNumberOfApplicants] = useState(1)
  const [currentApplicantIndex, setCurrentApplicantIndex] = useState(0)
  const [applicantsData, setApplicantsData] = useState([
    {
      // Personal Details
      Surname: "",
      FirstName: "",
      LastName: "",
      PreviousName: "",
      DateOfBirth: null,
      PlaceOfBirth: "",
      CountryOfBirthId: "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
      CurrentNationalityId: "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
      OriginalNationalityId: "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
      GenderId: "",
      MaritalStatusId: "",
      IsMinor: false,

      // Contact Information
      PhoneNumber: "",
      EmailAddress: "",

      // Photo ID/Selfie
      PhotoId: null,
      Selfie: null,

      // Minor Details
      MinorParentSurname: "",
      MinorParentFirstName: "",
      MinorParentLastName: "",
      MinorParentNationalityId: "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
      MinorParentAddress: "",

      // Passport Details
      NationalIdentityNumber: "",
      PassportType: "0a152f62-b7b2-49ad-893e-b41b15e2bef3",
      PassportNo: "",
      IssueDate: null,
      ExpiryDate: null,
      IssuePlace: "",
      IssueCountryId: "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
      TravelDate: null,

      // Address & Contact Details
      HomeAddressLine1: "",
      HomeAddressLine2: "",
      HomeAddressCountryId: "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72",
      HomeAddressState: "",
      HomeAddressCity: "",
      HomeAddressPostalCode: "",
      HomeAddressContactNumber: "",
      HasOtherResidenceship: false,

      // Other Residenceship
      OtherResidenceshipPermitNumber: "",
      OtherResidenceshipPermitValidUntill: null,

      // Employer Details
      EmployerName: "",
      EmployerPhone: "",
      EmployerAddress: "",
      CurrentOccupationId: "",

      // Travel Information
      PurposeOfJourneyId: "82a413f6-0e05-4ac0-8224-61432e8dfa44",
      MemberStateDestinationId: "1bdacc6c-cb25-4142-b210-bb058f4ffecf",
      MemberStateSecondDestinationId: "1bdacc6c-cb25-4142-b210-bb058f4ffecf",
      MemberStateFirstEntryId: "1bdacc6c-cb25-4142-b210-bb058f4ffecf",
      NumberOfEntriesRequested: "2545f664-6779-43ea-be61-d405908131cd",
      IntendedStayDuration: 15,
      IsVisaIssuedBefore: false,

      // Enhanced Travel Information
      MainDestinationCity: "",
      MainDestinationAddress: "",
      IntendedDateOfArrival: null,
      IntendedDateOfDeparture: null,
      TravelPurposeDetails: "",
      AccommodationType: "",
      AccommodationName: "",
      AccommodationAddress: "",
      AccommodationPhone: "",
      TransportationMode: "",
      FlightNumber: "",
      TravelItinerary: "",

      // Previous Visa Details
      PreviousVisaNumber: "",
      PreviousVisaValidFrom: null,
      PreviousVisaValidTo: null,
      PreviousVisaIssuedCountryId: "",

      // Previous Schengen Visa Details
      HasPreviousSchengenVisa: false,
      PreviousSchengenVisaType: "",
      PreviousSchengenVisaNumber: "",
      PreviousSchengenIssueDate: null,
      PreviousSchengenExpiryDate: null,
      PreviousSchengenIssuingCountry: "",
      PreviousSchengenValidityPeriod: "",
      PreviousSchengenEntries: "",
      SchengenVisaRefusalHistory: false,
      RefusalReason: "",
      RefusalDate: null,

      // Fingerprint Details
      PreviousFingerPrintStatus: "2",
      PreviousFingerPrintDate: null,

      // Final Destination
      FinalDestinationIssuedByCountryId: "",
      FinalDestinationValidFromDate: null,
      FinalDestinationValidToDate: null,

      // Inviting Authority
      BlsInvitingAuthority: "0",
      InvitingAuthorityName: "",
      InvitingCountryId: "",
      InvitingCity: "",
      InvitingZipCode: "",
      InvitingAddress: "",
      InvitingEmail: "",
      InvitingContactNo: "",
      InvitingFaxNo: "",
      InvitingContactName: "",
      InvitingContactSurname: "",
      InvitingContactCountryId: "",

      // Form completion status
      isCompleted: false,
      isSaved: false,
      completedSections: [],
    },
  ])

  const [currentSection, setCurrentSection] = useState(0)
  const [validationErrors, setValidationErrors] = useState({})
  const [savedApplicants, setSavedApplicants] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showApplicantGuide, setShowApplicantGuide] = useState(false)

  const sections = [
    { title: "Booking Type", key: "booking-type", icon: Users },
    { title: "Personal Details", key: "personal", icon: User },
    { title: "Contact & Photos", key: "contact", icon: Phone },
    { title: "Passport Details", key: "passport", icon: User },
    { title: "Address & Contact", key: "address", icon: Mail },
    { title: "Travel Information", key: "travel", icon: Plane },
    { title: "Previous Schengen Visa", key: "previous-visa", icon: MapPin },
    { title: "Employer Details", key: "employer", icon: Briefcase },
    { title: "Fingerprint Details", key: "fingerprint", icon: Fingerprint },
    { title: "Final Destination", key: "destination", icon: Globe },
    { title: "Inviting Authority", key: "inviting", icon: Building },
  ]

  const countries = [
    { id: "5e44cd63-68f0-41f2-b708-0eb3bf9f4a72", name: "Algeria", code: "DZA" },
    { id: "1bdacc6c-cb25-4142-b210-bb058f4ffecf", name: "Spain", code: "ESP" },
    { id: "france-001", name: "France", code: "FRA" },
    { id: "germany-001", name: "Germany", code: "DEU" },
    { id: "italy-001", name: "Italy", code: "ITA" },
    { id: "netherlands-001", name: "Netherlands", code: "NLD" },
    { id: "belgium-001", name: "Belgium", code: "BEL" },
    { id: "portugal-001", name: "Portugal", code: "PRT" },
    { id: "austria-001", name: "Austria", code: "AUT" },
    { id: "switzerland-001", name: "Switzerland", code: "CHE" },
  ]

  const genders = [
    { id: "male", name: "Male" },
    { id: "female", name: "Female" },
  ]

  const maritalStatuses = [
    { id: "single", name: "Single" },
    { id: "married", name: "Married" },
    { id: "divorced", name: "Divorced" },
    { id: "widowed", name: "Widowed" },
  ]

  const passportTypes = [
    { id: "0a152f62-b7b2-49ad-893e-b41b15e2bef3", name: "Ordinary Passport" },
    { id: "diplomatic", name: "Diplomatic Passport" },
    { id: "service", name: "Service Passport" },
  ]

  const occupations = [
    { id: "student", name: "Student" },
    { id: "employee", name: "Employee" },
    { id: "self-employed", name: "Self-employed" },
    { id: "unemployed", name: "Unemployed" },
    { id: "retired", name: "Retired" },
    { id: "housewife", name: "Housewife/Househusband" },
    { id: "freelancer", name: "Freelancer" },
    { id: "business-owner", name: "Business Owner" },
    { id: "teacher", name: "Teacher" },
    { id: "doctor", name: "Doctor" },
    { id: "engineer", name: "Engineer" },
    { id: "lawyer", name: "Lawyer" },
    { id: "other", name: "Other" },
  ]

  const journeyPurposes = [
    { id: "82a413f6-0e05-4ac0-8224-61432e8dfa44", name: "Tourism" },
    { id: "business", name: "Business" },
    { id: "family", name: "Family Visit" },
    { id: "study", name: "Study" },
    { id: "medical", name: "Medical Treatment" },
    { id: "transit", name: "Transit" },
    { id: "official", name: "Official Visit" },
    { id: "cultural", name: "Cultural/Sports Event" },
    { id: "conference", name: "Conference/Seminar" },
    { id: "training", name: "Training" },
    { id: "work", name: "Work/Employment" },
    { id: "other", name: "Other" },
  ]

  const schengenCountries = [
    { id: "1bdacc6c-cb25-4142-b210-bb058f4ffecf", name: "Spain", code: "ESP" },
    { id: "france", name: "France", code: "FRA" },
    { id: "germany", name: "Germany", code: "DEU" },
    { id: "italy", name: "Italy", code: "ITA" },
    { id: "netherlands", name: "Netherlands", code: "NLD" },
    { id: "belgium", name: "Belgium", code: "BEL" },
    { id: "portugal", name: "Portugal", code: "PRT" },
    { id: "austria", name: "Austria", code: "AUT" },
    { id: "greece", name: "Greece", code: "GRC" },
    { id: "denmark", name: "Denmark", code: "DNK" },
    { id: "sweden", name: "Sweden", code: "SWE" },
    { id: "norway", name: "Norway", code: "NOR" },
    { id: "finland", name: "Finland", code: "FIN" },
    { id: "iceland", name: "Iceland", code: "ISL" },
    { id: "luxembourg", name: "Luxembourg", code: "LUX" },
    { id: "czech", name: "Czech Republic", code: "CZE" },
    { id: "poland", name: "Poland", code: "POL" },
    { id: "hungary", name: "Hungary", code: "HUN" },
    { id: "slovakia", name: "Slovakia", code: "SVK" },
    { id: "slovenia", name: "Slovenia", code: "SVN" },
    { id: "estonia", name: "Estonia", code: "EST" },
    { id: "latvia", name: "Latvia", code: "LVA" },
    { id: "lithuania", name: "Lithuania", code: "LTU" },
    { id: "malta", name: "Malta", code: "MLT" },
  ]

  const entriesOptions = [
    { id: "2545f664-6779-43ea-be61-d405908131cd", name: "Single Entry" },
    { id: "multiple", name: "Multiple Entry" },
  ]

  const accommodationTypes = [
    { id: "hotel", name: "Hotel" },
    { id: "hostel", name: "Hostel" },
    { id: "apartment", name: "Apartment/Rental" },
    { id: "friend", name: "Friend/Family" },
    { id: "other", name: "Other" },
  ]

  const transportationModes = [
    { id: "plane", name: "Airplane" },
    { id: "car", name: "Car" },
    { id: "bus", name: "Bus" },
    { id: "train", name: "Train" },
    { id: "ship", name: "Ship/Ferry" },
    { id: "other", name: "Other" },
  ]

  const schengenVisaTypes = [
    { id: "tourist", name: "Tourist/Visitor (C)" },
    { id: "business", name: "Business (C)" },
    { id: "transit", name: "Transit (A)" },
    { id: "study", name: "Study (D)" },
    { id: "work", name: "Work (D)" },
    { id: "family", name: "Family Reunion (D)" },
    { id: "other", name: "Other" },
  ]

  useEffect(() => {
    // Load saved applicants count and any saved data
    const loadSavedData = async () => {
      setIsLoading(true)
      try {
        // Load saved count with proper error handling
        try {
          const countResponse = await fetch("/api/applicant/count")
          if (countResponse.ok) {
            const countText = await countResponse.text()
            try {
              const countData = JSON.parse(countText)
              setSavedApplicants(countData.count || 0)
            } catch (parseError) {
              console.warn("Failed to parse count response, using default:", parseError)
              setSavedApplicants(0)
            }
          } else {
            console.warn("Count API returned non-OK status:", countResponse.status)
            setSavedApplicants(0)
          }
        } catch (countError) {
          console.warn("Failed to fetch applicant count:", countError)
          setSavedApplicants(0)
        }

        // Load any saved form data with proper error handling
        try {
          const savedResponse = await fetch("/api/applicant/load")
          if (savedResponse.ok) {
            const savedText = await savedResponse.text()
            try {
              const savedData = JSON.parse(savedText)
              if (savedData.success && savedData.data) {
                setIsGroupBooking(savedData.data.isGroupBooking || false)
                setNumberOfApplicants(savedData.data.numberOfApplicants || 1)
                setApplicantsData(savedData.data.applicants || applicantsData)
                setCurrentApplicantIndex(savedData.data.currentApplicantIndex || 0)
                setCurrentSection(savedData.data.currentSection || 0)
              }
            } catch (parseError) {
              console.warn("Failed to parse saved data response, using defaults:", parseError)
            }
          } else {
            console.warn("Load API returned non-OK status:", savedResponse.status)
          }
        } catch (loadError) {
          console.warn("Failed to fetch saved data:", loadError)
        }
      } catch (error) {
        console.error("Load data error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSavedData()
  }, [])

  const onDataChangeRef = useRef(onDataChange)
  onDataChangeRef.current = onDataChange

  // Update parent component when data changes
  useEffect(() => {
    const dataToSend = {
      isGroupBooking,
      numberOfApplicants,
      applicants: applicantsData,
      currentApplicant: applicantsData[currentApplicantIndex],
    }
    onDataChangeRef.current(dataToSend)
  }, [applicantsData, isGroupBooking, numberOfApplicants, currentApplicantIndex])

  const addApplicant = () => {
    if (numberOfApplicants < 10) {
      const newApplicant = { ...applicantsData[0] } // Copy structure from first applicant
      // Reset personal data
      Object.keys(newApplicant).forEach((key) => {
        if (typeof newApplicant[key] === "string") {
          newApplicant[key] = ""
        } else if (newApplicant[key] === null || newApplicant[key] instanceof Date) {
          newApplicant[key] = null
        } else if (typeof newApplicant[key] === "boolean") {
          newApplicant[key] = false
        } else if (typeof newApplicant[key] === "number") {
          newApplicant[key] = 0
        } else if (Array.isArray(newApplicant[key])) {
          newApplicant[key] = []
        }
      })

      setApplicantsData([...applicantsData, newApplicant])
      setNumberOfApplicants(numberOfApplicants + 1)
      setShowApplicantGuide(true)
    }
  }

  const removeApplicant = (index: number) => {
    if (numberOfApplicants > 1) {
      const newApplicantsData = applicantsData.filter((_, i) => i !== index)
      setApplicantsData(newApplicantsData)
      setNumberOfApplicants(numberOfApplicants - 1)

      // Adjust current index if needed
      if (currentApplicantIndex >= numberOfApplicants - 1) {
        setCurrentApplicantIndex(numberOfApplicants - 2)
      }
    }
  }

  const updateFormData = (field: string, value: any) => {
    const newApplicantsData = [...applicantsData]
    newApplicantsData[currentApplicantIndex] = {
      ...newApplicantsData[currentApplicantIndex],
      [field]: value,
    }
    setApplicantsData(newApplicantsData)
  }

  const getCurrentFormData = () => {
    return applicantsData[currentApplicantIndex] || applicantsData[0]
  }

  const validateSection = (sectionIndex: number) => {
    const errors = {}
    const section = sections[sectionIndex]
    const formData = getCurrentFormData()

    switch (section.key) {
      case "booking-type":
        // No validation needed for booking type
        break
      case "personal":
        if (!formData.Surname) errors.Surname = "Surname is required"
        if (!formData.FirstName) errors.FirstName = "First name is required"
        if (!formData.LastName) errors.LastName = "Last name is required"
        if (!formData.DateOfBirth) errors.DateOfBirth = "Date of birth is required"
        if (!formData.PlaceOfBirth) errors.PlaceOfBirth = "Place of birth is required"
        if (!formData.GenderId) errors.GenderId = "Gender is required"
        if (!formData.MaritalStatusId) errors.MaritalStatusId = "Marital status is required"
        break
      case "contact":
        if (!formData.PhoneNumber) errors.PhoneNumber = "Phone number is required"
        if (!formData.EmailAddress) errors.EmailAddress = "Email address is required"
        if (formData.EmailAddress && !/\S+@\S+\.\S+/.test(formData.EmailAddress)) {
          errors.EmailAddress = "Please enter a valid email address"
        }
        break
      case "passport":
        if (!formData.PassportNo) errors.PassportNo = "Passport number is required"
        if (!formData.IssueDate) errors.IssueDate = "Issue date is required"
        if (!formData.ExpiryDate) errors.ExpiryDate = "Expiry date is required"
        if (!formData.IssuePlace) errors.IssuePlace = "Issue place is required"
        if (!formData.TravelDate) errors.TravelDate = "Travel date is required"
        break
      case "travel":
        if (!formData.MainDestinationCity) errors.MainDestinationCity = "Main destination city is required"
        if (!formData.IntendedDateOfArrival) errors.IntendedDateOfArrival = "Arrival date is required"
        if (!formData.IntendedDateOfDeparture) errors.IntendedDateOfDeparture = "Departure date is required"
        if (!formData.TravelPurposeDetails) errors.TravelPurposeDetails = "Travel purpose details are required"
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const markSectionCompleted = (sectionIndex: number) => {
    const newApplicantsData = [...applicantsData]
    const currentApplicant = newApplicantsData[currentApplicantIndex]

    if (!currentApplicant.completedSections) {
      currentApplicant.completedSections = []
    }

    if (!currentApplicant.completedSections.includes(sectionIndex)) {
      currentApplicant.completedSections.push(sectionIndex)
    }

    setApplicantsData(newApplicantsData)
  }

  const nextSection = () => {
    if (validateSection(currentSection)) {
      markSectionCompleted(currentSection)
      setCurrentSection(Math.min(currentSection + 1, sections.length - 1))
    }
  }

  const prevSection = () => {
    setCurrentSection(Math.max(currentSection - 1, 0))
  }

  const saveCurrentApplicant = async () => {
    setIsSaving(true)
    try {
      const currentApplicant = getCurrentFormData()

      // Convert files to base64 for storage
      const processedApplicant = { ...currentApplicant }

      if (currentApplicant.PhotoId) {
        processedApplicant.PhotoId = await fileToBase64(currentApplicant.PhotoId)
      }

      if (currentApplicant.Selfie) {
        processedApplicant.Selfie = await fileToBase64(currentApplicant.Selfie)
      }

      const dataToSave = {
        isGroupBooking,
        numberOfApplicants,
        currentApplicantIndex,
        currentSection,
        applicant: processedApplicant,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch("/api/applicant/save-individual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      })

      if (response.ok) {
        const result = await response.json()

        // Mark current applicant as saved
        const newApplicantsData = [...applicantsData]
        newApplicantsData[currentApplicantIndex].isSaved = true
        newApplicantsData[currentApplicantIndex].applicantId = result.applicantId
        setApplicantsData(newApplicantsData)

        // Show success message
        alert(`Applicant ${currentApplicantIndex + 1} data saved successfully!`)

        // Auto-save form state
        await saveFormState()

        return true
      } else {
        throw new Error("Failed to save applicant data")
      }
    } catch (error) {
      console.error("Save error:", error)
      alert("Failed to save applicant data. Please try again.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const saveFormState = async () => {
    try {
      const formState = {
        isGroupBooking,
        numberOfApplicants,
        currentApplicantIndex,
        currentSection,
        applicants: applicantsData,
        timestamp: new Date().toISOString(),
      }

      await fetch("/api/applicant/save-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      })
    } catch (error) {
      console.error("Failed to save form state:", error)
    }
  }

  const saveAllApplicants = async () => {
    setIsSaving(true)
    try {
      // Convert files to base64 for storage
      const dataToSave = {
        isGroupBooking,
        numberOfApplicants,
        applicants: await Promise.all(
          applicantsData.map(async (applicant) => {
            const processedApplicant = { ...applicant }

            if (applicant.PhotoId) {
              processedApplicant.PhotoId = await fileToBase64(applicant.PhotoId)
            }

            if (applicant.Selfie) {
              processedApplicant.Selfie = await fileToBase64(applicant.Selfie)
            }

            return processedApplicant
          }),
        ),
      }

      const response = await fetch("/api/applicant/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      })

      if (response.ok) {
        const result = await response.json()

        // Mark all applicants as saved
        const newApplicantsData = applicantsData.map((applicant, index) => ({
          ...applicant,
          isSaved: true,
          isCompleted: true,
          applicantId: result.applicantIds?.[index] || `APP-${Date.now()}-${index}`,
        }))
        setApplicantsData(newApplicantsData)

        setSavedApplicants((prev) => prev + numberOfApplicants)
        alert(`${isGroupBooking ? "Group booking" : "Individual booking"} data saved successfully!`)

        return true
      } else {
        throw new Error("Failed to save all applicants")
      }
    } catch (error) {
      console.error("Save error:", error)
      alert("Failed to save applicant data. Please try again.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const isCurrentApplicantComplete = () => {
    const applicant = getCurrentFormData()
    return (
      applicant.Surname &&
      applicant.FirstName &&
      applicant.LastName &&
      applicant.DateOfBirth &&
      applicant.PhoneNumber &&
      applicant.EmailAddress &&
      applicant.PassportNo &&
      applicant.IssueDate &&
      applicant.ExpiryDate &&
      applicant.MainDestinationCity &&
      applicant.IntendedDateOfArrival &&
      applicant.IntendedDateOfDeparture
    )
  }

  const isFormComplete = () => {
    return applicantsData.every(
      (applicant) =>
        applicant.Surname &&
        applicant.FirstName &&
        applicant.LastName &&
        applicant.DateOfBirth &&
        applicant.PhoneNumber &&
        applicant.EmailAddress &&
        applicant.PassportNo &&
        applicant.IssueDate &&
        applicant.ExpiryDate &&
        applicant.MainDestinationCity &&
        applicant.IntendedDateOfArrival &&
        applicant.IntendedDateOfDeparture,
    )
  }

  const getApplicantCompletionStatus = (index: number) => {
    const applicant = applicantsData[index]
    if (!applicant) return { completed: false, saved: false }

    const completed =
      applicant.Surname &&
      applicant.FirstName &&
      applicant.LastName &&
      applicant.DateOfBirth &&
      applicant.PhoneNumber &&
      applicant.EmailAddress &&
      applicant.PassportNo &&
      applicant.IssueDate &&
      applicant.ExpiryDate &&
      applicant.MainDestinationCity &&
      applicant.IntendedDateOfArrival &&
      applicant.IntendedDateOfDeparture

    return {
      completed,
      saved: applicant.isSaved || false,
      sectionsCompleted: applicant.completedSections?.length || 0,
      totalSections: sections.length - 1, // Exclude booking type section
    }
  }

  const switchToApplicant = (index: number) => {
    if (isGroupBooking) {
      // Save current form state before switching
      saveFormState()
      setCurrentApplicantIndex(index)
      setCurrentSection(1) // Start from personal details for other applicants
    }
  }

  const proceedToNextApplicant = async () => {
    if (isCurrentApplicantComplete()) {
      // Save current applicant
      const saved = await saveCurrentApplicant()
      if (saved && currentApplicantIndex < numberOfApplicants - 1) {
        setCurrentApplicantIndex(currentApplicantIndex + 1)
        setCurrentSection(1) // Start from personal details
        setShowApplicantGuide(true)
      }
    } else {
      alert("Please complete all required fields for the current applicant before proceeding.")
    }
  }

  const progress = ((currentSection + 1) / sections.length) * 100
  const formData = getCurrentFormData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your application data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                BLS Spain Algeria Visa Application Form
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Complete all sections for 100% BLS compliance
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  <Users className="w-4 h-4 mr-1" />
                  {savedApplicants}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">Saved Applicants</p>
              </div>

              {/* Save Current Applicant Button */}
              {isCurrentApplicantComplete() && !getCurrentFormData().isSaved && (
                <Button
                  onClick={saveCurrentApplicant}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Current"}
                </Button>
              )}

              {/* Save All Button */}
              {isFormComplete() && (
                <Button
                  onClick={saveAllApplicants}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : `Save All ${isGroupBooking ? "Group" : "Individual"}`}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span className="font-medium">
                {sections[currentSection].title} ({currentSection + 1} of {sections.length})
              </span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200" />
          </div>

          {/* Family Booking Guide */}
          {isGroupBooking && showApplicantGuide && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Family Booking Guide:</strong> Complete the form for Applicant {currentApplicantIndex + 1}{" "}
                    first, then proceed to the next family member. Each applicant will be saved individually.
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApplicantGuide(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Got it
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Group Booking Indicator with Applicant Status */}
          {isGroupBooking && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Family Booking - {numberOfApplicants} Applicants</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600">
                    Currently editing: Applicant {currentApplicantIndex + 1}
                  </span>
                </div>
              </div>

              {/* Applicant Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {applicantsData.map((_, index) => {
                  const status = getApplicantCompletionStatus(index)
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        index === currentApplicantIndex
                          ? "border-blue-500 bg-blue-100"
                          : status.completed
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => switchToApplicant(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              status.completed
                                ? "bg-green-500 text-white"
                                : index === currentApplicantIndex
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {status.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">Applicant {index + 1}</p>
                            <p className="text-xs text-gray-500">
                              {status.sectionsCompleted}/{status.totalSections} sections
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {status.saved && (
                            <Badge variant="secondary" className="text-xs">
                              <Save className="w-3 h-3 mr-1" />
                              Saved
                            </Badge>
                          )}
                          {status.completed && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Next Applicant Button */}
              {isGroupBooking && currentApplicantIndex < numberOfApplicants - 1 && isCurrentApplicantComplete() && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={proceedToNextApplicant}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isSaving}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Save & Continue to Applicant {currentApplicantIndex + 2}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Section Navigation */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {sections.map((section, index) => {
              const Icon = section.icon
              const isCompleted = getCurrentFormData().completedSections?.includes(index) || false
              return (
                <Button
                  key={index}
                  variant={index === currentSection ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentSection(index)}
                  className={`flex items-center gap-2 whitespace-nowrap ${
                    index === currentSection
                      ? "bg-blue-600 text-white shadow-md"
                      : isCompleted
                        ? "border-green-500 text-green-700 hover:bg-green-50"
                        : "hover:bg-blue-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.title}
                  {isCompleted && <CheckCircle className="w-3 h-3 ml-1" />}
                </Button>
              )
            })}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              {React.createElement(sections[currentSection].icon, { className: "w-5 h-5 text-blue-600" })}
              {sections[currentSection].title}
              {isGroupBooking && currentSection > 0 && (
                <Badge variant="outline" className="ml-2">
                  Applicant {currentApplicantIndex + 1} of {numberOfApplicants}
                </Badge>
              )}
            </h3>

            {/* Section 0: Booking Type */}
            {currentSection === 0 && (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Users className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Choose whether you're booking for yourself only or for a family/group. Group bookings will receive a
                    master booking ID with individual appointment references for each member.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card
                    className={`cursor-pointer transition-all ${!isGroupBooking ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                    onClick={() => setIsGroupBooking(false)}
                  >
                    <CardContent className="p-6 text-center">
                      <User className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-lg font-semibold mb-2">Individual Booking</h3>
                      <p className="text-gray-600 text-sm">Book appointment for yourself only</p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${isGroupBooking ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                    onClick={() => setIsGroupBooking(true)}
                  >
                    <CardContent className="p-6 text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-lg font-semibold mb-2">Family/Group Booking</h3>
                      <p className="text-gray-600 text-sm">Book appointments for multiple family members</p>
                    </CardContent>
                  </Card>
                </div>

                {isGroupBooking && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Number of Applicants</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (numberOfApplicants > 1) {
                              removeApplicant(numberOfApplicants - 1)
                            }
                          }}
                          disabled={numberOfApplicants <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-semibold min-w-[2rem] text-center">{numberOfApplicants}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addApplicant}
                          disabled={numberOfApplicants >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Alert className="border-green-200 bg-green-50">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Family Booking Process:</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                          <li>Complete and save the form for Applicant 1</li>
                          <li>Proceed to Applicant 2 and complete their form</li>
                          <li>Continue until all family members are completed</li>
                          <li>Submit the complete family booking</li>
                        </ol>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}

            {/* Section 1: Personal Details */}
            {currentSection === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="surname" className="text-sm font-medium text-gray-700">
                      Surname (Family Name) *
                    </Label>
                    <Input
                      id="surname"
                      value={formData.Surname}
                      onChange={(e) => updateFormData("Surname", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                      required
                    />
                    {validationErrors.Surname && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.Surname}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name (Given Name) *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.FirstName}
                      onChange={(e) => updateFormData("FirstName", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                      required
                    />
                    {validationErrors.FirstName && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.FirstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.LastName}
                      onChange={(e) => updateFormData("LastName", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                      required
                    />
                    {validationErrors.LastName && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.LastName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="previousName" className="text-sm font-medium text-gray-700">
                      Previous Name
                    </Label>
                    <Input
                      id="previousName"
                      value={formData.PreviousName}
                      onChange={(e) => updateFormData("PreviousName", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Date of Birth *</Label>
                    <DatePicker
                      date={formData.DateOfBirth}
                      onSelect={(date) => updateFormData("DateOfBirth", date)}
                      placeholder="Select date of birth (yyyy-mm-dd)"
                      disabled={(date) => date > new Date()}
                      yearRange={{ from: 1900, to: new Date().getFullYear() }}
                      className="mt-1"
                    />
                    {validationErrors.DateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.DateOfBirth}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="placeOfBirth" className="text-sm font-medium text-gray-700">
                      Place of Birth *
                    </Label>
                    <Input
                      id="placeOfBirth"
                      value={formData.PlaceOfBirth}
                      onChange={(e) => updateFormData("PlaceOfBirth", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                      required
                    />
                    {validationErrors.PlaceOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.PlaceOfBirth}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="countryOfBirth" className="text-sm font-medium text-gray-700">
                      Country of Birth *
                    </Label>
                    <Select
                      value={formData.CountryOfBirthId}
                      onValueChange={(value) => updateFormData("CountryOfBirthId", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                      Gender *
                    </Label>
                    <Select value={formData.GenderId} onValueChange={(value) => updateFormData("GenderId", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender.id} value={gender.id}>
                            {gender.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.GenderId && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.GenderId}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="maritalStatus" className="text-sm font-medium text-gray-700">
                      Marital Status *
                    </Label>
                    <Select
                      value={formData.MaritalStatusId}
                      onValueChange={(value) => updateFormData("MaritalStatusId", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        {maritalStatuses.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.MaritalStatusId && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.MaritalStatusId}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                  <Checkbox
                    id="isMinor"
                    checked={formData.IsMinor}
                    onCheckedChange={(checked) => updateFormData("IsMinor", checked)}
                  />
                  <Label htmlFor="isMinor" className="text-sm font-medium">
                    In the case of minors, details of parental authority/legal guardian
                  </Label>
                </div>

                {/* Minor Details - Conditional */}
                {formData.IsMinor && (
                  <div className="border-l-4 border-blue-500 pl-6 space-y-4 bg-blue-50 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Parental/Guardian Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minorParentSurname">Parent/Guardian Surname *</Label>
                        <Input
                          id="minorParentSurname"
                          value={formData.MinorParentSurname}
                          onChange={(e) => updateFormData("MinorParentSurname", e.target.value.toUpperCase())}
                          className="uppercase"
                          required={formData.IsMinor}
                        />
                      </div>
                      <div>
                        <Label htmlFor="minorParentFirstName">Parent/Guardian First Name *</Label>
                        <Input
                          id="minorParentFirstName"
                          value={formData.MinorParentFirstName}
                          onChange={(e) => updateFormData("MinorParentFirstName", e.target.value.toUpperCase())}
                          className="uppercase"
                          required={formData.IsMinor}
                        />
                      </div>
                      <div>
                        <Label htmlFor="minorParentLastName">Parent/Guardian Last Name *</Label>
                        <Input
                          id="minorParentLastName"
                          value={formData.MinorParentLastName}
                          onChange={(e) => updateFormData("MinorParentLastName", e.target.value.toUpperCase())}
                          className="uppercase"
                          required={formData.IsMinor}
                        />
                      </div>
                      <div>
                        <Label htmlFor="minorParentNationality">Parent/Guardian Nationality *</Label>
                        <Select
                          value={formData.MinorParentNationalityId}
                          onValueChange={(value) => updateFormData("MinorParentNationalityId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="minorParentAddress">Parent/Guardian Address *</Label>
                        <Input
                          id="minorParentAddress"
                          value={formData.MinorParentAddress}
                          onChange={(e) => updateFormData("MinorParentAddress", e.target.value.toUpperCase())}
                          className="uppercase"
                          required={formData.IsMinor}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 2: Contact & Photos */}
            {currentSection === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.PhoneNumber}
                      onChange={(e) => updateFormData("PhoneNumber", e.target.value)}
                      placeholder="+213 XXX XXX XXX"
                      className="mt-1"
                      required
                    />
                    {validationErrors.PhoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.PhoneNumber}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="emailAddress" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={formData.EmailAddress}
                      onChange={(e) => updateFormData("EmailAddress", e.target.value.toLowerCase())}
                      placeholder="your.email@example.com"
                      className="mt-1"
                      required
                    />
                    {validationErrors.EmailAddress && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.EmailAddress}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FileUpload
                      onFileSelect={(file) => updateFormData("PhotoId", file)}
                      accept="image/*"
                      maxSize={5}
                      preview={true}
                      placeholder="Upload your passport photo"
                      file={formData.PhotoId}
                      label="Photo ID / Passport Photo"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Upload a clear passport-style photo (JPEG/PNG, max 5MB). You can preview and delete photos after
                      upload.
                    </p>
                  </div>
                  <div>
                    <FileUpload
                      onFileSelect={(file) => updateFormData("Selfie", file)}
                      accept="image/*"
                      maxSize={5}
                      preview={true}
                      placeholder="Upload a recent selfie"
                      file={formData.Selfie}
                      label="Selfie (Optional)"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Upload a clear selfie for identity verification (JPEG/PNG, max 5MB). Optional but recommended.
                    </p>
                  </div>
                </div>

                <Alert>
                  <Camera className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Photo Management:</strong> After uploading, you can immediately view your photos in full
                    screen, replace them with better ones, or delete them completely if you're not satisfied. Photos
                    should be clear, well-lit, and show your face clearly. Passport photos should follow standard
                    guidelines (white background, neutral expression).
                  </AlertDescription>
                </Alert>

                {/* Photo Status Indicators */}
                {(formData.PhotoId || formData.Selfie) && (
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Photos Uploaded:</span>
                    </div>
                    <div className="flex gap-3">
                      {formData.PhotoId && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Photo ID
                        </Badge>
                      )}
                      {formData.Selfie && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Selfie
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 3: Passport Details */}
            {currentSection === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="nationalIdentityNumber" className="text-sm font-medium text-gray-700">
                    National Identity Number
                  </Label>
                  <Input
                    id="nationalIdentityNumber"
                    value={formData.NationalIdentityNumber}
                    onChange={(e) => updateFormData("NationalIdentityNumber", e.target.value.toUpperCase())}
                    className="mt-1 uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="passportType" className="text-sm font-medium text-gray-700">
                    Passport Type *
                  </Label>
                  <Select
                    value={formData.PassportType}
                    onValueChange={(value) => updateFormData("PassportType", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select passport type" />
                    </SelectTrigger>
                    <SelectContent>
                      {passportTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="passportNo" className="text-sm font-medium text-gray-700">
                    Passport Number *
                  </Label>
                  <Input
                    id="passportNo"
                    value={formData.PassportNo}
                    onChange={(e) => updateFormData("PassportNo", e.target.value.toUpperCase())}
                    className="mt-1 uppercase"
                    required
                  />
                  {validationErrors.PassportNo && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.PassportNo}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="issuePlace" className="text-sm font-medium text-gray-700">
                    Issue Place *
                  </Label>
                  <Input
                    id="issuePlace"
                    value={formData.IssuePlace}
                    onChange={(e) => updateFormData("IssuePlace", e.target.value.toUpperCase())}
                    className="mt-1 uppercase"
                    required
                  />
                  {validationErrors.IssuePlace && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.IssuePlace}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Issue Date *</Label>
                  <DatePicker
                    date={formData.IssueDate}
                    onSelect={(date) => updateFormData("IssueDate", date)}
                    placeholder="Select issue date (yyyy-mm-dd)"
                    disabled={(date) => date > new Date()}
                    yearRange={{ from: 1990, to: new Date().getFullYear() }}
                    className="mt-1"
                  />
                  {validationErrors.IssueDate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.IssueDate}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Expiry Date *</Label>
                  <DatePicker
                    date={formData.ExpiryDate}
                    onSelect={(date) => updateFormData("ExpiryDate", date)}
                    placeholder="Select expiry date (yyyy-mm-dd)"
                    disabled={(date) => date < new Date()}
                    yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 20 }}
                    className="mt-1"
                  />
                  {validationErrors.ExpiryDate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.ExpiryDate}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="issueCountry" className="text-sm font-medium text-gray-700">
                    Issue Country *
                  </Label>
                  <Select
                    value={formData.IssueCountryId}
                    onValueChange={(value) => updateFormData("IssueCountryId", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Travel Date *</Label>
                  <DatePicker
                    date={formData.TravelDate}
                    onSelect={(date) => updateFormData("TravelDate", date)}
                    placeholder="Select travel date (yyyy-mm-dd)"
                    disabled={(date) => date < new Date()}
                    yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 2 }}
                    className="mt-1"
                  />
                  {validationErrors.TravelDate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.TravelDate}</p>
                  )}
                </div>
              </div>
            )}

            {/* Section 4: Address & Contact Details */}
            {currentSection === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="homeAddressLine1" className="text-sm font-medium text-gray-700">
                      Home Address Line 1
                    </Label>
                    <Input
                      id="homeAddressLine1"
                      value={formData.HomeAddressLine1}
                      onChange={(e) => updateFormData("HomeAddressLine1", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                    />
                  </div>
                  <div>
                    <Label htmlFor="homeAddressLine2" className="text-sm font-medium text-gray-700">
                      Home Address Line 2
                    </Label>
                    <Input
                      id="homeAddressLine2"
                      value={formData.HomeAddressLine2}
                      onChange={(e) => updateFormData("HomeAddressLine2", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                    />
                  </div>
                  <div>
                    <Label htmlFor="homeAddressCountry" className="text-sm font-medium text-gray-700">
                      Country
                    </Label>
                    <Select
                      value={formData.HomeAddressCountryId}
                      onValueChange={(value) => updateFormData("HomeAddressCountryId", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="homeAddressState" className="text-sm font-medium text-gray-700">
                      State
                    </Label>
                    <Input
                      id="homeAddressState"
                      value={formData.HomeAddressState}
                      onChange={(e) => updateFormData("HomeAddressState", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                    />
                  </div>
                  <div>
                    <Label htmlFor="homeAddressCity" className="text-sm font-medium text-gray-700">
                      City
                    </Label>
                    <Input
                      id="homeAddressCity"
                      value={formData.HomeAddressCity}
                      onChange={(e) => updateFormData("HomeAddressCity", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                    />
                  </div>
                  <div>
                    <Label htmlFor="homeAddressPostalCode" className="text-sm font-medium text-gray-700">
                      Postal Code
                    </Label>
                    <Input
                      id="homeAddressPostalCode"
                      value={formData.HomeAddressPostalCode}
                      onChange={(e) => updateFormData("HomeAddressPostalCode", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                    />
                  </div>
                  <div>
                    <Label htmlFor="homeAddressContactNumber" className="text-sm font-medium text-gray-700">
                      Contact Number
                    </Label>
                    <Input
                      id="homeAddressContactNumber"
                      value={formData.HomeAddressContactNumber}
                      onChange={(e) => updateFormData("HomeAddressContactNumber", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                  <Checkbox
                    id="hasOtherResidenceship"
                    checked={formData.HasOtherResidenceship}
                    onCheckedChange={(checked) => updateFormData("HasOtherResidenceship", checked)}
                  />
                  <Label htmlFor="hasOtherResidenceship" className="text-sm font-medium">
                    Residence in a country other than the country of current nationality
                  </Label>
                </div>

                {/* Other Residenceship Details - Conditional */}
                {formData.HasOtherResidenceship && (
                  <div className="border-l-4 border-blue-500 pl-6 space-y-4 bg-blue-50 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Other Residenceship Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="otherResidenceshipPermitNumber">Permit Number *</Label>
                        <Input
                          id="otherResidenceshipPermitNumber"
                          value={formData.OtherResidenceshipPermitNumber}
                          onChange={(e) =>
                            updateFormData("OtherResidenceshipPermitNumber", e.target.value.toUpperCase())
                          }
                          className="uppercase"
                          required={formData.HasOtherResidenceship}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Permit Valid Until *</Label>
                        <DatePicker
                          date={formData.OtherResidenceshipPermitValidUntill}
                          onSelect={(date) => updateFormData("OtherResidenceshipPermitValidUntill", date)}
                          placeholder="Select permit expiry date"
                          disabled={(date) => date < new Date()}
                          yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 20 }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 5: Travel Information */}
            {currentSection === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="purposeOfJourney" className="text-sm font-medium text-gray-700">
                      Purpose of Journey *
                    </Label>
                    <Select
                      value={formData.PurposeOfJourneyId}
                      onValueChange={(value) => updateFormData("PurposeOfJourneyId", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {journeyPurposes.map((purpose) => (
                          <SelectItem key={purpose.id} value={purpose.id}>
                            {purpose.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="memberStateDestination" className="text-sm font-medium text-gray-700">
                      Member State Destination *
                    </Label>
                    <Select
                      value={formData.MemberStateDestinationId}
                      onValueChange={(value) => updateFormData("MemberStateDestinationId", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {schengenCountries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="memberStateSecondDestination" className="text-sm font-medium text-gray-700">
                      Member State Second Destination
                    </Label>
                    <Select
                      value={formData.MemberStateSecondDestinationId}
                      onValueChange={(value) => updateFormData("MemberStateSecondDestinationId", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select second destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {schengenCountries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="memberStateFirstEntry" className="text-sm font-medium text-gray-700">
                      Member State First Entry *
                    </Label>
                    <Select
                      value={formData.MemberStateFirstEntryId}
                      onValueChange={(value) => updateFormData("MemberStateFirstEntryId", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select first entry" />
                      </SelectTrigger>
                      <SelectContent>
                        {schengenCountries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="numberOfEntriesRequested" className="text-sm font-medium text-gray-700">
                      Number of Entries Requested
                    </Label>
                    <Select
                      value={formData.NumberOfEntriesRequested}
                      onValueChange={(value) => updateFormData("NumberOfEntriesRequested", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select entries" />
                      </SelectTrigger>
                      <SelectContent>
                        {entriesOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="intendedStayDuration" className="text-sm font-medium text-gray-700">
                      Intended Stay Duration (days)
                    </Label>
                    <Input
                      id="intendedStayDuration"
                      type="number"
                      min="1"
                      max="90"
                      value={formData.IntendedStayDuration}
                      onChange={(e) => updateFormData("IntendedStayDuration", Number.parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="mainDestinationCity" className="text-sm font-medium text-gray-700">
                        Main Destination City *
                      </Label>
                      <Input
                        id="mainDestinationCity"
                        value={formData.MainDestinationCity}
                        onChange={(e) => updateFormData("MainDestinationCity", e.target.value.toUpperCase())}
                        className="mt-1 uppercase"
                        required
                      />
                      {validationErrors.MainDestinationCity && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.MainDestinationCity}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="mainDestinationAddress" className="text-sm font-medium text-gray-700">
                        Main Destination Address
                      </Label>
                      <Input
                        id="mainDestinationAddress"
                        value={formData.MainDestinationAddress}
                        onChange={(e) => updateFormData("MainDestinationAddress", e.target.value.toUpperCase())}
                        className="mt-1 uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Intended Date of Arrival *</Label>
                      <DatePicker
                        date={formData.IntendedDateOfArrival}
                        onSelect={(date) => updateFormData("IntendedDateOfArrival", date)}
                        placeholder="Select arrival date (yyyy-mm-dd)"
                        disabled={(date) => date < new Date()}
                        yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 2 }}
                        className="mt-1"
                      />
                      {validationErrors.IntendedDateOfArrival && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.IntendedDateOfArrival}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Intended Date of Departure *</Label>
                      <DatePicker
                        date={formData.IntendedDateOfDeparture}
                        onSelect={(date) => updateFormData("IntendedDateOfDeparture", date)}
                        placeholder="Select departure date (yyyy-mm-dd)"
                        disabled={(date) => date < new Date()}
                        yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 2 }}
                        className="mt-1"
                      />
                      {validationErrors.IntendedDateOfDeparture && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.IntendedDateOfDeparture}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="travelPurposeDetails" className="text-sm font-medium text-gray-700">
                      Travel Purpose Details *
                    </Label>
                    <Textarea
                      id="travelPurposeDetails"
                      value={formData.TravelPurposeDetails}
                      onChange={(e) => updateFormData("TravelPurposeDetails", e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Provide detailed information about your travel purpose..."
                      required
                    />
                    {validationErrors.TravelPurposeDetails && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.TravelPurposeDetails}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="accommodationType" className="text-sm font-medium text-gray-700">
                        Accommodation Type
                      </Label>
                      <Select
                        value={formData.AccommodationType}
                        onValueChange={(value) => updateFormData("AccommodationType", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select accommodation type" />
                        </SelectTrigger>
                        <SelectContent>
                          {accommodationTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="accommodationName" className="text-sm font-medium text-gray-700">
                        Accommodation Name
                      </Label>
                      <Input
                        id="accommodationName"
                        value={formData.AccommodationName}
                        onChange={(e) => updateFormData("AccommodationName", e.target.value.toUpperCase())}
                        className="mt-1 uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="accommodationAddress" className="text-sm font-medium text-gray-700">
                        Accommodation Address
                      </Label>
                      <Input
                        id="accommodationAddress"
                        value={formData.AccommodationAddress}
                        onChange={(e) => updateFormData("AccommodationAddress", e.target.value.toUpperCase())}
                        className="mt-1 uppercase"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accommodationPhone" className="text-sm font-medium text-gray-700">
                        Accommodation Phone
                      </Label>
                      <Input
                        id="accommodationPhone"
                        value={formData.AccommodationPhone}
                        onChange={(e) => updateFormData("AccommodationPhone", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="transportationMode" className="text-sm font-medium text-gray-700">
                        Transportation Mode
                      </Label>
                      <Select
                        value={formData.TransportationMode}
                        onValueChange={(value) => updateFormData("TransportationMode", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select transportation" />
                        </SelectTrigger>
                        <SelectContent>
                          {transportationModes.map((mode) => (
                            <SelectItem key={mode.id} value={mode.id}>
                              {mode.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="flightNumber" className="text-sm font-medium text-gray-700">
                        Flight Number (if applicable)
                      </Label>
                      <Input
                        id="flightNumber"
                        value={formData.FlightNumber}
                        onChange={(e) => updateFormData("FlightNumber", e.target.value.toUpperCase())}
                        className="mt-1 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="travelItinerary" className="text-sm font-medium text-gray-700">
                      Travel Itinerary
                    </Label>
                    <Textarea
                      id="travelItinerary"
                      value={formData.TravelItinerary}
                      onChange={(e) => updateFormData("TravelItinerary", e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Provide your detailed travel itinerary..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 6: Previous Schengen Visa */}
            {currentSection === 6 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                  <Checkbox
                    id="isVisaIssuedBefore"
                    checked={formData.IsVisaIssuedBefore}
                    onCheckedChange={(checked) => updateFormData("IsVisaIssuedBefore", checked)}
                  />
                  <Label htmlFor="isVisaIssuedBefore" className="text-sm font-medium">
                    Previous Schengen Visa Details
                  </Label>
                </div>

                {/* Previous Visa Details - Conditional */}
                {formData.IsVisaIssuedBefore && (
                  <div className="border-l-4 border-blue-500 pl-6 space-y-6 bg-blue-50 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Previous Schengen Visa Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="previousSchengenVisaType" className="text-sm font-medium text-gray-700">
                          Previous Schengen Visa Type
                        </Label>
                        <Select
                          value={formData.PreviousSchengenVisaType}
                          onValueChange={(value) => updateFormData("PreviousSchengenVisaType", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select visa type" />
                          </SelectTrigger>
                          <SelectContent>
                            {schengenVisaTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="previousVisaNumber" className="text-sm font-medium text-gray-700">
                          Previous Visa Number
                        </Label>
                        <Input
                          id="previousVisaNumber"
                          value={formData.PreviousVisaNumber}
                          onChange={(e) => updateFormData("PreviousVisaNumber", e.target.value.toUpperCase())}
                          className="mt-1 uppercase"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Previous Visa Valid From</Label>
                        <DatePicker
                          date={formData.PreviousVisaValidFrom}
                          onSelect={(date) => updateFormData("PreviousVisaValidFrom", date)}
                          placeholder="Select valid from date"
                          disabled={(date) => date > new Date()}
                          yearRange={{ from: 2000, to: new Date().getFullYear() }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Previous Visa Valid To</Label>
                        <DatePicker
                          date={formData.PreviousVisaValidTo}
                          onSelect={(date) => updateFormData("PreviousVisaValidTo", date)}
                          placeholder="Select valid to date"
                          disabled={(date) => date > new Date()}
                          yearRange={{ from: 2000, to: new Date().getFullYear() }}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="previousVisaIssuedCountry" className="text-sm font-medium text-gray-700">
                          Previous Visa Issued Country
                        </Label>
                        <Select
                          value={formData.PreviousVisaIssuedCountryId}
                          onValueChange={(value) => updateFormData("PreviousVisaIssuedCountryId", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select issuing country" />
                          </SelectTrigger>
                          <SelectContent>
                            {schengenCountries.map((country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="previousSchengenEntries" className="text-sm font-medium text-gray-700">
                          Previous Schengen Entries
                        </Label>
                        <Select
                          value={formData.PreviousSchengenEntries}
                          onValueChange={(value) => updateFormData("PreviousSchengenEntries", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select entries" />
                          </SelectTrigger>
                          <SelectContent>
                            {entriesOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="previousSchengenValidityPeriod" className="text-sm font-medium text-gray-700">
                        Previous Schengen Validity Period
                      </Label>
                      <Input
                        id="previousSchengenValidityPeriod"
                        value={formData.PreviousSchengenValidityPeriod}
                        onChange={(e) => updateFormData("PreviousSchengenValidityPeriod", e.target.value)}
                        className="mt-1"
                        placeholder="e.g., 30 days, 90 days"
                      />
                    </div>

                    <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-lg border border-red-200">
                      <Checkbox
                        id="schengenVisaRefusalHistory"
                        checked={formData.SchengenVisaRefusalHistory}
                        onCheckedChange={(checked) => updateFormData("SchengenVisaRefusalHistory", checked)}
                      />
                      <Label htmlFor="schengenVisaRefusalHistory" className="text-sm font-medium text-red-800">
                        Have you ever been refused a Schengen visa?
                      </Label>
                    </div>

                    {/* Refusal Details - Conditional */}
                    {formData.SchengenVisaRefusalHistory && (
                      <div className="border-l-4 border-red-500 pl-6 space-y-4 bg-red-50 p-4 rounded-r-lg">
                        <h5 className="font-semibold text-red-700">Visa Refusal Details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Refusal Date</Label>
                            <DatePicker
                              date={formData.RefusalDate}
                              onSelect={(date) => updateFormData("RefusalDate", date)}
                              placeholder="Select refusal date"
                              disabled={(date) => date > new Date()}
                              yearRange={{ from: 2000, to: new Date().getFullYear() }}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="refusalReason" className="text-sm font-medium text-gray-700">
                              Refusal Reason
                            </Label>
                            <Textarea
                              id="refusalReason"
                              value={formData.RefusalReason}
                              onChange={(e) => updateFormData("RefusalReason", e.target.value)}
                              className="mt-1"
                              rows={3}
                              placeholder="Explain the reason for refusal..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Section 7: Employer Details */}
            {currentSection === 7 && (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Employer Details:</strong> For students, provide details of your educational establishment.
                    For unemployed applicants, you may leave these fields empty or provide details of your last
                    employer.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="employerName" className="text-sm font-medium text-gray-700">
                      Employer/Institution Name
                    </Label>
                    <Input
                      id="employerName"
                      value={formData.EmployerName}
                      onChange={(e) => updateFormData("EmployerName", e.target.value.toUpperCase())}
                      className="mt-1 uppercase"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employerPhone" className="text-sm font-medium text-gray-700">
                      Employer Contact Number
                    </Label>
                    <Input
                      id="employerPhone"
                      value={formData.EmployerPhone}
                      onChange={(e) => updateFormData("EmployerPhone", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="employerAddress" className="text-sm font-medium text-gray-700">
                    Employer Address
                  </Label>
                  <Textarea
                    id="employerAddress"
                    value={formData.EmployerAddress}
                    onChange={(e) => updateFormData("EmployerAddress", e.target.value.toUpperCase())}
                    className="mt-1 uppercase"
                    rows={3}
                    placeholder="Enter complete employer address..."
                  />
                </div>

                <div>
                  <Label htmlFor="currentOccupation" className="text-sm font-medium text-gray-700">
                    Current Occupation
                  </Label>
                  <Select
                    value={formData.CurrentOccupationId}
                    onValueChange={(value) => updateFormData("CurrentOccupationId", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      {occupations.map((occupation) => (
                        <SelectItem key={occupation.id} value={occupation.id}>
                          {occupation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Section 8: Fingerprint Details */}
            {currentSection === 8 && (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Fingerprint className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Fingerprint Information:</strong> Fingerprints collected previously for the purpose of
                    applying for a Schengen visa. If you have provided fingerprints in the last 59 months, you may be
                    exempt from providing them again.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Label className="text-base font-medium text-gray-700">
                    Fingerprints collected previously for the purpose of applying for a Schengen visa
                  </Label>

                  <RadioGroup
                    value={formData.PreviousFingerPrintStatus}
                    onValueChange={(value) => updateFormData("PreviousFingerPrintStatus", value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="0" id="fingerprint-taken" />
                      <Label htmlFor="fingerprint-taken" className="text-sm">
                        Prints taken in last 59 months for Schengen visa applications
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="1" id="fingerprint-legal" />
                      <Label htmlFor="fingerprint-legal" className="text-sm">
                        For legal reasons (under 12 years old)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="2" id="fingerprint-none" />
                      <Label htmlFor="fingerprint-none" className="text-sm">
                        No reason for exemption
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Previous Fingerprint Date - Conditional */}
                  {formData.PreviousFingerPrintStatus === "0" && (
                    <div className="border-l-4 border-blue-500 pl-6 space-y-4 bg-blue-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-700">Previous Fingerprint Date</h4>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Previous Fingerprint Date *</Label>
                        <DatePicker
                          date={formData.PreviousFingerPrintDate}
                          onSelect={(date) => updateFormData("PreviousFingerPrintDate", date)}
                          placeholder="Select fingerprint date"
                          disabled={(date) => date > new Date()}
                          yearRange={{ from: 2019, to: new Date().getFullYear() }}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Select the date when your fingerprints were last taken for a Schengen visa application.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 9: Final Destination */}
            {currentSection === 9 && (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Entry Permit Information:</strong> Entry permit for the final country of destination, where
                    applicable. Complete this section if you have an entry permit for a non-Schengen country that you
                    plan to visit after your Schengen visit.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="finalDestinationIssuedByCountry" className="text-sm font-medium text-gray-700">
                      Final Destination Issued By Country
                    </Label>
                    <Select
                      value={formData.FinalDestinationIssuedByCountryId}
                      onValueChange={(value) => updateFormData("FinalDestinationIssuedByCountryId", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Final Destination Valid From Date</Label>
                    <DatePicker
                      date={formData.FinalDestinationValidFromDate}
                      onSelect={(date) => updateFormData("FinalDestinationValidFromDate", date)}
                      placeholder="Select valid from date"
                      yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 10 }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Final Destination Valid To Date</Label>
                    <DatePicker
                      date={formData.FinalDestinationValidToDate}
                      onSelect={(date) => updateFormData("FinalDestinationValidToDate", date)}
                      placeholder="Select valid to date"
                      yearRange={{ from: new Date().getFullYear(), to: new Date().getFullYear() + 10 }}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 10: Inviting Authority */}
            {currentSection === 10 && (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Building className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Inviting Authority:</strong> Details of the inviting person(s) in the member state(s). If
                    not applicable, details of hotel(s) or temporary accommodation(s) in the member state(s).
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Label className="text-base font-medium text-gray-700">
                    Details of the inviting person(s) in the member state(s). If not applicable, details of hotel(s) or
                    temporary accommodation(s) in the member state(s)
                  </Label>

                  <RadioGroup
                    value={formData.BlsInvitingAuthority}
                    onValueChange={(value) => updateFormData("BlsInvitingAuthority", value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="0" id="inviting-company" />
                      <Label htmlFor="inviting-company" className="text-sm">
                        Inviting company/organization
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="1" id="inviting-hotel" />
                      <Label htmlFor="inviting-hotel" className="text-sm">
                        Hotel(s) or temporary accommodation(s) in the member state(s)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="2" id="inviting-person" />
                      <Label htmlFor="inviting-person" className="text-sm">
                        Inviting person(s) in the member state(s)
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Inviting Company/Organization/Hotel Details */}
                  {(formData.BlsInvitingAuthority === "0" || formData.BlsInvitingAuthority === "1") && (
                    <div className="border-l-4 border-blue-500 pl-6 space-y-4 bg-blue-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {formData.BlsInvitingAuthority === "0"
                          ? "Inviting Company/Organization Details"
                          : "Hotel/Accommodation Details"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="invitingAuthorityName" className="text-sm font-medium text-gray-700">
                            Name
                          </Label>
                          <Input
                            id="invitingAuthorityName"
                            value={formData.InvitingAuthorityName}
                            onChange={(e) => updateFormData("InvitingAuthorityName", e.target.value.toUpperCase())}
                            className="uppercase"
                          />
                        </div>
                        <div>
                          <Label htmlFor="invitingCountry" className="text-sm font-medium text-gray-700">
                            Country
                          </Label>
                          <Select
                            value={formData.InvitingCountryId}
                            onValueChange={(value) => updateFormData("InvitingCountryId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {schengenCountries.map((country) => (
                                <SelectItem key={country.id} value={country.id}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="invitingCity" className="text-sm font-medium text-gray-700">
                            City
                          </Label>
                          <Input
                            id="invitingCity"
                            value={formData.InvitingCity}
                            onChange={(e) => updateFormData("InvitingCity", e.target.value.toUpperCase())}
                            className="uppercase"
                          />
                        </div>
                        <div>
                          <Label htmlFor="invitingZipCode" className="text-sm font-medium text-gray-700">
                            Zip Code
                          </Label>
                          <Input
                            id="invitingZipCode"
                            value={formData.InvitingZipCode}
                            onChange={(e) => updateFormData("InvitingZipCode", e.target.value.toUpperCase())}
                            className="uppercase"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="invitingAddress" className="text-sm font-medium text-gray-700">
                            Address
                          </Label>
                          <Input
                            id="invitingAddress"
                            value={formData.InvitingAddress}
                            onChange={(e) => updateFormData("InvitingAddress", e.target.value.toUpperCase())}
                            className="uppercase"
                          />
                        </div>
                        <div>
                          <Label htmlFor="invitingEmail" className="text-sm font-medium text-gray-700">
                            Email
                          </Label>
                          <Input
                            id="invitingEmail"
                            type="email"
                            value={formData.InvitingEmail}
                            onChange={(e) => updateFormData("InvitingEmail", e.target.value.toLowerCase())}
                          />
                        </div>
                        <div>
                          <Label htmlFor="invitingContactNo" className="text-sm font-medium text-gray-700">
                            Contact Number
                          </Label>
                          <Input
                            id="invitingContactNo"
                            value={formData.InvitingContactNo}
                            onChange={(e) => updateFormData("InvitingContactNo", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="invitingFaxNo" className="text-sm font-medium text-gray-700">
                            Fax Number
                          </Label>
                          <Input
                            id="invitingFaxNo"
                            value={formData.InvitingFaxNo}
                            onChange={(e) => updateFormData("InvitingFaxNo", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Person Details */}
                  {(formData.BlsInvitingAuthority === "0" || formData.BlsInvitingAuthority === "2") && (
                    <div className="border-l-4 border-green-500 pl-6 space-y-4 bg-green-50 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Contact Person Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="invitingContactName" className="text-sm font-medium text-gray-700">
                            Contact Person Name
                          </Label>
                          <Input
                            id="invitingContactName"
                            value={formData.InvitingContactName}
                            onChange={(e) => updateFormData("InvitingContactName", e.target.value.toUpperCase())}
                            className="uppercase"
                          />
                        </div>
                        <div>
                          <Label htmlFor="invitingContactSurname" className="text-sm font-medium text-gray-700">
                            Contact Person Surname
                          </Label>
                          <Input
                            id="invitingContactSurname"
                            value={formData.InvitingContactSurname}
                            onChange={(e) => updateFormData("InvitingContactSurname", e.target.value.toUpperCase())}
                            className="uppercase"
                          />
                        </div>
                        <div>
                          <Label htmlFor="invitingContactCountry" className="text-sm font-medium text-gray-700">
                            Contact Person Country
                          </Label>
                          <Select
                            value={formData.InvitingContactCountryId}
                            onValueChange={(value) => updateFormData("InvitingContactCountryId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {schengenCountries.map((country) => (
                                <SelectItem key={country.id} value={country.id}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                onClick={prevSection}
                disabled={currentSection === 0}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {/* Save Current Section Button */}
                {currentSection > 0 && (
                  <Button onClick={() => saveFormState()} variant="outline" className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Progress
                  </Button>
                )}

                <Button
                  onClick={nextSection}
                  disabled={currentSection === sections.length - 1}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
