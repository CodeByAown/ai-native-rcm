import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CodedEncountersTable } from "@/components/coded-encounters-table"

export default function CodedEncounters() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coded Encounters</h1>
          <p className="text-muted-foreground">
            View coded encounters and their details.
          </p>
        </div>
        
        {/* Coded Encounters Table */}
        <Card>
          <CardHeader>
            <CardTitle>Coded Encounters</CardTitle>
          </CardHeader>
          <CardContent>
            <CodedEncountersTable />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}