"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SheetDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")
    // Use the dynamic id parameter instead of hardcoded value
    fetch(`https://opensheet.elk.sh/${id}/1`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch sheet data")
        return res.json()
      })
      .then(rows => setData(rows))
      .catch((err) => {
        console.error('Fetch error:', err)
        setError("Failed to load sheet data.")
      })
      .finally(() => setLoading(false))
  }, [id])

  const columns = data.length > 0 ? Object.keys(data[0]) : []

  return (
    <div className="space-y-6 bg-white text-black">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-clash">Sheet Data</h1>
        <p className="mt-2 text-gray-600 font-inter">Sheet ID: {id}</p>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No data found in this sheet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-left">
            <thead>
              <tr className="border-b">
                {columns.map(col => (
                  <th key={col} className="py-2 px-4">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b">
                  {columns.map(col => (
                    <td key={col} className="py-2 px-4">{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}