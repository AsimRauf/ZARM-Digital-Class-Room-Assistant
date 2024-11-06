import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    IconButton,
    Typography,
    Avatar,
    Paper,
    Link
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const CourseChat = () => {
    const { courseId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const messageEndRef = useRef(null);
    const messageAreaRef = useRef(null);
    const socketRef = useRef();
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    };



    useEffect(() => {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
        console.log(decoded)

        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('join-course', { courseId });
        fetchMessages();

        socketRef.current.on('new-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => socketRef.current.disconnect();

    }, [courseId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/api/chat/courses/${courseId}/chat`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 403) {
                navigate('/');
                return;
            }

            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        try {
            if (!newMessage.trim() && !selectedFiles.length) return;
    
            const formData = new FormData();
            // Log before appending to FormData
            console.log('Message content:', newMessage.trim());
            
            formData.append('content', newMessage.trim());
            
            selectedFiles.forEach(file => {
                console.log('Attaching file:', file.name);
                formData.append('attachments', file);
            });
    
            // Log FormData contents
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }
    
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/api/chat/courses/${courseId}/chat`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                }
            );
    
            const data = await response.json();
            console.log('Server response:', data);
    
            setNewMessage('');
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            
        } catch (error) {
            console.error('Message sending error:', error);
        }
    };
    
    

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);
    };

    const FilePreview = ({ file }) => (
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            p: 1, 
            border: '1px solid #ddd',
            borderRadius: 1,
            mb: 1 
        }}>
            {file.type.startsWith('image/') ? (
                <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name} 
                    style={{ width: 40, height: 40, objectFit: 'cover' }}
                />
            ) : (
                <AttachFileIcon />
            )}
            <Typography>{file.name}</Typography>
            <IconButton size="small" onClick={() => setSelectedFiles(files => files.filter(f => f !== file))}>
                <CloseIcon />
            </IconButton>
        </Box>
    );

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box ref={messageAreaRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                {messages.map((msg, index) => {
                    const isCurrentUser = msg.sender?._id === currentUser?.userId;
                    
                    return (
                        <Box key={index} sx={{ 
                            mb: 2,
                            display: 'flex',
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                            width: '100%'
                        }}>
                            <Box sx={{ maxWidth: '70%' }}>
                                <Box sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 0.5,
                                    flexDirection: isCurrentUser ? 'row-reverse' : 'row'
                                }}>
                                    <Avatar src={msg.sender?.profileImage} sx={{ width: 24, height: 24 }} />
                                    <Typography variant="subtitle2">
                                        {msg.sender?.name || 'Unknown User'}
                                    </Typography>
                                </Box>
                                <Paper sx={{ 
                                    p: 2,
                                    bgcolor: isCurrentUser ? 'primary.main' : '#e9ffef',
                                    color: isCurrentUser ? 'white' : 'text.primary',
                                    borderRadius: 2
                                }}>
                                    <Typography>{msg.content}</Typography>
                                    {msg.attachments?.map((attachment, i) => (
                                        <Box key={i} sx={{ mt: 1 }}>
                                            {attachment.type.startsWith('image/') ? (
                                                <img 
                                                    src={attachment.url} 
                                                    alt={attachment.name}
                                                    style={{ 
                                                        maxWidth: '200px',
                                                        borderRadius: '4px'
                                                    }} 
                                                />
                                            ) : (
                                                <Link 
                                                    href={attachment.url} 
                                                    target="_blank"
                                                    sx={{ color: isCurrentUser ? 'white' : 'primary.main' }}
                                                >
                                                    {attachment.name}
                                                </Link>
                                            )}
                                        </Box>
                                    ))}
                                </Paper>
                            </Box>
                        </Box>
                    );
                })}
                <div ref={messageEndRef} />
            </Box>
    
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                {selectedFiles.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        {selectedFiles.map((file, index) => (
                            <Box key={index} sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                p: 1, 
                                border: '1px solid #ddd',
                                borderRadius: 1,
                                mb: 1 
                            }}>
                                {file.type.startsWith('image/') ? (
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={file.name} 
                                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                                    />
                                ) : (
                                    <AttachFileIcon />
                                )}
                                <Typography>{file.name}</Typography>
                                <IconButton 
                                    size="small" 
                                    onClick={() => setSelectedFiles(files => files.filter(f => f !== file))}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <input
                        type="file"
                        multiple
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx"
                    />
                    <IconButton onClick={() => fileInputRef.current?.click()}>
                        <AttachFileIcon />
                    </IconButton>
                    <TextField
                        fullWidth
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() && !selectedFiles.length}
                    >
                        Send
                    </Button>
                </Box>
            </Box>
        </Box>
    );
    


};

export default CourseChat;




