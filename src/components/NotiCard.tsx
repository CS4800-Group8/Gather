// Thu added: NotiCard Component // 11/4

"use client"

import { useState } from "react"

interface NotiCardProps {
  id: number
  message: string
  createdAt: string
  isRead: boolean
  onMarkRead: (id: number) => void
}

export default function NotiCard({
  id,
  message,
  createdAt,
  isRead,
  onMarkRead,
}: NotiCardProps) {
  const [loading, setLoading] = useState(false)

  const handleMarkRead = async () => {
    setLoading(true)
    await onMarkRead(id)
    setLoading(false)
  }

  return (
    <div
      className={`p-4 rounded-2xl shadow-md mb-3 transition ${
        isRead ? "bg-gray-100" : "bg-white border-l-4 border-blue-500"
      }`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-800">{message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>

        {!isRead && (
          <button
            onClick={handleMarkRead}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
          >
            {loading ? "..." : "Mark as read"}
          </button>
        )}
      </div>
    </div>
  )
}
