"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Eye, RotateCcw, FileImage, AlertCircle, CheckCircle, ZoomIn, ZoomOut, Download } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  preview?: boolean
  placeholder?: string
  file?: File | null
  label?: string
  className?: string
}

export function FileUpload({
  onFileSelect,
  accept = "image/*",
  maxSize = 5,
  preview = false,
  placeholder = "Click to upload or drag and drop",
  file,
  label,
  className = "",
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (file && preview) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [file, preview])

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type
    if (accept && !file.type.match(accept.replace("*", ".*"))) {
      return `File type not supported. Please upload ${accept} files only.`
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

  const handleRemoveFile = () => {
    setError(null)
    setPreviewUrl(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleReplaceFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const downloadFile = () => {
    if (file && previewUrl) {
      const link = document.createElement("a")
      link.href = previewUrl
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}

      {/* Upload Area */}
      {!file && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : error
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">{placeholder}</p>
              <p className="text-xs text-gray-500">
                {accept} up to {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Preview */}
      {file && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <FileImage className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Uploaded
                  </Badge>
                  {file.type.startsWith("image/") && (
                    <Badge variant="outline" className="text-xs">
                      Image
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              {/* View Button */}
              {previewUrl && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        <span>{file.name}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                            disabled={zoom <= 0.5}
                          >
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                          <span className="text-sm font-normal">{Math.round(zoom * 100)}%</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                            disabled={zoom >= 3}
                          >
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={downloadFile}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center overflow-auto max-h-[70vh]">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Full size preview"
                        className="max-w-full h-auto"
                        style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Replace Button */}
              <Button size="sm" variant="outline" onClick={handleReplaceFile} className="h-8 w-8 p-0 bg-transparent">
                <RotateCcw className="w-4 h-4" />
              </Button>

              {/* Delete Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveFile}
                className="h-8 w-8 p-0 hover:bg-red-50 bg-transparent"
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Hidden file input for replace functionality */}
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleInputChange} className="hidden" />
    </div>
  )
}
