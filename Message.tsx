import React, { useState, useRef, useEffect } from 'react';
import { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  userStatuses: { [uid: string]: { state: string; last_changed: number } };
  isActive: boolean;
  setActive: (id: string) => void;
  onSetReply: (message: MessageType) => void;
}

const SmileyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.008v.008H9v-.008zm6 0h.008v.008H15v-.008z" />
    </svg>
);

const ReplyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);

export const Message: React.FC<MessageProps> = ({ message, currentUserId, onReact, userStatuses, isActive, setActive, onSetReply }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isCurrentUser = message.uid === currentUserId;

  const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const UserAvatar: React.FC<{ message: MessageType }> = ({ message }) => {
    const isOnline = userStatuses[message.uid]?.state === 'online';
    return (
      <div className="relative w-8 h-8 rounded-full bg-gray-300 flex-shrink-0">
        {message.senderPhotoURL ? (
          <img src={message.senderPhotoURL} alt={message.senderName || ''} className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-pink-400 flex items-center justify-center text-white font-bold text-sm">
            {message.senderName?.[0]?.toUpperCase() || message.sender?.[0]?.toUpperCase()}
          </div>
        )}
        <span
          className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      </div>
    );
  };
  
  const handleReplyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const element = document.getElementById(`message-${message.replyTo!}`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-pink-500/10', 'dark:bg-pink-500/20', 'rounded-lg');
          setTimeout(() => {
              element.classList.remove('bg-pink-500/10', 'dark:bg-pink-500/20', 'rounded-lg');
          }, 2000);
      }
  };

  const handleEmojiSelect = (emoji: string) => {
    onReact(message.id, emoji);
    setShowPicker(false);
  };

  const reactions = message.reactions || {};
  const reactionEntries = Object.entries(reactions).filter(
    (entry): entry is [string, string[]] => {
      const uids = entry[1];
      return Array.isArray(uids) && uids.length > 0;
    }
  );
  
  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent chat-wide click handler from firing
    setActive(message.id);
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`group flex items-start gap-3 animate-slide-in ${isCurrentUser ? 'flex-row-reverse' : ''}`}
      onClick={handleMessageClick}
    >
      {!isCurrentUser && <UserAvatar message={message} />}
      <div className={`flex flex-col max-w-xs md:max-w-md ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className={`relative px-4 py-2 rounded-2xl ${isCurrentUser ? 'bg-pink-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 rounded-bl-none'}`}>
          {!isCurrentUser && <p className="text-xs font-bold text-pink-500 mb-1">{message.senderName || message.sender.split('@')[0]}</p>}
          
          {message.replyTo && (
            <a 
              href={`#message-${message.replyTo}`} 
              onClick={handleReplyClick}
              className="block bg-pink-400/20 dark:bg-pink-500/30 p-2 rounded-lg mb-2 border-l-4 border-pink-400 dark:border-pink-500 text-sm"
            >
              <p className="font-bold">{message.replyToSender}</p>
              <p className="opacity-80 truncate">{message.replyToText}</p>
            </a>
          )}
          
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          
          <div className="absolute bottom-0 right-0 -mb-5 flex gap-1">
            {reactionEntries.map(([emoji, uids]) => (
              <div
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className={`flex items-center text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors ${uids.includes(currentUserId) ? 'bg-pink-500/20 text-pink-700 dark:text-pink-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
              >
                <span>{emoji}</span>
                <span className="ml-1 font-semibold">{uids.length}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`flex items-center gap-2 mt-1 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(message.timestamp)}</span>

          <div className="flex items-center">
            <button
                onClick={() => onSetReply(message)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label="Reply to message"
            >
                <ReplyIcon />
            </button>
            <div className="relative" ref={pickerRef}>
                <button
                    onClick={() => setShowPicker(p => !p)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label="React to message"
                >
                    <SmileyIcon />
                </button>
                {showPicker && (
                    <div className={`absolute z-10 bottom-full mb-2 flex gap-1 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 ${isCurrentUser ? 'right-0' : 'left-0'}`}>
                    {EMOJIS.map(emoji => (
                        <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-2xl p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-transform duration-150 hover:scale-125"
                        >
                        {emoji}
                        </button>
                    ))}
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
