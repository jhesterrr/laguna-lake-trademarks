import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type CaseStatus = "Review" | "Paid" | "Filed" | "Approved" | "draft" | "review" | "filed" | "published" | "registered" | "rejected" | "archived" | "Archived";
export type CaseType = "Patent" | "Trademark" | "Copyright" | "Infringement";
export type InquiryStatus = "Pending" | "Closed" | "new" | "reviewed" | "contacted" | "converted" | "archived" | "Archived";
export type PaymentStatus = "Pending" | "Completed" | "Failed" | "pending" | "paid" | "overdue" | "cancelled";
export type PaymentMethod = "GCash" | "BDO" | "PayPal";
export type MessageSenderType = "User" | "Admin" | "System" | "admin" | "client";

export type NotificationType = "inquiry" | "message" | "payment" | "case" | "system";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  joinedAt: string;
}

export interface Case {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  type: CaseType;
  status: CaseStatus;
  description: string;
  filedDate: string;
  updatedAt: string;
  amount: number;
  notes: string;
}

export interface Inquiry {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: CaseType | "Other" | string;
  subject: string;
  message: string;
  preferredContact: string;
  status: InquiryStatus;
  submittedAt: string;
  threadId: string | null;
}

export interface Payment {
  id: string;
  invoiceId: string;
  caseId: string;
  clientId: string;
  clientName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNo: string;
  createdAt: string;
  completedAt: string | null;
  description: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderType: MessageSenderType;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  // Reply-to
  replyToId?: string | null;
  replyToContent?: string | null;
  replyToSender?: string | null;
  // Attachments
  attachmentUrl?: string | null;
  attachmentType?: 'image' | 'file' | null;
  attachmentName?: string | null;
  // Soft delete
  isDeleted?: boolean;
}

export interface Thread {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  caseId?: string;
  inquiryId?: string;
  status: "Open" | "Closed";
  lastMessage: string;
  lastUpdated: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  refId?: string;
}

/* ──────────────────────────────────────────
   REACTIVE STORE
────────────────────────────────────────── */

let listeners: Array<() => void> = [];

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function notify() {
  listeners.forEach((l) => l());
}

/* ──────────────────────────────────────────
   DATA
────────────────────────────────────────── */

export const clients: Client[] = [];
export const cases: Case[] = [];
export const inquiries: Inquiry[] = [];
export const payments: Payment[] = [];
export const allMessages: Message[] = [];
export const threads: Thread[] = [];
export const notifications: Notification[] = [];

/* ──────────────────────────────────────────
   INITIAL LOAD & REALTIME
────────────────────────────────────────── */

export async function loadAdminData() {
  const [
    { data: profilesData },
    { data: casesData },
    { data: inquiriesData },
    { data: paymentsData },
    { data: threadsData },
    { data: messagesData },
    { data: notifsData }
  ] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("cases").select("*").order("created_at", { ascending: false }),
    supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
    supabase.from("payments").select("*").order("created_at", { ascending: false }),
    supabase.from("threads").select("*").order("last_message_at", { ascending: false }),
    supabase.from("messages").select("*").order("created_at", { ascending: true }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false })
  ]);

  if (profilesData) {
    clients.length = 0;
    clients.push(...profilesData.filter(p => p.role === "client").map(p => ({
      id: p.id,
      name: p.full_name || "Unknown",
      email: p.email,
      phone: p.phone || "",
      company: p.company_name || "",
      joinedAt: p.created_at
    })));
  }

  if (casesData) {
    cases.length = 0;
    cases.push(...casesData.map(c => ({
      id: c.id,
      clientId: c.client_id,
      clientName: c.client_name,
      type: c.type as CaseType,
      status: (c.status === 'filed' ? 'Filed' : c.status === 'registered' || c.status === 'published' ? 'Approved' : c.status === 'draft' ? 'Paid' : 'Review') as CaseStatus,
      description: c.title,
      filedDate: c.filing_date || c.created_at,
      updatedAt: c.created_at,
      amount: 0,
      notes: ""
    })));
  }

  if (inquiriesData) {
    inquiries.length = 0;
    inquiries.push(...inquiriesData.map(i => ({
      id: i.id,
      clientId: i.id,
      clientName: i.client_name,
      clientEmail: i.email,
      clientPhone: i.phone || "",
      serviceType: i.service_type,
      subject: "Inquiry",
      message: i.message,
      preferredContact: "Email",
      status: (i.status === 'new' ? 'Pending' : i.status === 'converted' ? 'Closed' : i.status) as InquiryStatus,
      submittedAt: i.created_at,
      threadId: null
    })));
  }

  if (paymentsData) {
    payments.length = 0;
    payments.push(...paymentsData.map(p => ({
      id: p.id,
      invoiceId: p.id,
      caseId: p.case_id,
      clientId: p.client_id,
      clientName: p.client_name,
      amount: p.amount,
      method: "BDO" as PaymentMethod,
      status: p.status as PaymentStatus,
      referenceNo: p.id,
      createdAt: p.created_at,
      completedAt: p.paid_date,
      description: p.description
    })));
  }

  if (threadsData) {
    threads.length = 0;
    threads.push(...threadsData.map(t => ({
      id: t.id,
      clientId: t.client_id,
      clientName: t.client_name,
      clientEmail: "unknown",
      status: "Open" as "Open" | "Closed",
      lastMessage: "...",
      lastUpdated: t.last_message_at,
      unreadCount: t.unread_count
    })));
  }

  if (messagesData) {
    allMessages.length = 0;
    allMessages.push(...messagesData.map(m => ({
      id: m.id,
      threadId: m.thread_id,
      senderType: (m.sender_role === "admin" ? "Admin" : "User") as MessageSenderType,
      senderName: m.sender_name,
      content: m.content,
      timestamp: m.created_at,
      isRead: m.is_read
    })));
  }

  if (notifsData) {
    notifications.length = 0;
    notifications.push(...notifsData.map(n => ({
      id: n.id,
      type: n.type as NotificationType,
      title: n.title,
      description: n.description,
      timestamp: n.created_at,
      isRead: n.is_read,
      link: n.link
    })));
  }

  notify();
}

