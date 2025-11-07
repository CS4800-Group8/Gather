// AnN add: User card component for Community page on 11/4
import AvatarImage from '@/components/AvatarImage';
import { resolveAvatarPreset } from '@/lib/avatarPresets';

// Interface for user data
export interface CommunityUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  avatarId: string;
  _count: {
    recipes: number;
  };
}

// type UserCardProps = {
//   user: CommunityUser;
//   onAvatarClick?: (userId: number) => void;
//   onButtonClick?: (userId: number) => void;
//   buttonText?: string;  // Thu can customize: "Add Friend", "Pending", "Friends ✓"
//   buttonDisabled?: boolean;
// };

type UserCardProps = {
  user: CommunityUser;
  onAvatarClick?: (userId: number) => void;
  onButtonClick?: (userId: number) => void;
  buttonText?: string;
  buttonDisabled?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
};

export default function UserCard({
  user,
  onAvatarClick,
  onButtonClick,
  buttonText = "Add Friend",
  buttonDisabled = false,
  onAccept, // Thu added
  onReject, // Thu added
}: UserCardProps) {

  const isAcceptRejectMode = !!onAccept && !!onReject; // Thu added
  
  return (
    <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
      {/* Large centered avatar */}
      <div
        className="mb-4 cursor-pointer"
        onClick={() => onAvatarClick?.(user.id)}
      >
        <AvatarImage
          preset={resolveAvatarPreset(user.avatarId)}
          size="large"
        />
      </div>

      {/* User name */}
      <h3 className="font-semibold text-lg text-amber-900 mb-1">
        {user.firstname} {user.lastname}
      </h3>

      {/* Username */}
      <p className="text-sm text-amber-600 mb-3">
        @{user.username}
      </p>

      {/* Recipe count */}
      <p className="text-sm text-amber-700 mb-4">
        🍜 {user._count.recipes} {user._count.recipes === 1 ? 'recipe' : 'recipes'}
      </p>

      {/* Action button */}
      {/* AnN fix: Updated to match amber theme on 11/6 */}
      {isAcceptRejectMode ? (
        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-all"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm font-medium transition-all"
          >
            Reject
          </button>
        </div>
      ) : (
        <button
          className={`px-8 py-2 rounded-lg text-sm font-medium transition-colors ${
            buttonText === 'Friends ✓'
              ? 'bg-amber-600 text-white'
              : buttonText === 'Pending'
              ? 'bg-amber-200 text-amber-700'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
          onClick={() => onButtonClick?.(user.id)}
          disabled={buttonDisabled}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
