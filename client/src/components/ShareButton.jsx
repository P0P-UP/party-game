import React, { useState } from 'react';

/**
 * ShareButton — copies the room invite link to clipboard.
 * @param {{ roomCode: string }}
 */
export default function ShareButton({ roomCode }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}?join=${roomCode}`;

  const handleShare = async () => {
    // Use native share sheet on mobile if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🔥 Roast Room — Join my game!',
          text: `Join my Roast Room with code: ${roomCode}`,
          url: link,
        });
        return;
      } catch {
        // User dismissed, fall through to clipboard
      }
    }
    // Fallback: clipboard
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      console.error('Could not copy link');
    }
  };

  return (
    <button className="btn btn-ghost btn-full share-btn" onClick={handleShare}>
      {copied ? '✅ Link copied!' : '🔗 Share invite link'}
      <style>{`
        .share-btn {
          font-size: 0.95rem;
          justify-content: center;
        }
      `}</style>
    </button>
  );
}
