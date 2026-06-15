import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PriorAuthsTable } from "@/components/prior-auths-table"

export default function PriorAuths() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prior Authorizations</h1>
          <p className="text-muted-foreground">
            View prior authorization requests and their statuses.
          </p>
        </div>
        
        {/* Prior Auths Table */}
        <Card>
          <CardHeader>
            <CardTitle>Prior Authorization Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <PriorAuthsTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}