// src/pages/Chat.tsx

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  MouseEvent
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Chat.module.css";
import ChatItem from "../components/chat/ChatItem";
import {
  deleteAllChats,
  getChat,
  postChatRequest,
  createNewChat,
  getAllChats,
  deleteChatByIdChat
} from "../../helpers/api-functions";

import sendIcon from "/logos/send-icon.png";
import noMsgBot from "/logos/no-msg2.png";
import upArrow from "/logos/up-arrow.png";
import ChatLoading from "../components/chat/ChatLoading";
import { useAuth } from "../context/context";
import SpinnerOverlay from "../components/shared/SpinnerOverlay";
import toast from "react-hot-toast";

type ChatSummary = {
  id: string;
  title: string;
  lastMessage: string;
};

type MessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: MessageType[];
} | null;

const Chat = () => {
  const [chatList, setChatList] = useState<ChatSummary[]>([]);
  const [chat, setChat] = useState<Chat>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [deleteChatToggle, setDeleteChatToggle] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const resizingRef = useRef(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getAllChats();
        if (response && Array.isArray(response.chats)) {
          setChatList(response.chats.reverse());
        } else {
          setChatList([]);
        }
      } catch {
        setChatList([]);
      }
    };
    if (auth?.isLoggedIn) fetchChats();
  }, [auth?.isLoggedIn, chat?.id]);

  useLayoutEffect(() => {
    const initChatId = localStorage.getItem("chatId");
    const fetchChat = async () => {
      try {
        if (auth?.isLoggedIn && initChatId) {
          const data = await getChat(initChatId);
          setChat(data);
          setSelectedChatId(initChatId);
        }
      } catch {
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchChat();
  }, [auth]);

  useEffect(() => {
    if (!auth?.isLoggedIn) navigate("/login");
  }, [auth?.isLoggedIn]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [chat?.messages?.length]);

  const sendMsgHandler = async () => {
    const content = inputRef.current?.value?.trim();
    if (!content) return;
    inputRef.current!.value = "";

    const tempMessage: MessageType = {
      id: `temp-${Date.now()}`,
      role: "user",
      content
    };

    setChat(prevChat =>
      prevChat
        ? { ...prevChat, messages: [...prevChat.messages, tempMessage] }
        : {
            id: "temp",
            title: "Untitled Chat",
            messages: [tempMessage]
          }
    );

    setIsLoading(true);
    try {
      let chatId = selectedChatId;
      if (!chatId) {
        const newChat = await createNewChat();
        chatId = newChat.id;
        if (chatId) {
          localStorage.setItem("chatId", chatId);
        }
        setSelectedChatId(chatId);
      }

      if (chatId) {
        await postChatRequest(content, chatId);
      } else {
        throw new Error("Chat ID is null");
      }
      const refreshed = await getChat(`${chatId}?ts=${Date.now()}`);
      setChat(refreshed);
      toast.success("Message Sent Successfully");
    } catch (err) {
      toast.error("Message failed");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChatsToggle = () => {
    setDeleteChatToggle(prev => !prev);
  };

  const clearChatsHandler = async () => {
    try {
      toast.loading("Deleting Messages ...", { id: "delete-msgs" });
      await deleteAllChats();
      setChat(null);
      setSelectedChatId(null);
      localStorage.removeItem("chatId");
      setChatList([]);
      toast.success("Deleted Messages Successfully", { id: "delete-msgs" });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete chats", {
        id: "delete-msgs"
      });
    }
  };

  const handleMouseDown = () => {
    resizingRef.current = true;
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = (e: MouseEvent<Document>) => {
    if (!resizingRef.current) return;
    const newWidth = Math.max(180, Math.min(500, e.clientX));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    resizingRef.current = false;
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove as any);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const messages = chat?.messages || [];

  return (
    <div className={styles.parent}>
      <aside
        className={`${styles.chatList} ${
          isCollapsed ? styles.collapsed : ""
        }`}
        style={{ width: isCollapsed ? 60 : sidebarWidth }}
      >
        <div className={styles.sidebarHeader}>
          <button
        className={styles.toggleSidebarBtn}
        onClick={() => {
          setIsCollapsed(prev => {
            localStorage.setItem("sidebarCollapsed", String(!prev));
            return !prev;
          });
        }}
          >
        {isCollapsed ? ">" : "<"}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <button
              className={styles.newChatBtn}
              onClick={async () => {
                try {
                  const newChat = await createNewChat();
                  localStorage.setItem("chatId", newChat.id);
                  setChat(newChat);
                  setSelectedChatId(newChat.id);
                  toast.success("New Chat Created");
                } catch {
                  toast.error("Failed to create chat");
                }
              }}
            >
              ➕ New Chat
            </button>

            <div className={`${styles.chatHistory} ${styles.scrollable}`}>
              {chatList.length === 0 && !isLoadingChats && (
                <p className={styles.noChats}>No chats yet.</p>
              )}
              {chatList.map(c => (
                <div
                  key={c.id}
                  className={`${styles.chatHistoryItem} ${
                    c.id === selectedChatId ? styles.active : ""
                  }`}
                  onClick={async () => {
                    if (c.id) {
                      try {
                        localStorage.setItem("chatId", c.id);
                        const selected = await getChat(c.id);
                        setChat(selected);
                        setSelectedChatId(c.id);
                      } catch {
                        toast.error("Failed to load chat");
                      }
                    }
                  }}
                  onContextMenu={async e => {
                    e.preventDefault();
                    const confirmDelete = window.confirm(
                      "Are you sure you want to delete this chat?"
                    );
                    if (confirmDelete && c.id) {
                      try {
                        await deleteChatByIdChat(c.id);
                        setChatList(prev =>
                          prev.filter(chat => chat.id !== c.id)
                        );
                        if (selectedChatId === c.id) {
                          setChat(null);
                          setSelectedChatId(null);
                          localStorage.removeItem("chatId");
                        }
                        toast.success("Chat deleted successfully");
                      } catch {
                        toast.error("Failed to delete chat");
                      }
                    }
                  }}
                >
                  {c.title || "Untitled Chat"}
                </div>
              ))}
                          <div className={styles.eraseMsgs}>
              <motion.img
                animate={!deleteChatToggle ? "animate" : { rotate: 180 }}
                src={upArrow}
                alt="top icon"
                onClick={deleteChatsToggle}
              />
              <AnimatePresence>
                {deleteChatToggle && (
                  <motion.button
                    className={styles.eraseBtn}
                    onClick={clearChatsHandler}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    CLEAR CHATS
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            </div>
          </>
        )}
        <div
          className={styles.resizer}
          onMouseDown={handleMouseDown}
          style={{ display: isCollapsed ? "none" : "block" }}
        />
      </aside>

      {/* Main Chat Area */}
      <section className={styles.mainChatContainer}>
        <div className={styles.chat} ref={messageContainerRef}>
          {isLoadingChats && <SpinnerOverlay />}
          {!isLoadingChats && (
            <>
              {messages.length === 0 ? (
                <div className={styles.no_msgs}>
                  <motion.div
                    className={styles.no_msg_logo}
                    animate={{ y: [0, -10, 0], transition: { repeat: Infinity } }}
                  >
                    <img alt="no msg bot" src={noMsgBot} />
                  </motion.div>
                  <p>
                    Ask any Legal Query and get instant assistance. <br />
                    Your data is safe and secure with us.
                  </p>
                </div>
              ) : (
                messages.map(
                  msg =>
                    msg &&
                    msg.id && (
                      <ChatItem
                        key={msg.id}
                        id={msg.id}
                        content={msg.content}
                        role={msg.role}
                      />
                    )
                )
              )}
              {isLoading && <ChatLoading />}
            </>
          )}
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.inputArea}>
            <textarea
              className={styles.textArea}
              ref={inputRef}
              rows={1}
              disabled={isLoadingChats || isLoading}
              placeholder="Enter your query here"
            />
            <button className={styles.icon} onClick={sendMsgHandler}>
              <img alt="icon" src={sendIcon} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Chat;
