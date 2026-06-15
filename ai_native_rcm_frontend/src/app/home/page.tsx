import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Next.js + shadcn/ui</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Your SSR project is ready!</p>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
            <Link href="/about">
              <Button variant="secondary">About →</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}