// Setup real-time subscriptions
export function setupRealtime() {
  const channel = supabase.channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public' }, _payload => {
      // Very naive realtime: just reload everything when anything changes for prototyping
      // In production, you'd want to handle individual INSERT/UPDATE/DELETE events
      loadAdminData();
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

/* ──────────────────────────────────────────
   MUTATORS
────────────────────────────────────────── */

const defaultAdminProfile = {
  name: "Attorney Boldyrev",
  email: "admin@lagunalake.com",
  phone: "+63 917 000 0000",
  firm: "Laguna Lake Trademarks"
};

const savedProfileStr = typeof localStorage !== 'undefined' ? localStorage.getItem('adminProfile') : null;
export const adminProfile = savedProfileStr ? JSON.parse(savedProfileStr) : { ...defaultAdminProfile };

export async function fetchAdminProfile() {
  try {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'admin').limit(1).single();
    if (data) {
      adminProfile.name = data.full_name || "Attorney Boldyrev";
      adminProfile.email = data.email || "admin@lagunalake.com";
      adminProfile.phone = data.phone || "+63 917 000 0000";
      adminProfile.firm = data.firm_name || "Laguna Lake Trademarks";
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('adminProfile', JSON.stringify(adminProfile));
      }
      notify();
    }
  } catch (err) {
    console.error("Failed to fetch admin profile", err);
  }
}

export async function updateAdminProfile(newProfile: typeof adminProfile) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from('profiles').update({
    full_name: newProfile.name,
    email: newProfile.email,
    phone: newProfile.phone,
    firm_name: newProfile.firm
  }).eq('id', session.user.id);
  
  adminProfile.name = newProfile.name;
  adminProfile.email = newProfile.email;
  adminProfile.phone = newProfile.phone;
  adminProfile.firm = newProfile.firm;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('adminProfile', JSON.stringify(adminProfile));
  }
  notify();
}

export async function addInquiry(inq: Inquiry) {
  await supabase.from('inquiries').insert({
    id: inq.id,
    client_name: inq.clientName,
    email: inq.clientEmail,
    phone: inq.clientPhone,
    service_type: inq.serviceType,
    message: inq.message,
    status: 'new'
  });
  await addNotification('inquiry', 'New Inquiry Received', `From ${inq.clientName} regarding ${inq.serviceType}`, '/admin/inquiries');
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  const dbStatus = status === 'Closed' ? 'converted' : status === 'Pending' ? 'new' : status;
  await supabase.from('inquiries').update({ status: dbStatus }).eq('id', id);
}

export async function addThread(thread: Thread) {
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(thread.clientId);
  await supabase.from('threads').insert({
    id: String(thread.id),
    client_id: isValidUuid ? thread.clientId : null,
    client_name: thread.clientName,
    client_email: thread.clientEmail,
    subject: "Support Thread"
  });
}

export async function addMessage(msg: Message) {
  await supabase.from('messages').insert({
    id: String(Date.now()),
    thread_id: msg.threadId,
    sender_name: msg.senderName,
    sender_role: msg.senderType === 'Admin' ? 'admin' : 'client',
    content: msg.content,
    reply_to_id: msg.replyToId || null,
    reply_to_content: msg.replyToContent || null,
    reply_to_sender: msg.replyToSender || null,
    attachment_url: msg.attachmentUrl || null,
    attachment_type: msg.attachmentType || null,
    attachment_name: msg.attachmentName || null,
  });
  
  await supabase.from('threads').update({
    last_message_at: new Date().toISOString(),
    unread_count: 1, // will be updated by realtime
  }).eq('id', msg.threadId);
}

