import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import {
  Send,
  X,
  MessageSquare,
  Loader2,
  Award,
  ChevronDown,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
} from "lucide-react";

// Initialize Clients
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "### Welcome to Dimensions Management Consultancy\n\nI am your AI advisor. We specialize in **Leadership Development**, **Talent Sourcing**, and **CMI (UK) Certified Courses**.\n\nHow can I help you elevate your organization today?",
      isTypingComplete: true,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const quickActions = [
    {
      label: "Our Services",
      query: "Tell me about your core services",
      icon: <Briefcase size={14} />,
    },
    {
      label: "Visit Us",
      query: "Where is your office located?",
      icon: <MapPin size={14} />,
    },
    {
      label: "UK Courses",
      query: "Tell me about CMI (UK) Certified Courses",
      icon: <GraduationCap size={14} />,
    },
  ];

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping, loading]);

  // Handle typing animation
  const startTypingEffect = (text) => {
    setIsTyping(true);
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "", isTypingComplete: false },
    ]);
    const words = text.split(" ");
    let currentText = "";
    let wordIndex = 0;

    const typeNextWord = () => {
      if (wordIndex < words.length) {
        currentText += (wordIndex > 0 ? " " : "") + words[wordIndex];
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "ai", text: currentText, isTypingComplete: false },
        ]);
        wordIndex++;
        setTimeout(typeNextWord, 15);
      } else {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "ai", text: currentText, isTypingComplete: true },
        ]);
      }
    };
    typeNextWord();
  };

  const handleSend = async (overrideQuery) => {
    const queryText = overrideQuery || input;
    if (!queryText.trim() || loading || isTyping) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: queryText, isTypingComplete: true },
    ]);
    setLoading(true);

    try {
      // 1. Vector Search (Retrieval)
      const embedModel = genAI.getGenerativeModel({
        model: "text-embedding-004",
      });
      const embedResult = await embedModel.embedContent({
        content: { parts: [{ text: queryText }] },
        taskType: "RETRIEVAL_QUERY",
      });
      const queryEmbedding = embedResult.embedding.values;

      // Use the match_dimensions RPC pointing to the correct table
      const { data: documents, error } = await supabase.rpc(
        "match_dimensions",
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.4,
          match_count: 3,
        }
      );

      if (error) throw error;

      // 2. Prepare Database Context
      const contextText =
        documents?.length > 0
          ? documents.map((d) => d.content).join("\n")
          : "Dimensions is an HR consultancy in Harare offering recruitment, training, and leadership development.";

      // 3. AI Generation using Gemini 3 Flash
      const chatModel = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction:
          "You are the expert consultant for Dimensions Management Consultancy. Use the context to provide detailed and professional answers. If the user asks for location, provide the full Runhare House address.",
      });

      const prompt = `Database Context:\n${contextText}\n\nUser Question: ${queryText}`;
      const result = await chatModel.generateContent(prompt);

      setLoading(false);
      startTypingEffect(result.response.text());
    } catch (err) {
      console.error("Chat Error:", err);
      setLoading(false);
      startTypingEffect(
        "I'm having difficulty reaching my records right now. Please call us at **+263 242 721 987** or visit us at **Runhare House, Harare**."
      );
    }
  };

  return (
    <div
      className={`fixed z-[999] transition-all duration-300 ${isOpen ? "inset-0 md:inset-auto md:bottom-8 md:right-8 md:w-[420px] md:h-[650px]" : "bottom-6 right-6"}`}
    >
      {isOpen && (
        <div className="w-full h-full flex flex-col bg-white md:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="h-16 flex-shrink-0 bg-slate-900 text-white flex justify-between items-center px-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Award size={20} />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight text-white">
                  Dimensions AI
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-green-300 font-bold uppercase tracking-widest">
                    Active Consultant
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full text-white"
            >
              <ChevronDown size={24} className="md:hidden" />
              <X size={20} className="hidden md:block" />
            </button>
          </div>

          {/* Chat area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] p-4 rounded-2xl text-[14px] shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                  }`}
                >
                  {/* Fixed Markdown rendering to avoid className assertion error */}
                  <div className="prose prose-sm max-w-none prose-slate leading-relaxed">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-blue-600 px-2 font-bold text-[10px] tracking-widest uppercase italic">
                <Loader2 className="animate-spin" size={12} /> Consultative
                Search...
              </div>
            )}
          </div>

          {/* Quick Actions Scroll */}
          <div className="flex-shrink-0 px-3 py-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action.query)}
                className="flex-shrink-0 px-4 py-2 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold rounded-full transition-all flex items-center gap-2 border border-slate-200 shadow-sm"
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 p-4 bg-white border-t border-slate-100 flex gap-2 pb-8 md:pb-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="How can we help?"
              className="flex-1 text-base bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              disabled={loading || isTyping}
            />
            <button
              onClick={() => handleSend()}
              className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all shadow-lg disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl hover:bg-blue-600 transition-all active:scale-90 relative"
        >
          <MessageSquare size={30} />
          <span className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
        </button>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `.no-scrollbar::-webkit-scrollbar { display: none; }`,
        }}
      />
    </div>
  );
};

export default ChatBot;
