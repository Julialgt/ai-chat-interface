import { useRef, useState } from 'react';
import {
  AppWindow,
  Brain,
  FolderKanban,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search as SearchIcon,
  Trash2,
  Pin,
} from 'lucide-react';
import ComingSoonModal from './ComingSoonModal';

function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  searchValue,
  onSearchChange,
  onRenameChat,
  onDeleteChat,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const searchInputRef = useRef(null);
  const [comingSoon, setComingSoon] = useState({ open: false, title: '' });
  const lastTriggerButtonRef = useRef(null);

  const startEditing = (chat) => {
    setEditingId(chat.id);
    setEditingTitle(chat.title);
  };

  const commitEdit = () => {
    if (editingId && editingTitle.trim()) {
      onRenameChat(editingId, editingTitle);
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleSearchNavClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const openComingSoon = (title, event) => {
    lastTriggerButtonRef.current = event?.currentTarget || null;
    setComingSoon({ open: true, title });
  };

  const closeComingSoon = () => {
    setComingSoon({ open: false, title: '' });
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav" aria-label="Primary">
        <button
          type="button"
          className="sidebar-nav-item"
          onClick={onNewChat}
        >
          <Plus size={16} aria-hidden="true" />
          <span>New chat</span>
        </button>
        <button
          type="button"
          className="sidebar-nav-item"
          onClick={handleSearchNavClick}
        >
          <SearchIcon size={16} aria-hidden="true" />
          <span>Search</span>
        </button>
        <button
          type="button"
          className="sidebar-nav-item"
          onClick={(e) => openComingSoon('Images', e)}
        >
          <ImageIcon size={16} aria-hidden="true" />
          <span>Images</span>
        </button>
        <button
          type="button"
          className="sidebar-nav-item"
          onClick={(e) => openComingSoon('Apps', e)}
        >
          <AppWindow size={16} aria-hidden="true" />
          <span>Apps</span>
        </button>
        <button
          type="button"
          className="sidebar-nav-item"
          onClick={(e) => openComingSoon('Deep research', e)}
        >
          <Brain size={16} aria-hidden="true" />
          <span>Deep research</span>
        </button>
        <button
          type="button"
          className="sidebar-nav-item"
          onClick={(e) => openComingSoon('Projects', e)}
        >
          <FolderKanban size={16} aria-hidden="true" />
          <span>Projects</span>
        </button>
      </nav>

      <div className="sidebar-search">
        <div className="sidebar-search-inner">
          <SearchIcon
            size={14}
            className="sidebar-search-icon"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search chats"
          />
        </div>
      </div>

      <div className="sidebar-chat-list">
        {chats.length === 0 ? (
          <div className="sidebar-chat-empty">No conversations yet.</div>
        ) : (
          chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isEditing = editingId === chat.id;
            return (
              <div
                key={chat.id}
                className={`sidebar-chat-item ${isActive ? 'active' : ''}`}
              >
                {isEditing ? (
                  <input
                    className="sidebar-chat-edit-input"
                    value={editingTitle}
                    autoFocus
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="sidebar-chat-main"
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <span className="sidebar-chat-item-label">
                      {chat.title}
                      {chat.pinned && (
                        <span className="sidebar-chat-pin" aria-label="Pinned chat" title="Pinned chat">
                          <Pin size={12} aria-hidden="true" />
                        </span>
                      )}
                    </span>
                  </button>
                )}
                {!isEditing && (
                  <div className="sidebar-chat-actions">
                    <button
                      type="button"
                      className="sidebar-chat-icon"
                      onClick={() => startEditing(chat)}
                      aria-label="Rename chat"
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="sidebar-chat-icon"
                      onClick={() => onDeleteChat(chat.id)}
                      aria-label="Delete chat"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user-avatar">U</div>
        <div className="sidebar-user-meta">
          <div className="sidebar-user-name">You</div>
          <div className="sidebar-user-label">Mock profile · UI only</div>
        </div>
      </div>

      <ComingSoonModal
        open={comingSoon.open}
        title={comingSoon.title}
        onClose={closeComingSoon}
        returnFocusTo={lastTriggerButtonRef.current}
      />
    </aside>
  );
}

export default Sidebar;