export async function uploadMessageAttachment(file: File): Promise<{ url: string; type: 'image' | 'file'; name: string } | null> {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from('message-attachments')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) { console.error('Upload error:', error); return null; }
  const { data: { publicUrl } } = supabase.storage.from('message-attachments').getPublicUrl(path);
  const isImage = file.type.startsWith('image/');
  return { url: publicUrl, type: isImage ? 'image' : 'file', name: file.name };
}

export async function markThreadRead(threadId: string) {
  await supabase.from('messages').update({ is_read: true }).eq('thread_id', threadId);
  await supabase.from('threads').update({ unread_count: 0 }).eq('id', threadId);
}

export async function addCase(c: Case) {
  const dbStatus = c.status === "Review" ? "review" : c.status === "Paid" ? "draft" : c.status === "Filed" ? "filed" : c.status === "Approved" ? "registered" : "review";
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(c.clientId);
  await supabase.from('cases').insert({
    id: c.id,
    client_id: isValidUuid ? c.clientId : null,
    client_name: c.clientName,
    client_email: c.clientEmail,
    title: c.type + " Case",
    type: c.type,
    status: dbStatus
  });
  await addNotification('case', 'New Case Created', `Case ${c.id} created for ${c.clientName}`, `/admin/cases?id=${c.id}`);
}

export async function updateCaseStatus(id: string, status: CaseStatus) {
  const dbStatus = status === "Review" ? "review" : status === "Paid" ? "draft" : status === "Filed" ? "filed" : status === "Approved" ? "registered" : "review";
  await supabase.from('cases').update({ status: dbStatus }).eq('id', id);
  await addNotification('case', 'Case Status Updated', `Case ${id} status changed to ${status}`, `/admin/cases?id=${id}`);
}

export async function updateCaseNotes(_id: string, _notes: string) {
  // Add a notes column if you want to store notes, omitting for now to match schema
}

export async function deleteInquiry(id: string) {
  await supabase.from('inquiries').delete().eq('id', id);
}

export async function archiveInquiry(id: string) {
  await supabase.from('inquiries').update({ status: 'archived' }).eq('id', id);
}

export async function deleteCase(id: string) {
  await supabase.from('cases').delete().eq('id', id);
}

export async function archiveCase(id: string) {
  await supabase.from('cases').update({ status: 'archived' }).eq('id', id);
}

export async function deleteMessage(id: string) {
  await supabase.from('messages').delete().eq('id', id);
}

export async function addPayment(p: Payment) {
  await supabase.from('payments').insert({
    id: p.id,
    client_id: p.clientId,
    client_name: p.clientName,
    case_id: p.caseId,
    amount: p.amount,
    description: p.description,
    due_date: new Date().toISOString()
  });
}

export async function updatePaymentStatus(id: string, status: PaymentStatus) {
  await supabase.from('payments').update({ status }).eq('id', id);
}

export async function addClient(_c: Client) {
  // Clients are added via Auth signup usually, so this is mostly mock
}

export async function addNotification(type: NotificationType, title: string, desc: string, link?: string, userId?: string) {
  // If we have preference toggles saved in localStorage, we can check them here
  const savedNotifs = typeof localStorage !== 'undefined' ? localStorage.getItem('adminNotifs') : null;
  const prefs = savedNotifs ? JSON.parse(savedNotifs) : null;
  
  // Basic preference check based on type
  if (prefs) {
    if (type === 'inquiry' && !prefs.newInquiry) return;
    if (type === 'message' && !prefs.newMessage) return;
    if (type === 'case' && !prefs.caseUpdated) return;
    if (type === 'payment' && !prefs.paymentReceived) return;
  }

  await supabase.from('notifications').insert({
    id: String(Date.now()),
    type,
    title,
    description: desc,
    link,
    user_id: userId
  });
}

export async function markNotificationRead(id: string) {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead() {
  await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
}

export async function clearNotifications() {
  await supabase.from('notifications').delete().neq('id', '0'); // Delete all
}

export function getUnreadNotificationCount() {
  return notifications.filter((n) => !n.isRead).length;
}

/* ──────────────────────────────────────────
   REACT HOOK
────────────────────────────────────────── */

export function useAdminStore() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => forceUpdate((n) => n + 1));
    return unsub;
  }, []);

  return {
    clients,
    cases,
    inquiries,
    payments,
    threads,
    allMessages,
    notifications,
    adminProfile,
  };
}

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */
export function fmt(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;
}

export function fmtDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export function fmtDateTime(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function totalRevenue(pmts: Payment[]) {
  return pmts.filter((p) => p.status === "Completed" || p.status === "paid").reduce((s, p) => s + p.amount, 0);
}
