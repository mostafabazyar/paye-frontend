"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import { createSocket } from "@/lib/socket";
import { chatApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { Socket } from "socket.io-client";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  sessionId: string;
  createdAt: string;
  sender?: { id: string; name: string | null };
}

type Conversation = {
  sessionId: string;
  partner: { id: string; name: string | null };
  profile?: { title?: string; location?: string };
};

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => chatApi.getConversations() as Promise<Conversation[]>,
    enabled: !!token,
  });

  const conversation = conversations.find((item) => item.sessionId === sessionId);
  const partnerName = conversation?.partner?.name || "User";

  useEffect(() => {
    if (!sessionId || !token) return;

    chatApi.getMessages(sessionId).then(setMessages).catch(console.error);

    const socket = createSocket(token);
    socketRef.current = socket;
    socket.emit("join_session", sessionId);

    socket.on("new_message", (msg: ChatMessage) => {
      if (msg.sessionId !== sessionId) return;
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
    });

    return () => {
      socket.off("new_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !sessionId || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      sessionId,
      text: text.trim(),
    });

    setText("");
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl">
        <Link
          href="/chat"
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900 text-base">
            {partnerName}
          </p>
          <p className="truncate text-xs text-slate-500">
            {conversation?.profile?.title || "Approved match"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?.id;
          const showName =
            index === 0 || messages[index - 1].senderId !== msg.senderId;

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {showName && (
                <p className="mb-1 text-xs text-slate-500">
                  {isMe ? "You" : msg.sender?.name || "User"}
                </p>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                  isMe
                    ? "bg-black text-white rounded-br-none"
                    : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>

              <p className="mt-1 text-[10px] text-slate-400">
                {format(new Date(msg.createdAt), "p")}
              </p>
            </div>
          );
        })}

        <div ref={scrollRef} />
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="rounded-full bg-black p-3 text-white shadow-md hover:bg-slate-900 transition"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
