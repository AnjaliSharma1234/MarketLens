import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { Send, MessageCircle, Trash2, Edit3, Loader2, Search, Download } from "lucide-react";
import { auth, createNewChat, addMessageToChat, getUserChats, getChatMessages, deleteChat, updateChatTitle, exportChatHistory, searchChats } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Chat, ChatMessage } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";

const SYSTEM_PROMPT = `You are a highly knowledgeable AI assistant focused on providing clear, structured, and actionable insights on any topic. Your responses should be well-organized and informative, using only plain text without any special formatting.

When answering questions:

1. For simple questions or greetings:
   Simply respond naturally and guide users toward specific questions
   Example: "Hello! What specific topic would you like to learn about?"

2. For complex questions:
   Use this plain text structure:
   1. Brief Overview (2-3 sentences)
   2. Main Discussion Points
   3. Key Takeaways
   4. Next Steps

3. Formatting rules:
   1. Use only plain text, no markdown
   2. No special characters (*, -, #, etc.)
   3. Use numbers for lists (1., 2., 3.)
   4. Use plain text indentation with spaces
   5. Keep paragraphs short and clear
   6. No bold, italic, or other formatting

4. Example response format:
   1. First main point
      1. Sub-point one
      2. Sub-point two
   2. Second main point
      1. Sub-point one
      2. Sub-point two

If a question is unclear, explain your assumptions. Focus on providing value in every response.`;

