/**
 * ============================================
 * DEMO FILE - DELETE WHEN BUILDING REAL APP
 * ============================================
 * 
 * This file is part of the busibox-template demo.
 * Delete this entire file when starting your real app.
 * 
 * See DEMO.md for complete deletion checklist.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@jazzmind/busibox-app/components/auth/SessionProvider";
import { Trash2, Edit2, Check, X, AlertCircle, CheckCircle } from "lucide-react";

interface DemoNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function DemoPage() {
  const { user, isAuthenticated } = useSession();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Demo Warning Banner */}
      <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              Demo Features - DELETE BEFORE PRODUCTION
            </h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
              This page contains demo features for testing deployment. See{" "}
              <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                DEMO.md
              </code>{" "}
              for deletion instructions.
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        App Template Demo
      </h1>

      {/* Section 1: Authentication Info */}
      <AuthenticationDemo user={user} isAuthenticated={isAuthenticated} />

      {/* Section 2: Data API CRUD Demo */}
      <DataAPICRUDDemo />

      {/* Section 3: Agent API Demo */}
      <AgentAPIDemo />
    </div>
  );
}

// ============================================================================
// Section 1: Authentication Demo
// ============================================================================

function AuthenticationDemo({ user, isAuthenticated }: { user: any; isAuthenticated: boolean }) {
  return (
    <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          1. SSO Authentication
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          DEMO - DELETE THIS SECTION
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Tests Busibox SSO authentication via authz service.
      </p>

      <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status:
          </span>
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              isAuthenticated
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </span>
        </div>

        {isAuthenticated && user && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email:
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {user.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                User ID:
              </span>
              <span className="text-sm text-gray-900 dark:text-white font-mono">
                {user.id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Roles:
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {user.roles?.join(", ") || "None"}
              </span>
            </div>
          </>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please authenticate through the Busibox Portal to see your user
            information.
          </p>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// Section 2: Data API CRUD Demo
// ============================================================================

function DataAPICRUDDemo() {
  const [notes, setNotes] = useState<DemoNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    loadNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${basePath}/api/demo/notes`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const response = await fetch(`${basePath}/api/demo/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create note");

      setNewTitle("");
      setNewContent("");
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (note: DemoNote) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  const saveEdit = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`${basePath}/api/demo/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update note");

      setEditingId(null);
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note");
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      setError(null);
      const response = await fetch(`${basePath}/api/demo/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete note");

      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  return (
    <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          2. Data API CRUD Operations
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          DEMO - DELETE THIS SECTION
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Tests data-api CRUD operations with notes stored via the Busibox data service.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Create Note Form */}
      <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Create New Note
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Note title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <textarea
            placeholder="Note content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={createNote}
            disabled={creating || !newTitle.trim() || !newContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Note"}
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Your Notes ({notes.length})
        </h3>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No notes yet. Create one above!
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-200 dark:border-gray-700 rounded p-4"
            >
              {editingId === note.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(note.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {note.title}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(note)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {note.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {new Date(note.createdAt).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ============================================================================
// Section 3: Agent Chat Demo
// ============================================================================

function AgentAPIDemo() {
  const [token, setToken] = useState<string | null>(null);
  const [notesDocumentId, setNotesDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    async function init() {
      try {
        const [tokenRes, setupRes] = await Promise.all([
          fetch(`${basePath}/api/auth/token`, { credentials: "include" }),
          fetch(`${basePath}/api/setup`, { credentials: "include" }),
        ]);

        if (tokenRes.ok) {
          const { token: t } = await tokenRes.json();
          setToken(t);
        }

        if (setupRes.ok) {
          const data = await setupRes.json();
          setNotesDocumentId(data.documents?.notes?.id || null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize");
      } finally {
        setLoading(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          3. AI Chat Assistant
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          DEMO - DELETE THIS SECTION
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        A working AI assistant that uses generic core tools (query_data,
        aggregate_data, get_facets, document_search) to answer questions about
        your notes. The agent&apos;s system prompt teaches it your data schema.
      </p>

      {loading && (
        <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 mb-4">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {!loading && token && (
        <div className="h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <DemoChatInterface token={token} notesDocumentId={notesDocumentId} basePath={basePath} />
        </div>
      )}

      {!loading && !token && !error && (
        <p className="text-gray-600 dark:text-gray-400">
          Could not obtain agent API token. Make sure the agent-api service is
          running and accessible.
        </p>
      )}
    </section>
  );
}

function DemoChatInterface({ token, notesDocumentId, basePath }: {
  token: string;
  notesDocumentId: string | null;
  basePath: string;
}) {
  try {
    const ChatInterface = require("@jazzmind/busibox-app/components/chat/SimpleChatInterface").SimpleChatInterface;
    return (
      <ChatInterface
        token={token}
        agentId="notes-assistant"
        placeholder="Ask about your notes..."
        enableDocSearch={true}
        useAgenticStreaming={true}
        metadata={notesDocumentId ? { notesDocumentId } : undefined}
        basePath={basePath}
      />
    );
  } catch {
    return (
      <div className="p-4 text-gray-600 dark:text-gray-400">
        <p>SimpleChatInterface not available. Make sure @jazzmind/busibox-app is installed.</p>
      </div>
    );
  }
}
