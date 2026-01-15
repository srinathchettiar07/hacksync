import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Smile, 
  Paperclip,
  Loader,
  Wifi,
  WifiOff,
  ChevronLeft
} from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { UserContext } from '../../Context/userContext';

const CitizenChat = () => {
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection and load messages
  useEffect(() => {
    // Check if user and token are available
    if (!user || !token) {
      console.error('User or token not available');
      setIsLoading(false);
      toast.error('Please login to access chat');
      navigate('/citizen/login');
      return;
    }

    const initializeChat = async () => {
      try {
        // Load previous messages
        const response = await fetch('http://localhost:3000/citizen/messages?limit=50', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.messages) {
            setMessages(data.messages);
          }
        } else {
          console.warn('Failed to load messages:', response.status);
          // Continue even if messages fail to load
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        // Continue even if messages fail to load
      } finally {
        setIsLoading(false);
      }

      // Initialize socket connection
      const newSocket = io('http://localhost:3000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        toast.success('Connected to chat', { duration: 2000 });
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
        toast.error('Disconnected from chat', { duration: 2000 });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        toast.error('Failed to connect to chat server', { duration: 3000 });
      });

      newSocket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('online-users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('user-joined', (user) => {
        toast.success(`${user.displayName} joined the chat`);
        setOnlineUsers(prev => [...prev, user]);
      });

      newSocket.on('user-left', (user) => {
        toast(`${user.displayName} left the chat`);
        setOnlineUsers(prev => prev.filter(u => u.id !== user.userId));
      });

      newSocket.on('user-typing', (user) => {
        setTypingUsers(prev => {
          if (!prev.find(u => u.userId === user.userId)) {
            return [...prev, user];
          }
          return prev;
        });
      });

      newSocket.on('user-stop-typing', (user) => {
        setTypingUsers(prev => prev.filter(u => u.userId !== user.userId));
      });

      newSocket.on('message-deleted', ({ messageId }) => {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      });

      newSocket.on('error', (error) => {
        toast.error(error.message);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    };

    initializeChat();
  }, [token, user, navigate]);

  const handleSendMessage = () => {
    const sanitizedMessage = DOMPurify.sanitize(newMessage.trim());
    if (sanitizedMessage && socket) {
      socket.emit('send-message', {
        content: sanitizedMessage,
        room: 'public-room'
      });
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing-start');
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing-stop');
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to access chat</p>
          <button
            onClick={() => navigate('/citizen/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/citizen/portal/dashboard')}
              className="md:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Public Chat Room</h1>
              <p className="text-sm text-gray-600">Chat with other citizens</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            
            <button 
              onClick={() => setShowUserList(!showUserList)}
              className="flex items-center text-sm text-gray-600 md:hidden"
            >
              <Users className="h-4 w-4 mr-1" />
              {onlineUsers.length}
            </button>
            
            <div className="hidden md:flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {onlineUsers.length} online
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Messages */}
        <div className={`flex-1 flex flex-col ${showUserList ? 'hidden md:flex' : 'flex'}`}>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageItem 
                  key={message._id || message.id || `msg-${index}`} 
                  message={message} 
                  isOwn={message.sender?.toString() === user?._id?.toString() || 
                         message.sender === user?._id?.toString() ||
                         message.senderId === user?._id?.toString()} 
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t">
              <div className="text-sm text-gray-600 flex items-center">
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                {typingUsers.map(user => user.displayName).join(', ')} 
                {typingUsers.length === 1 ? ' is' : ' are'} typing...
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="bg-white border-t p-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message... (Press Enter to send)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isConnected}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Online Users Sidebar */}
        <div className={`w-64 bg-white border-l p-4 ${showUserList ? 'flex flex-col' : 'hidden md:flex flex-col'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Online ({onlineUsers.length})
            </h3>
            <button 
              onClick={() => setShowUserList(false)}
              className="md:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {user.displayName}
                  </div>
                  <div className="text-xs text-gray-600">Online</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Message Item Component with animations
const MessageItem = ({ message, isOwn }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
        isOwn 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-white text-gray-900 rounded-bl-none'
      }`}>
        {!isOwn && (
          <div className="text-sm font-medium mb-1">
            {message.senderName || message.sender?.displayName || 'Unknown User'}
          </div>
        )}
        <div className="text-sm">{message.content}</div>
        <div className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default CitizenChat;