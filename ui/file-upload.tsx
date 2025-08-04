"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Eye, Trash2, Camera, FileImage, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  preview?: boolean
  placeholder?: string
  file?: File | null
  className?: string
  label?: string
}

export function FileUpload({
  onFileSelect,
  accept = "*/*",
  maxSize = 10,
  preview = false,
  placeholder = "Choose file or drag and drop",
  file,
  className = "",
  label,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate preview URL when file changes
  useEffect(() => {
    if (file && preview && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [file, preview])

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    if (accept !== "*/*") {
      const acceptedTypes = accept.split(",").map((type) => type.trim())
      const fileType = file.type
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        }
        return fileType.match(type.replace("*", ".*"))
      })

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${accept}`
      }
    }

    return null
  }

  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    onFileSelect(selectedFile)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    // Simulate a brief loading state for better UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    setError(null)
    setPreviewUrl(null)
    setShowDeleteConfirm(false)
    onFileSelect(null)

    if (inputRef.current) {
      inputRef.current.value = ""
    }

    setIsDeleting(false)
  }

  const confirmDelete = () => {
    setShowDeleteConfirm(true)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Camera className="w-4 h-4" />
          {label}
        </Label>
      )}

      {/* File Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200",
          dragActive
            ? "border-blue-500 bg-blue-50 scale-[1.02]"
            : file
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {!file ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">Click to upload</span> or
              drag and drop
            </div>
            <p className="text-xs text-gray-500">{placeholder}</p>
            {maxSize && <p className="text-xs text-gray-400 mt-1">Max size: {maxSize}MB</p>}
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              {preview && previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-lg border-2 border-green-500 shadow-md transition-transform group-hover:scale-105"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-md">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  {/* Quick preview overlay */}
                  <div
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className="h-24 w-24 bg-green-100 rounded-lg border-2 border-green-500 flex items-center justify-center shadow-md">
                  <FileImage className="h-8 w-8 text-green-600" />
                </div>
              )}
            </div>

            <p className="text-sm font-medium text-green-700 mb-1 truncate max-w-[200px] mx-auto">{file.name}</p>
            <p className="text-xs text-gray-500 mb-4">{formatFileSize(file.size)}</p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 bg-white shadow-sm"
              >
                <Upload className="h-3 w-3" />
                Replace
              </Button>

              {preview && previewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50 bg-white shadow-sm"
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 bg-white shadow-sm disabled:opacity-50"
              >
                <Trash2 className={cn("h-3 w-3", isDeleting && "animate-pulse")} />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Photo</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this photo? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="flex-1 bg-transparent"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} className="flex-1" disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            {/* Close Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(false)}
              className="absolute -top-12 right-0 bg-white text-black hover:bg-gray-100 z-10"
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>

            {/* Image */}
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Full preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl mx-auto block"
            />

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium truncate">{file?.name}</p>
                  <p className="text-xs opacity-75">{file && formatFileSize(file.size)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openFileDialog}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Replace
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setShowPreview(false)
                      confirmDelete()
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
