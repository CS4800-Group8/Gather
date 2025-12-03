// Thu added: NotiCard Component // 11/4
// AnN add: Extended with friend request support (Accept/Reject) on 11/6

"use client"

import { useState } from "react"
import { resolveAvatarPreset } from "@/lib/avatarPresets"
import AvatarImage from "./AvatarImage"

// AnN add: Extended interface to support friend requests on 11/6
interface NotiCardProps {
  id: number
  type: string  // "friend_request", "friend_accept", etc.
  message: string
  createdAt: string
  isRead: boolean
  relatedUser?: {  // For friend requests - the person who sent the request
    id: number
    username: string
    firstname: string
    lastname: string
    avatarId: string
  } | null
  relatedRecipeId?: number | null  // AnN add: For recipe notifications - click to open recipe on 11/25
  onMarkRead: (id: number) => void
  onAccept?: (userId: number, notificationId: number) => void  // AnN add: Accept friend request on 11/6
  onReject?: (userId: number, notificationId: number) => void  // AnN add: Reject friend request on 11/6
  onRecipeClick?: (recipeId: number) => void  // AnN add: Click to open recipe popup on 11/25
}

export default function NotiCard({
  id,
  type,
  message,
  createdAt,
  isRead,
  relatedUser,
  relatedRecipeId,
  onMarkRead,
  onAccept,
  onReject,
  onRecipeClick,
}: NotiCardProps) {
  const [actionLoading, setActionLoading] = useState<"accept" | "reject" | null>(null)

  const handleMarkRead = () => {
    onMarkRead(id)
  }

  // AnN add: Handle click on notification on 11/25
  const handleClick = () => {
    // Mark as read if unread
    if (!isRead) {
      onMarkRead(id)
    }
    // Open recipe popup if this is a recipe notification
    if (relatedRecipeId && onRecipeClick) {
      onRecipeClick(relatedRecipeId)
    }
  }

  // AnN add: Handle accept friend request on 11/6
  const handleAccept = async () => {
    if (!relatedUser || !onAccept) return
    setActionLoading("accept")
    await onAccept(relatedUser.id, id)
    setActionLoading(null)
  }

  // AnN add: Handle reject friend request on 11/6
  const handleReject = async () => {
    if (!relatedUser || !onReject) return
    setActionLoading("reject")
    await onReject(relatedUser.id, id)
    setActionLoading(null)
  }

  // AnN add: Format time like Facebook (4h, 10h, 1d) on 11/6
  const formatTime = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInMs = now.getTime() - past.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInHours < 24) return `${diffInHours}h`
    return `${diffInDays}d`
  }

  // AnN add: Get avatar preset for sender on 11/6
  const avatarPreset = relatedUser
    ? resolveAvatarPreset(relatedUser.avatarId)
    : null

  // AnN add: Get notification icon for non-user notifications on 11/24
  const getNotificationIcon = () => {
    switch (type) {
      case "recipe_rating":
        return "⭐"
      case "recipe_comment":
        return "💬"
      default:
        return "🔔"
    }
  }

  return (
    <div
      className={`p-3 rounded-xl mb-2 transition cursor-pointer hover:bg-amber-50 ${
        isRead ? "bg-white" : "bg-amber-50/50"
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* AnN add: Avatar for sender on 11/6 */}
        {avatarPreset ? (
          <div className="flex-shrink-0">
            <AvatarImage preset={avatarPreset} size="small" />
          </div>
        ) : (
          // AnN add: Icon for non-user notifications on 11/24
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">
            {getNotificationIcon()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* AnN add: Sender name + message on 11/6 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm text-amber-900">
                {relatedUser && (
                  <span className="font-semibold">
                    {relatedUser.firstname} {relatedUser.lastname}
                  </span>
                )}{" "}
                <span className="font-normal">{message}</span>
              </p>
              <p className="text-xs text-amber-600 mt-1">
                {formatTime(createdAt)}
              </p>
            </div>

            {/* Unread dot indicator */}
            {!isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>

          {/* AnN add: Accept/Reject buttons for friend requests on 11/6 - Reuses Thu's API */}
          {type === "friend_request" && relatedUser && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAccept()
                }}
                disabled={!!actionLoading}
                className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50"
              >
                {actionLoading === "accept" ? "..." : "Accept"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleReject()
                }}
                disabled={!!actionLoading}
                className="px-4 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-semibold hover:bg-amber-200 transition disabled:opacity-50"
              >
                {actionLoading === "reject" ? "..." : "Reject"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
