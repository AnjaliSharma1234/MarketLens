
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { Send, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  lastMessage: string;
}

const AskMeAnything = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory] = useState<Chat[]>([
    {
      id: "1",
      title: "Notion vs Linear positioning",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastMessage: "Both companies focus on productivity but target different user bases..."
    },
    {
      id: "2", 
      title: "SaaS pricing strategies",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      lastMessage: "Freemium models work best for products with high switching costs..."
    }
  ]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    // Simulate API call to GPT-4
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Based on current market trends, here's my analysis of your question: "${userMessage.content}"\n\nThis is a comprehensive response that would typically come from GPT-4 with market intelligence insights, competitive analysis, and strategic recommendations.`,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-hidden">
        <div className="h-screen flex">
          {/* Chat History Sidebar */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Chat History</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatHistory.map((chat) => (
                <Card key={chat.id} className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-slate-900 truncate">{chat.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{chat.lastMessage}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {chat.timestamp.toLocaleDateString()} at {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">Ask Me Anything</h1>
                  <p className="text-slate-600">Ask anything about market trends, competitors, or strategies.</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 mt-20">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-sm">Ask about market intelligence, competitor analysis, or business strategy</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl px-4 py-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white border border-slate-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-primary-foreground/70' : 'text-slate-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl px-4 py-3 rounded-lg bg-white border border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-slate-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-200 bg-white">
              <div className="flex gap-3">
                <Input
                  placeholder="e.g. What's the positioning of Notion vs Linear?"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AskMeAnything;
