"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
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
  FileCode,
  BookOpen,
} from "lucide-react";
import { formatBytes } from "@/lib/utils/helpers";
import { StudyMaterial } from "@/types/materials";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setUploadStage("extracting");
      setUploadError(null);
      setSuccessMessage(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploadStage("chunking");
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to upload document");
        }

        setUploadStage("indexing");
        setSuccessMessage(`"${file.name}" ingested & indexed into ${data.chunkCount} knowledge chunks!`);
        await fetchMaterials();
      } catch (err: any) {
        setUploadError(err.message || "Failed to process document.");
      } finally {
        setUploading(false);
        setUploadStage("idle");
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
    if (!confirm(`Delete "${title}"? This will remove associated knowledge chunks.`)) return;

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
      setSuccessMessage(`Synthesized and indexed "${pasteTitle}"!`);
      await fetchMaterials();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setPasting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060c] text-white flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Document Knowledge Library
            </h1>
            <p className="text-sm text-gray-400">
              Upload PDF textbooks, lecture slides, or markdown notes to power the AI companion.
            </p>
          </div>
          <button
            onClick={() => setShowPasteModal(true)}
            className="btn-secondary text-xs py-2 px-3.5 self-start sm:self-auto flex items-center gap-1.5"
          >
            <FileCode size={14} className="text-[#00d4aa]" />
            <span>Paste Study Notes</span>
          </button>
        </div>

        {uploadError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle2 size={20} className="flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`glass-panel p-8 md:p-12 text-center rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            isDragActive
              ? "border-[#7c6fe0] bg-[#7c6fe0]/10 scale-[1.01]"
              : isDragReject
              ? "border-red-500 bg-red-500/10"
              : "border-white/10 hover:border-[#7c6fe0]/50"
          } ${uploading ? "opacity-75 pointer-events-none" : ""}`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c6fe0]/25 to-[#4f9eff]/25 border border-white/15 flex items-center justify-center text-[#9d93f7] mb-4 shadow-xl group-hover:scale-105 transition-transform">
              {uploading ? (
                <Loader2 size={30} className="animate-spin text-[#00d4aa]" />
              ) : (
                <UploadCloud size={30} className="text-[#7c6fe0]" />
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mb-1">
              {uploading
                ? "Neural Document Processing Active..."
                : isDragActive
                ? "Drop the study file into the knowledge core..."
                : "Drop your notes or PDFs into the library"}
            </h3>

            <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
              Supports PDF, Plain Text, and Markdown (up to 25MB). Content is cleaned, split into chunks, and indexed for RAG retrieval.
            </p>

            {uploading ? (
              <div className="flex items-center gap-2 text-xs text-gray-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-ping" />
                <span>
                  {uploadStage === "extracting" && "Stage 1/3: Extracting text streams..."}
                  {uploadStage === "chunking" && "Stage 2/3: Semantic overlapping chunking..."}
                  {uploadStage === "indexing" && "Stage 3/3: Storing knowledge nodes..."}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="badge badge-purple text-[9px]">PDF Parser</span>
                <span className="badge badge-info text-[9px]">TXT</span>
                <span className="badge badge-success text-[9px]">MARKDOWN</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-[#7c6fe0]" />
              <span>Indexed Materials ({materials.length})</span>
            </h2>
            <span className="text-xs text-gray-400 font-mono">
              Ready for RAG inference
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-2xl glass-panel animate-pulse" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-dashed border-white/10">
              <FileText size={40} className="mx-auto text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-200 mb-1">Library Empty</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                Upload your lecture notes, textbook chapters, or syllabi above to initialize your study partner.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-300">
                          <FileText size={17} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white line-clamp-1">
                            {mat.title}
                          </h4>
                          <span className="text-[11px] text-gray-400 uppercase font-mono">
                            {mat.fileName}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(mat.id, mat.title)}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                        title="Delete material"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 my-3 text-[11px] text-gray-400">
                      <span className="badge badge-success text-[10px]">
                        ✓ {mat.status}
                      </span>
                      <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                        <Layers size={11} className="text-[#7c6fe0]" />
                        {mat._count?.chunks || mat.chunkCount || 0} chunks
                      </span>
                      <span className="text-gray-500">{formatBytes(mat.fileSize)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-1.5 text-center">
                    <Link
                      href={`/chat?materialId=${mat.id}`}
                      className="p-1.5 rounded-lg bg-[#7c6fe0]/15 hover:bg-[#7c6fe0]/25 text-[#9d93f7] text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <MessageSquare size={13} />
                      <span>Chat</span>
                    </Link>
                    <Link
                      href={`/quiz?materialId=${mat.id}`}
                      className="p-1.5 rounded-lg bg-[#4f9eff]/15 hover:bg-[#4f9eff]/25 text-[#4f9eff] text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <HelpCircle size={13} />
                      <span>Quiz</span>
                    </Link>
                    <Link
                      href={`/revision?materialId=${mat.id}`}
                      className="p-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
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

        {showPasteModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel bg-[#0d0e1c] border border-white/15 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-1">
                Paste Study Notes
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Paste lecture transcripts, textbook excerpts, or syllabus points.
              </p>

              <form onSubmit={handlePasteSubmit} className="space-y-4">
                <div>
                  <label className="label">Topic Title</label>
                  <input
                    type="text"
                    required
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    placeholder="e.g. Distributed Systems & Consensus"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Study Text</label>
                  <textarea
                    required
                    rows={8}
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    placeholder="Paste notes content here..."
                    className="input text-xs resize-none font-mono"
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
                        Indexing...
                      </>
                    ) : (
                      "Save into Library"
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
