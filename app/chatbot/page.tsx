"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeSelector } from "@/components/theme-selector";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useState } from "react";
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/chat';

// Helper function to format message with line breaks
const formatMessage = (text: string) => {
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < text.split('\n').length - 1 && <br />}
    </span>
  ));
};


export default function Page() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    {
      text: "Xin chào! Tôi là trợ lý ảo của bạn. Tôi có thể giúp gì cho bạn hôm nay?",
      isUser: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsInput, setSettingsInput] = useState("");

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      // Add user message
      setMessages(prev => [...prev, { text: inputMessage, isUser: true }]);
      setInputMessage("");
      setIsLoading(true);

      try {
        const response = await axios.post(API_URL, {
          message: inputMessage
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Add bot response
        setMessages(prev => [...prev, { 
          text: response.data.response || "Xin lỗi, tôi không hiểu câu hỏi của bạn.", 
          isUser: false 
        }]);
      } catch (error) {
        console.error('Error details:', error);
        // Add detailed error message
        setMessages(prev => [...prev, { 
          text: `Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Server đã được khởi động\n2. Địa chỉ IP và port chính xác\n3. Kết nối mạng\n\nChi tiết lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          isUser: false 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSettingsSubmit = async () => {
    if (settingsInput.trim()) {
      try {
        const response = await fetch('http://192.168.31.149:5000/seeddata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: settingsInput.trim()
          })
        });

        if (response.ok) {
          // Thông báo thành công
          setMessages(prev => [...prev, { 
            text: `✅ Đã cập nhật URL thành công: ${settingsInput}`, 
            isUser: false 
          }]);
        } else {
          // Thông báo thất bại
          setMessages(prev => [...prev, { 
            text: `❌ Không thể cập nhật URL. Vui lòng thử lại sau.`, 
            isUser: false 
          }]);
        }
      } catch (error) {
        // Thông báo lỗi kết nối
        setMessages(prev => [...prev, { 
          text: `❌ Lỗi kết nối: ${error instanceof Error ? error.message : 'Unknown error'}. Vui lòng kiểm tra lại kết nối và thử lại.`, 
          isUser: false 
        }]);
      }
      
      setSettingsInput("");
    }
  };

  return (
    <SidebarProvider
      className="[--sidebar-width:calc(var(--spacing)*72)] [--header-height:calc(var(--spacing)*12)]"
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">Chatbot Management</h1>
                <div className="ml-auto flex items-center gap-2">
                <ThemeSelector />
                <ModeToggle />
                </div>
            </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col h-[calc(100vh-12rem)]">
                  {/* Chat messages area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {formatMessage(message.text)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input area */}
                  <div className="p-4 border-t">
                    <div className="flex flex-col gap-6">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập tin nhắn..."
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={isLoading}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập đường dẫn web..."
                          value={settingsInput}
                          onChange={(e) => setSettingsInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSettingsSubmit();
                            }
                          }}
                          className="w-full"
                        />
                        <Button
                          onClick={handleSettingsSubmit}
                          variant="secondary"
                        >
                          Cập nhật
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
