"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  Trash2,
  MessageSquare,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Calendar,
  FileCode,
  BookOpen,
} from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils/helpers";

interface Material {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  chunkCount: number | null;
  createdAt: string;
  _count?: {
    chunks: number;
    quizzes: number;
    chatSessions: number;
  };
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Paste text modal state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [pasting, setPasting] = useState(false);

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await fetch("/api/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
      }
    } catch (err) {
      console.error("Failed to load materials", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      setUploading(true);
      setUploadError(null);
      setSuccessMessage(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to upload document");
        }

        setSuccessMessage(`"${file.name}" uploaded and indexed (${data.chunkCount} chunks)!`);
        await fetchMaterials();
      } catch (err: any) {
        setUploadError(err.message || "Failed to upload document.");
      } finally {
        setUploading(false);
      }
    },
    [fetchMaterials]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "text/plain": [".txt"],
        "text/markdown": [".md"],
      },
      maxSize: 25 * 1024 * 1024,
      multiple: false,
    });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will remove associated chunks.`)) return;

    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteTitle.trim() || !pasteContent.trim()) return;

    setPasting(true);
    setUploadError(null);

    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pasteTitle.trim(),
          content: pasteContent.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create material");

      setShowPasteModal(false);
      setPasteTitle("");
      setPasteContent("");
      setSuccessMessage(`Created and indexed "${pasteTitle}"!`);
      await fetchMaterials();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setPasting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Study Materials
            </h1>
            <p className="text-sm text-gray-400">
              Upload PDF textbooks, lecture slides, or markdown notes to power the AI companion.
            </p>
          </div>
          <button
            onClick={() => setShowPasteModal(true)}
            className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto"
          >
            <FileCode size={14} />
            Paste Study Notes
          </button>
        </div>

        {/* Success/Error Alerts */}
        {uploadError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{uploadError}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          {...getRootProps()}
          className={`dropzone mb-8 ${
            isDragActive ? "active" : ""
          } ${isDragReject ? "reject" : ""} ${
            uploading ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center py-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(124, 111, 224, 0.15)" }}
            >
              {uploading ? (
                <Loader2 size={26} className="text-[#7c6fe0] animate-spin" />
              ) : (
                <UploadCloud size={26} className="text-[#7c6fe0]" />
              )}
            </div>

            <p className="font-semibold text-base text-gray-200 mb-1">
              {uploading
                ? "Extracting text and chunking document..."
                : isDragActive
                ? "Drop the study file here..."
                : "Click or drag & drop study files here"}
            </p>
            <p className="text-xs text-gray-400 max-w-sm mb-3">
              Supports PDF, TXT, and Markdown (up to 25MB). Content is cleaned, split into chunks, and indexed for RAG retrieval.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span className="badge badge-purple text-[9px]">PDF</span>
              <span className="badge badge-info text-[9px]">TXT</span>
              <span className="badge badge-success text-[9px]">MARKDOWN</span>
            </div>
          </div>
        </div>

        {/* Study Materials List */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-[#7c6fe0]" />
            Your Uploaded Materials ({materials.length})
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 skeleton rounded-2xl" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-[#111118] border border-dashed border-[rgba(255,255,255,0.08)]">
              <FileText size={40} className="mx-auto text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-300 mb-1">No materials yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                Upload your syllabus notes, a textbook chapter, or paste lecture notes above to start asking questions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="card p-5 rounded-2xl bg-[#111118] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-gray-300">
                          <FileText size={18} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-gray-200 line-clamp-1">
                            {mat.title}
                          </h3>
                          <span className="text-[11px] text-gray-500 uppercase font-mono">
                            {mat.fileName}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(mat.id, mat.title)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                        title="Delete material"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-2 my-3 text-[11px] text-gray-400">
                      <span className="badge badge-success text-[10px]">
                        ✓ {mat.status}
                      </span>
                      <span className="flex items-center gap-1 bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded-md">
                        <Layers size={11} />
                        {mat._count?.chunks || mat.chunkCount || 0} chunks
                      </span>
                      <span className="text-gray-500">
                        {formatBytes(mat.fileSize)}
                      </span>
                      <span className="text-gray-500">
                        {formatDate(mat.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] grid grid-cols-3 gap-1.5 text-center">
                    <Link
                      href={`/chat?materialId=${mat.id}`}
                      className="p-1.5 rounded-lg bg-[rgba(124,111,224,0.1)] hover:bg-[rgba(124,111,224,0.2)] text-[#9d93f7] text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <MessageSquare size={13} />
                      <span>Chat</span>
                    </Link>
                    <Link
                      href={`/quiz?materialId=${mat.id}`}
                      className="p-1.5 rounded-lg bg-[rgba(79,158,255,0.1)] hover:bg-[rgba(79,158,255,0.2)] text-[#4f9eff] text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <HelpCircle size={13} />
                      <span>Quiz</span>
                    </Link>
                    <Link
                      href={`/revision?materialId=${mat.id}`}
                      className="p-1.5 rounded-lg bg-[rgba(255,193,7,0.1)] hover:bg-[rgba(255,193,7,0.2)] text-amber-400 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Sparkles size={13} />
                      <span>Revise</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Paste Notes */}
        {showPasteModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111118] border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-lg p-6 animate-fade-in">
              <h3 className="text-lg font-bold text-white mb-1">
                Paste Study Notes
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Paste raw notes, lecture summaries, or syllabus content directly.
              </p>

              <form onSubmit={handlePasteSubmit} className="space-y-4">
                <div>
                  <label className="label">Topic / Subject Title</label>
                  <input
                    type="text"
                    required
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    placeholder="e.g. Operating Systems - Process Scheduling"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Study Content</label>
                  <textarea
                    required
                    rows={8}
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder="Paste textbook definitions, lecture transcripts, formula explanations..."
                    className="input font-mono text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasteModal(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pasting}
                    className="btn-primary text-xs"
                  >
                    {pasting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Chunking & Saving...
                      </>
                    ) : (
                      "Save Material"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
