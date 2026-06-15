import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ClinicalDocumentsTable } from "@/components/clinical-documents-table"

export default function ClinicalDocuments() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Documents</h1>
          <p className="text-muted-foreground">
            View clinical documents and their details.
          </p>
        </div>
        
        {/* Clinical Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <ClinicalDocumentsTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}