const AskMeAnything = () => {
  const [user] = useAuthState(auth);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

  // Load user's chats
  useEffect(() => {
    const loadChats = async () => {
      if (user) {
        setIsLoadingChats(true);
        try {
          const userChats = await getUserChats(user.uid);
          setChats(userChats);
          setFilteredChats(userChats);
        } catch (error) {
          // Do not show any error toast or message for chat history loading errors
          // Just show the empty state if there are no chats
        } finally {
          setIsLoadingChats(false);
        }
      }
    };
    loadChats();
  }, [user]);

  // Filter chats based on search term
  useEffect(() => {
    const filterChats = async () => {
      if (!user) return;
      
      try {
        const filtered = await searchChats(user.uid, searchTerm);
        setFilteredChats(filtered);
      } catch (error) {
        console.error("Error searching chats:", error);
        // Fallback to client-side filtering
        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = chats.filter(chat => 
          chat.title.toLowerCase().includes(lowerSearchTerm) ||
          chat.lastMessage.toLowerCase().includes(lowerSearchTerm)
        );
        setFilteredChats(filtered);
      }
    };
    
    filterChats();
  }, [searchTerm, chats, user]);

  // Load messages when a chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedChatId) {
        setIsLoadingMessages(true);
        try {
          const chatMessages = await getChatMessages(selectedChatId);
          setMessages(chatMessages.reverse()); // Reverse to show oldest first
        } catch (error) {
          console.error("Error loading messages:", error);
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to load messages",
            variant: "destructive",
          });
        } finally {
          setIsLoadingMessages(false);
        }
      } else {
        setMessages([]);
      }
    };
    loadMessages();
  }, [selectedChatId]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !user) return;

    setIsLoading(true);
    let openAIError = null;
    let chatId = selectedChatId;
    let isNewChat = false;
    try {
      // Create new chat if none selected
      if (!chatId) {
        chatId = await createNewChat(user.uid, currentMessage);
        setSelectedChatId(chatId);
        isNewChat = true;
        const updatedChats = await getUserChats(user.uid);
        setChats(updatedChats);
      } else {
        // Add message to existing chat
        await addMessageToChat(chatId, currentMessage, "user");
      }

      // Prepare conversation context for better AI responses
      let conversationContext = "";
      if (!isNewChat && messages.length > 0) {
        conversationContext = messages.slice(-10).map(msg => `${msg.sender}: ${msg.content}`).join('\n') + '\n';
      }

      // Get GPT response with conversation context
      const res = await fetch("/api/ask-gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map(msg => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.content
            })),
            { role: "user", content: currentMessage }
          ],
          temperature: 0.7,
          model: "gpt-4-turbo-preview"
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        openAIError = errorData.error || `HTTP error! status: ${res.status}`;
        throw new Error(openAIError);
      }

      const data = await res.json();
      
      if (!data.content) {
        openAIError = data.error || "No response from AI assistant";
        throw new Error(openAIError);
      }

      // Add assistant's response to chat (always use local chatId)
      await addMessageToChat(chatId, data.content, "assistant");

      // Reload messages
      const updatedMessages = await getChatMessages(chatId);
      setMessages(updatedMessages.reverse());

      // Update chat list to reflect new message
      const updatedChats = await getUserChats(user.uid);
      setChats(updatedChats);

    } catch (err) {
      // Only show OpenAI errors in the chat area, never show 'Failed to load chat history'
      const errorMessage = err instanceof Error ? err.message : "Failed to get response";
      if (chatId) {
        try {
          await addMessageToChat(chatId, `Error: ${errorMessage}. Please try again.`, "assistant");
        } catch (saveError) {
          // Ignore
        }
      } else if (openAIError) {
        setMessages([{ id: "error", content: `Error: ${openAIError}. Please check your OpenAI API key or network.`, sender: "assistant", timestamp: { toDate: () => new Date() } as any }]);
      }
    }

    setCurrentMessage("");
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setEditingChatId(null);
  };

  const handleNewChat = () => {
    setSelectedChatId(null);
    setMessages([]);
    setEditingChatId(null);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteChat(chatId);
      
      // Remove from local state
      setChats(chats.filter(chat => chat.id !== chatId));
      
      // If this was the selected chat, clear selection
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        setMessages([]);
      }
      
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const handleEditTitle = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveTitle = async (chatId: string) => {
    if (!editingTitle.trim()) return;
    
    try {
      await updateChatTitle(chatId, editingTitle.trim());
      
      // Update local state
      setChats(chats.map(chat => 
        chat.id === chatId 
          ? { ...chat, title: editingTitle.trim() }
          : chat
      ));
      
      setEditingChatId(null);
      setEditingTitle("");
      
      toast({
        title: "Success",
        description: "Chat title updated",
      });
    } catch (error) {
      console.error("Error updating title:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update title",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleExportChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { chat, messages } = await exportChatHistory(chatId);
      
      // Create export content
      const exportContent = `Chat: ${chat.title}
Created: ${chat.createdAt && chat.createdAt.toDate ? chat.createdAt.toDate().toLocaleString() : ""}
Last Updated: ${chat.updatedAt && chat.updatedAt.toDate ? chat.updatedAt.toDate().toLocaleString() : ""}
Message Count: ${messages.length}

${messages.map(msg => `${msg.sender.toUpperCase()}: ${msg.content}`).join('\n\n')}`;
      
      // Create and download file
      const blob = new Blob([exportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Chat exported successfully",
      });
    } catch (error) {
      console.error("Error exporting chat:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export chat",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">Please Sign In</h1>
          <p className="text-slate-600">You need to be signed in to use the chat feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-hidden">
        <div className="h-screen flex">
          {/* Chat History Sidebar */}
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Chat History</h2>
              <Button 
                onClick={handleNewChat}
                className="w-full mt-4"
                variant="outline"
              >
                New Chat
              </Button>
              
              {/* Search Bar */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search chats..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingChats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-slate-600">Loading chats...</span>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">
                    {searchTerm ? 'No chats found' : 'No chats yet'}
                  </p>
                  <p className="text-xs">
                    {searchTerm ? 'Try a different search term' : 'Start a new conversation to begin'}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <Card 
                    key={chat.id} 
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedChatId === chat.id ? 'bg-slate-100' : ''
                    }`}
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {editingChatId === chat.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') handleSaveTitle(chat.id);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                className="text-sm"
                                autoFocus
                              />
                              <Button size="sm" onClick={() => handleSaveTitle(chat.id)}>Save</Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                            </div>
                          ) : (
                            <h3 className="font-medium text-slate-900 truncate">{chat.title}</h3>
                          )}
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{chat.lastMessage}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            {chat.createdAt && chat.createdAt.toDate ? chat.createdAt.toDate().toLocaleDateString() : ""}
                            {chat.createdAt && chat.createdAt.toDate ? ` at ${chat.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""}
                            {chat.messageCount && ` • ${chat.messageCount} messages`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleExportChat(chat.id, e)}
                            className="h-6 w-6 p-0"
                            title="Export chat"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleEditTitle(chat, e)}
                            className="h-6 w-6 p-0"
                            title="Edit title"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {selectedChatId 
                      ? chats.find(c => c.id === selectedChatId)?.title || 'Chat'
                      : 'New Chat'
                    }
                  </h1>
                  <p className="text-slate-600">Ask anything about market trends, competitors, or strategies.</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-slate-600">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
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
                        {message.timestamp && message.timestamp.toDate ? message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl px-4 py-3 rounded-lg bg-white border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <p className="text-slate-500">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-200 bg-white">
              <div className="flex gap-4">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !currentMessage.trim() || !user}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send
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
