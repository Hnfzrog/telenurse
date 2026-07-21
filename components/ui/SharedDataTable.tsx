"use client"

import React, { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

export interface ColumnDef<T> {
  header: string
  accessorKey?: keyof T | string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface SharedDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  searchable?: boolean
  searchKeys?: (keyof T | string)[]
  emptyMessage?: string
}

export function SharedDataTable<T>({ 
  data, 
  columns, 
  searchable = true, 
  searchKeys = [], 
  emptyMessage = "Data tidak ditemukan" 
}: SharedDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    
    const query = searchQuery.toLowerCase()
    return data.filter(item => {
      // If searchKeys are specified, only search in those keys
      if (searchKeys.length > 0) {
        return searchKeys.some(key => {
          const val = (item as any)[key]
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(query)
        })
      }
      
      // Default: search all string/number values
      return Object.values(item as any).some(val => {
        if (val === null || val === undefined) return false
        return String(val).toLowerCase().includes(query)
      })
    })
  }, [data, searchQuery, searchKeys])

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

  // Reset page when search or data changes
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, data.length])

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Tampilkan</span>
          <select 
            className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-brand-blue"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>data</span>
        </div>

        {searchable && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`text-left px-5 py-3 font-semibold text-gray-600 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-5 py-4 ${col.className || ""}`}>
                      {col.render ? col.render(item) : col.accessorKey ? String((item as any)[col.accessorKey] || "-") : "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-4">
          <div>
            Menampilkan {startIndex + 1} hingga {Math.min(startIndex + pageSize, filteredData.length)} dari {filteredData.length} data
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="px-3 py-1 bg-brand-blue text-white rounded font-medium">
              {currentPage}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
