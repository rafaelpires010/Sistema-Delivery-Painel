export type MessageType = "text" | "image";
export type MessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";
export type AttendanceType = "ai" | "human";

export interface Message {
  id: number;
  tenantId: string;
  direction: "inbound" | "outbound";
  phone: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  status: MessageStatus;
  attendanceType: AttendanceType;
  createdAt: Date;
  updatedAt: Date;
}
