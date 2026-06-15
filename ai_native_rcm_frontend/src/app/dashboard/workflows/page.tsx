import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { WorkflowsTable } from "@/components/workflows-table"

export default function Workflows() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Runs</h1>
          <p className="text-muted-foreground">
            View workflow runs and their statuses.
          </p>
        </div>
        
        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow runs</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowsTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}