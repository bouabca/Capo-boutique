"use client"

import { useEffect, useState, useContext } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LanguageContext } from "../layout"

export default function SheetsListPage() {
  const { lang } = useContext(LanguageContext)
  const [sheets, setSheets] = useState<{ name: string; id: string }[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("/api/main/integration")
      .then(res => res.json())
      .then(data => {
        if (data.integration && Array.isArray(data.integration.sheetsIntegration)) {
          setSheets(data.integration.sheetsIntegration)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredSheets = sheets.filter(sheet =>
    sheet.name.toLowerCase().includes(search.toLowerCase()) ||
    sheet.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value && typeof window !== 'undefined' && typeof window.fbq === 'function') {
      // Facebook Pixel: Track Search ("Recherche")
      window.fbq('track', 'Search', {
        search_string: e.target.value,
      });
    }
  };

  return (
    <div className="space-y-6 bg-white text-black">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-clash">Sheets</h1>
        <p className="mt-2 text-gray-600 font-inter">List of all connected Google Sheets</p>
      </div>
      <Card className="bg-white text-black">
        <CardHeader>
          <CardTitle>Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or id..."
            value={search}
            onChange={handleSearch}
            className="mb-4 bg-white text-black border-gray-300"
          />
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSheets.map(sheet => (
                    <tr
                      key={sheet.id}
                      className="border-b cursor-pointer hover:bg-green-50"
                      onClick={() => window.location.href = `/admin/sheets/${sheet.id}`}
                    >
                      <td className="py-2 px-4 font-medium">{sheet.name}</td>
                      <td className="py-2 px-4 text-gray-600">{sheet.id}</td>
                    </tr>
                  ))}
                  {filteredSheets.length === 0 && (
                    <tr><td colSpan={2} className="text-center py-8 text-gray-400">No sheets found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 