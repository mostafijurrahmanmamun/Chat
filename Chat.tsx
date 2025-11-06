import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { Message as MessageType } from '../types';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { db } from '../firebase';
import { ref, onValue, push, serverTimestamp, query, orderByChild, runTransaction } from 'firebase/database';

interface ChatProps {
  currentUser: User;
  setView: (view: 'chat' | 'profile') => void;
}

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


export const Chat: React.FC<ChatProps> = ({ currentUser, setView }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [userStatuses, setUserStatuses] = useState<{ [uid: string]: { state: string; last_changed: number } }>({});
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      const messageList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const statusRef = ref(db, 'status');
    const unsubscribe = onValue(statusRef, (snapshot) => {
        setUserStatuses(snapshot.val() || {});
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (replyingTo === null) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, replyingTo]);

  const handleSendMessage = (text: string) => {
    if (!currentUser.email) return;
    const messagesRef = ref(db, 'messages');
    
    const newMessage: Omit<MessageType, 'id' | 'timestamp'> & { timestamp: object } = {
      text,
      sender: currentUser.email,
      uid: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email.split('@')[0],
      senderPhotoURL: currentUser.photoURL,
      timestamp: serverTimestamp(),
    };

    if (replyingTo) {
      newMessage.replyTo = replyingTo.id;
      newMessage.replyToText = replyingTo.text;
      newMessage.replyToSender = replyingTo.senderName || replyingTo.sender.split('@')[0];
    }
    
    push(messagesRef, newMessage);
    setReplyingTo(null);
  };
  
  const handleSetReply = (message: MessageType) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };

  const handleReaction = (messageId: string, emoji: string) => {
    const currentUserId = currentUser.uid;
    const reactionRef = ref(db, `messages/${messageId}/reactions/${emoji}`);

    runTransaction(reactionRef, (currentData: string[] | null) => {
      if (currentData === null) {
        return [currentUserId]; // Add first reaction
      }
      
      const userIndex = currentData.indexOf(currentUserId);
      if (userIndex > -1) {
        // User has reacted, so remove reaction
        currentData.splice(userIndex, 1);
        return currentData.length > 0 ? currentData : null; // If empty, remove emoji node
      } else {
        // User has not reacted, so add reaction
        currentData.push(currentUserId);
        return currentData;
      }
    });
  };

  const isCurrentUserOnline = userStatuses[currentUser.uid]?.state === 'online';

  return (
    <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-slate-800">
      <header className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm z-10 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-bold">RownaK</h1>
        <button onClick={() => setView('profile')} className="relative w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
           {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover"/>
            ) : (
              <span className="font-bold text-lg">{currentUser.displayName?.[0] || currentUser.email?.[0]}</span>
            )}
            <span
              className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                isCurrentUserOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
              title={isCurrentUserOnline ? 'Online' : 'Offline'}
            />
        </button>
      </header>
      
      <main className="flex-1 p-4 overflow-y-auto space-y-4" onClick={() => setActiveMessageId(null)}>
        <div className="text-center my-2">
            <p className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1">
                <LockIcon/>
                Messages are end-to-end encrypted.
            </p>
        </div>
        {messages.map(msg => (
          <Message 
            key={msg.id} 
            message={msg} 
            currentUserId={currentUser.uid} 
            onReact={handleReaction} 
            userStatuses={userStatuses}
            isActive={activeMessageId === msg.id}
            setActive={setActiveMessageId}
            onSetReply={handleSetReply}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {replyingTo && (
            <div className="p-3 bg-gray-100 dark:bg-gray-700/50 flex justify-between items-center text-sm border-b border-gray-200 dark:border-gray-700">
                <div className="border-l-4 border-pink-500 pl-3">
                    <p className="font-bold text-pink-500">Replying to {replyingTo.senderName || replyingTo.sender.split('@')[0]}</p>
                    <p className="text-gray-600 dark:text-gray-400 truncate max-w-[250px] sm:max-w-xs">{replyingTo.text}</p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600" aria-label="Cancel reply">
                   <CloseIcon />
                </button>
            </div>
        )}
        <div className="p-2 sm:p-4">
            <MessageInput ref={messageInputRef} onSendMessage={handleSendMessage} />
        </div>
      </footer>
    </div>
  );
};