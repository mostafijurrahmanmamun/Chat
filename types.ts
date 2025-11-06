export interface Message {
  id: string;
  text: string;
  sender: string; // User's email
  uid: string; // User's ID
  timestamp: number; // Server timestamp
  senderName?: string;
  senderPhotoURL?: string;
  reactions?: { [emoji: string]: string[] };
  replyTo?: string; // ID of the message being replied to
  replyToText?: string; // Text snippet of the original message
  replyToSender?: string; // Sender name of the original message
}