import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  User,
  Circle,
  Hash,
  MessageCircle,
} from "lucide-react";

export default function MessagingSystem() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const res = await ApiService.getConversations();
      if (res.success) setConversations(res.data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const res = await ApiService.getMessages(conversationId);
      if (res.success) setMessages(res.data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await ApiService.markAsRead(conversationId);
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (error) {
      // Quietly ignore
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const tempMessage = {
      id: Date.now(),
      senderId: user.id,
      content,
      createdAt: new Date().toISOString(),
      status: "sending"
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await ApiService.sendMessage(selectedConversation.id, content);
      if (res.success) {
        setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? res.data : msg));
        // Move conversation to top
        setConversations(prev => {
          const others = prev.filter(c => c.id !== selectedConversation.id);
          return [prev.find(c => c.id === selectedConversation.id), ...others];
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  const handleProfileClick = (participant) => {
    const rolePath = participant.role.toLowerCase() === "institution" ? "institute" : participant.role.toLowerCase();
    navigate(`/${rolePath}/profile/${participant.id}`);
  };

  const filteredConversations = conversations.filter(conv => {
    const participant = conv.participants[0];
    const name = `${participant.firstName || ""} ${participant.lastName || ""}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className={`h-[calc(100vh-140px)] ${theme.cardBg} rounded-2xl flex items-center justify-center border ${theme.cardBorder}`}>
        <div className="animate-spin h-10 w-10 border-t-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className={`h-[calc(100vh-140px)] ${theme.cardBg} rounded-2xl shadow-xl border ${theme.cardBorder} overflow-hidden flex`}>
      {/* Sidebar */}
      <div className={`w-80 md:w-96 border-r ${theme.divider} flex flex-col`}>
        <div className="p-5 border-b shadow-sm">
          <h2 className={`text-xl font-bold ${theme.textPrimary} mb-4`}>Messaging</h2>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className={`w-12 h-12 mx-auto mb-3 ${theme.textMuted} opacity-20`} />
              <p className={`text-sm ${theme.textMuted}`}>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={selectedConversation?.id === conv.id}
                onClick={() => setSelectedConversation(conv)}
                theme={theme}
              />
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-transparent to-blue-50/20 dark:to-blue-900/5">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className={`p-4 border-b ${theme.divider} ${theme.cardBg} flex items-center justify-between shadow-sm z-10`}>
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleProfileClick(selectedConversation.participants[0])}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                    {selectedConversation.participants[0].firstName?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-neutral-800 rounded-full"></div>
                </div>
                <div>
                  <h3 className={`font-bold ${theme.textPrimary} leading-tight`}>
                    {selectedConversation.participants[0].firstName} {selectedConversation.participants[0].lastName}
                  </h3>
                  <p className={`text-xs ${theme.textMuted} capitalize`}>{selectedConversation.participants[0].role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-xl ${theme.hoverBg} ${theme.textMuted} transition-all`} title="Voice Call">
                  <Phone size={18} />
                </button>
                <button className={`p-2 rounded-xl ${theme.hoverBg} ${theme.textMuted} transition-all`} title="Video Call">
                  <Video size={18} />
                </button>
                <button className={`p-2 rounded-xl ${theme.hoverBg} ${theme.textMuted} transition-all`}>
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="text-center py-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 ${theme.textMuted}`}>
                  Conversation Started
                </span>
              </div>

              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMe={msg.senderId === user.id}
                  showAvatar={i === 0 || messages[i - 1].senderId !== msg.senderId}
                  participant={selectedConversation.participants[0]}
                  theme={theme}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${theme.divider} ${theme.cardBg}`}>
              <div className={`flex items-end gap-2 p-2 rounded-2xl border ${theme.inputBorder} ${theme.inputBg} focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all shadow-inner`}>
                <button className={`p-2 rounded-lg ${theme.hoverBg} ${theme.textMuted} transition-all`}>
                  <Paperclip size={20} />
                </button>
                <textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className={`flex-1 bg-transparent border-none outline-none resize-none py-2 text-sm ${theme.inputText} min-h-[40px] max-h-32`}
                />
                <button className={`p-2 rounded-lg ${theme.hoverBg} ${theme.textMuted} transition-all`}>
                  <Smile size={20} />
                </button>
                <button
                  disabled={!newMessage.trim()}
                  onClick={handleSendMessage}
                  className={`p-2.5 rounded-xl transition-all ${newMessage.trim()
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700"
                    : `${theme.textMuted} opacity-50 cursor-not-allowed`
                    }`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
              <MessageCircle className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Your Messages</h3>
            <p className={`max-w-md ${theme.textMuted}`}>
              Select a conversation to start chatting or connect with more people to grow your network and opportunities.
            </p>
            <button className="mt-8 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
              New Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationItem({ conversation, isSelected, onClick, theme }) {
  const participant = conversation.participants[0];
  const lastMessage = conversation.messages[0];
  const name = `${participant.firstName || ""} ${participant.lastName || ""}`.trim();

  return (
    <div
      onClick={onClick}
      className={`p-4 flex gap-3 cursor-pointer transition-all border-l-4 ${isSelected
        ? "bg-blue-50 dark:bg-blue-900/10 border-blue-600 shadow-sm"
        : `border-transparent hover:bg-gray-50 dark:hover:bg-neutral-800`
        }`}
    >
      <div className="relative">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center font-bold text-slate-500 shadow-sm overflow-hidden`}>
          {name.charAt(0)}
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full shadow-sm"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h4 className={`font-bold ${theme.textPrimary} truncate text-sm`}>{name}</h4>
          <span className={`text-[10px] ${theme.textMuted} font-medium`}>
            {lastMessage ? new Date(lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ""}
          </span>
        </div>
        <p className={`text-xs ${isSelected ? "text-blue-600 dark:text-blue-400 font-medium" : theme.textMuted} truncate`}>
          {lastMessage ? lastMessage.content : "Start a new conversation"}
        </p>
      </div>
      {conversation.unreadCount > 0 && (
        <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md animate-pulse">
          {conversation.unreadCount}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, isMe, showAvatar, participant, theme }) {
  return (
    <div className={`flex items-end gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
      {showAvatar && !isMe ? (
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm mb-1">
          {participant.firstName.charAt(0)}
        </div>
      ) : (
        <div className="w-8" />
      )}

      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
        <div
          className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMe
            ? "bg-blue-600 text-white rounded-br-none shadow-blue-500/10"
            : `${theme.cardBg} ${theme.textPrimary} border ${theme.cardBorder} rounded-bl-none`
            }`}
        >
          {message.content}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 px-1">
          <span className={`text-[10px] ${theme.textMuted} font-semibold uppercase tracking-tighter`}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && (
            <div className="flex">
              {message.isRead ? (
                <CheckCheck size={12} className="text-blue-500" />
              ) : (
                <Check size={12} className={theme.textMuted} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
