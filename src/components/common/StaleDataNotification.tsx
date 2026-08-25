import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface StaleDataNotificationProps {
  isStale: boolean;
  onRetry: () => void;
  isRefreshing?: boolean;
}

export const StaleDataNotification: React.FC<StaleDataNotificationProps> = ({
  isStale,
  onRetry,
  isRefreshing = false,
}) => {
  if (!isStale) return null;

  return (
    <div
      role="status"
      className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs font-medium shadow-2xs"
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="truncate">
          Couldn't refresh your data. Showing last loaded records.
        </span>
      </div>

      <Button
        type="button"
        variant="tertiary"
        size="sm"
        onClick={onRetry}
        isLoading={isRefreshing}
        disabled={isRefreshing}
        className="text-xs shrink-0 bg-white hover:bg-amber-100/50 text-amber-950 border-amber-300 h-7 px-2.5"
        leftIcon={!isRefreshing ? <RefreshCw className="w-3 h-3 text-amber-700" /> : undefined}
      >
        {isRefreshing ? 'Refreshing...' : 'Retry'}
      </Button>
    </div>
  );
};
