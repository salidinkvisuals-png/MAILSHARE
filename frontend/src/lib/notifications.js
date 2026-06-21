import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { API } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const NotificationsCtx = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [live, setLive] = useState(false);
  const [notifications, setNotifications] = useState([]); // recent new-email alerts
  const [unreadCount, setUnreadCount] = useState(0);       // unseen alerts for the bell badge
  // A monotonically increasing token that pages can watch to know "something changed, refetch"
  const [emailTick, setEmailTick] = useState(0);
  const esRef = useRef(null);

  const markAllSeen = useCallback(() => setUnreadCount(0), []);
  const clearNotifications = useCallback(() => { setNotifications([]); setUnreadCount(0); }, []);

  useEffect(() => {
    // Only connect when logged in
    if (!user) {
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
      setLive(false);
      return;
    }

    let reconnectTimer;

    const connect = () => {
      const es = new EventSource("/api/stream", { withCredentials: true });
      esRef.current = es;

      es.addEventListener("connected", () => setLive(true));

      const handleNew = (e) => {
        try {
          const payload = JSON.parse(e.data);
          const em = payload.email || {};
          const note = {
            id: em.id || `${Date.now()}-${Math.random()}`,
            from: em.from_name || em.from_email || "Unknown sender",
            subject: em.subject || "(no subject)",
            account_id: payload.account_id || null,
            share_id: payload.share_id || null,
            at: em.received_at || new Date().toISOString(),
            kind: payload.type, // "new_email" or "new_shared_email"
          };
          setNotifications((prev) => [note, ...prev].slice(0, 30));
          setUnreadCount((c) => c + 1);
          setEmailTick((t) => t + 1); // signal pages to refresh counts/lists
          toast.success(`New email from ${note.from}`, { description: note.subject });
        } catch {}
      };

      es.addEventListener("new_email", handleNew);
      es.addEventListener("new_shared_email", handleNew);

      es.onerror = () => {
        setLive(false);
        es.close();
        esRef.current = null;
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [user]);

  return (
    <NotificationsCtx.Provider
      value={{ live, notifications, unreadCount, emailTick, markAllSeen, clearNotifications }}
    >
      {children}
    </NotificationsCtx.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsCtx) || {
    live: false, notifications: [], unreadCount: 0, emailTick: 0,
    markAllSeen: () => {}, clearNotifications: () => {},
  };
}
