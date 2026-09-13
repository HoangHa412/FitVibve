'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  '🔥 Tính lượng calo cần nạp theo thể trạng của tôi',
  '🏋️ Tôi nên bắt đầu từ lộ trình nào trên FitVibe?',
  '🥗 Gợi ý thực đơn tăng cơ giảm mỡ hôm nay',
  '❓ Làm sao để HLV mở khóa bài tập giai đoạn tiếp theo?'
];

export default function AIChatBubble() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const userContext = user ? {
        name: user.name,
        role: user.role,
      } : undefined;

      const response = await aiApi.chat(userMessage.content, history, userContext);
      
      if (response.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.reply,
            timestamp: new Date(),
          },
        ]);
      } else {
        toast.error('Có lỗi xảy ra khi kết nối với AI');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Không thể kết nối với máy chủ AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Đã làm mới cuộc hội thoại');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Radar Waves for AI Bubble */}
        <div className="relative">
          <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-radar pointer-events-none" />
          <button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group glow-pulse border border-white/40"
            title="Trợ lý AI FitVibe 24/7"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1.5 -right-2 animate-bounce-subtle" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col shadow-2xl transition-all duration-300 transform origin-bottom-right animate-scale-in",
        isMinimized ? "w-80 h-14" : "w-80 sm:w-96 h-[540px]",
        "border border-border/80 rounded-[2.2rem] overflow-hidden bg-card/95 backdrop-blur-2xl shadow-emerald-500/10"
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 flex items-center justify-between text-white shrink-0 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm tracking-tight">Trợ Lý AI FitVibe</h3>
              <span className="px-1.5 py-0.5 rounded bg-white/20 text-[9px] font-black uppercase tracking-wider">v2.5</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
              </span>
              <span className="text-[10px] text-emerald-100 font-medium">Sẵn sàng 24/7</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && !isMinimized && (
            <button 
              onClick={handleClearChat}
              className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/80 hover:text-white active:scale-90"
              title="Xóa đoạn chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/80 hover:text-white active:scale-90"
            title={isMinimized ? 'Phóng to' : 'Thu nhỏ'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/80 hover:text-white active:scale-90"
            title="Đóng chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/15">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-2 py-6 animate-fade-in-up">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-8 h-8 text-primary animate-bounce-subtle" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <p className="text-sm font-bold text-foreground">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hỏi tôi bất cứ điều gì về chế độ dinh dưỡng, kỹ thuật bài tập, hoặc tính toán calo cá nhân.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="w-full space-y-1.5 pt-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Gợi ý câu hỏi:</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(prompt)}
                        className="text-left p-2.5 rounded-xl bg-card hover:bg-primary/10 border border-border/70 hover:border-primary/40 text-xs text-foreground transition-all duration-200 hover:translate-x-1 active:scale-95 shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-end gap-2 animate-fade-in-up",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-1 shadow-sm transition-transform hover:scale-110",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={cn(
                    "max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed transition-all",
                    msg.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-none font-medium"
                      : "bg-card text-foreground rounded-bl-none border border-border/70"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-end gap-2 animate-fade-in-up">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mb-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-card p-3.5 rounded-2xl rounded-bl-none border border-border/70 shadow-sm flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form 
            onSubmit={handleSend}
            className="p-3 bg-card border-t border-border flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi AI về dinh dưỡng, bài tập..."
              disabled={isLoading}
              className="flex-1 bg-secondary/50 border border-border/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
