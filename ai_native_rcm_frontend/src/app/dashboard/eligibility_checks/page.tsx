"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { EligibilityChecksTable } from "@/components/eligibility-checks-table"
import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { BACKEND_API_URL } from "@/lib/backend"

export default function EligibilityChecks() {

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  
  const onDrop = async (acceptedFiles: File[]) => {

    setUploaded(false)

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('workflow_type', 'full') // You can modify this value as needed

       setLoading(true) // start loader
      
      try {
        const response = await fetch(`${BACKEND_API_URL}/run`, {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          console.log('File uploaded successfully')
          // Handle success (e.g., show notification)
        }
      } catch (error) {
        console.error('Upload failed:', error)
        // Handle error (e.g., show error message)
      } finally {
        setLoading(false) // stop loader
        setUploaded(true) // show uploaded message
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eligibility Checks</h1>
          <p className="text-muted-foreground">
            View eligibility checks and their statuses.
          </p>
        </div>
        
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex justify-center items-center mt-4 mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Uploading... This may take a while since request is not queued.</span>
              </div>
            )}

            {uploaded && (
              <div className="flex justify-center items-center mt-4 mb-6">  
                <span className="ml-2">File uploaded successfully!</span>
              </div>
            )}

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the file here...</p>
              ) : (
                <p>Drag and drop an image file here, or click to select file</p>
              )}
              {file && <p className="mt-2">Selected file: {file.name}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Eligibility Checks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <EligibilityChecksTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}