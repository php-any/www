import React, { useState, useEffect, useRef } from "react";
import CodeEditor from "../components/CodeEditor";
import {
  FolderOpen,
  Save,
  Loader2,
  Copy,
  Check,
  X,
  Share2,
  Edit2,
  ChevronDown,
  BookOpen,
  AlertCircle,
  Play,
} from "lucide-react";
import { mockBackend } from "../utils/mockBackend";
import { File } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import { executeProject } from "../utils/mockRuntime";

const Playground: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [projectName, setProjectName] = useState("Loading...");
  const [isEditingName, setIsEditingName] = useState(false);

  // Templates State
  const [templates, setTemplates] = useState<
    { id: string; name: string; description: string }[]
  >([]);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isUrlCopied, setIsUrlCopied] = useState(false);

  // Confirmation Modal State
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null
  );

  // Runtime Logs State
  const [runtimeLogs, setRuntimeLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { t } = useLanguage();

  useEffect(() => {
    // Initialize session on mount
    const init = async () => {
      try {
        const [sessionRes, templatesRes] = await Promise.all([
          mockBackend.initSession(),
          mockBackend.getTemplates(),
        ]);

        if (sessionRes.status === "success" && sessionRes.data) {
          setSessionId(sessionRes.data.sessionId);
          setFiles(sessionRes.data.project.files);
          setProjectName(sessionRes.data.project.name);
        }

        if (templatesRes.status === "success" && templatesRes.data) {
          setTemplates(templatesRes.data);
        }
      } catch (e) {
        console.error("Failed to init session", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Click outside listener for templates dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templatesRef.current &&
        !templatesRef.current.contains(event.target as Node)
      ) {
        setIsTemplatesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileCreate = (path: string, isFolder: boolean) => {
    const finalPath = isFolder && !path.endsWith("/") ? `${path}/` : path;

    setFiles((prev) => ({
      ...prev,
      [finalPath]: {
        name: finalPath.split("/").filter(Boolean).pop() || finalPath,
        language: isFolder
          ? "markdown"
          : finalPath.endsWith(".json")
          ? "json"
          : finalPath.endsWith(".md")
          ? "markdown"
          : "origami",
        content: isFolder
          ? ""
          : finalPath.endsWith(".zy")
          ? "function main() {\n    \n}"
          : "",
        isEntry: false,
      },
    }));
  };

  const handleFileDelete = (path: string) => {
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      setFiles((prev) => {
        const newFiles = { ...prev };
        // Delete the file/folder itself and any children
        Object.keys(newFiles).forEach((key) => {
          if (key === path || key.startsWith(path)) {
            delete newFiles[key];
          }
        });
        return newFiles;
      });
    }
  };

  const handleFileRename = (oldPath: string, newPath: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      const isFolder = oldPath.endsWith("/");

      if (isFolder) {
        // Recursive rename for folders
        Object.keys(newFiles).forEach((key) => {
          if (key.startsWith(oldPath)) {
            const suffix = key.substring(oldPath.length);
            const targetPath = newPath + suffix;
            const content = newFiles[key];
            delete newFiles[key];
            newFiles[targetPath] = {
              ...content,
              name: targetPath.split("/").filter(Boolean).pop() || "",
            };
          }
        });
      } else {
        // Single file rename
        if (newFiles[oldPath]) {
          const content = newFiles[oldPath];
          delete newFiles[oldPath];
          newFiles[newPath] = {
            ...content,
            name: newPath.split("/").pop() || "",
          };
        }
      }
      return newFiles;
    });
  };

  const handleFileUpdate = (path: string, content: string) => {
    setFiles((prev) => ({
      ...prev,
      [path]: { ...prev[path], content },
    }));
  };

  const confirmLoadTemplate = async () => {
    if (!pendingTemplateId) return;

    const templateId = pendingTemplateId;
    setPendingTemplateId(null); // Close modal
    setIsLoading(true);
    setIsTemplatesOpen(false);
    setRuntimeLogs([]); // Clear previous logs

    try {
      const res = await mockBackend.loadTemplate(templateId);
      if (res.status === "success" && res.data) {
        setSessionId(res.data.sessionId);
        setFiles(res.data.project.files);
        setProjectName(res.data.project.name);
      }
    } catch (e) {
      console.error("Failed to load template", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTemplateClick = (templateId: string) => {
    setPendingTemplateId(templateId);
    setIsTemplatesOpen(false);
  };

  const handleShare = async () => {
    if (!sessionId) return;
    setIsSharing(true);
    try {
      const res = await mockBackend.shareProject(sessionId);
      if (res.data) {
        setShareUrl(res.data.url);
        setIsShareModalOpen(true);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (
      !projectName ||
      projectName.trim() === "" ||
      projectName === "Untitled Project"
    ) {
      alert(t("playground.saveAlert"));
      setIsEditingName(true);
      return;
    }
    if (!sessionId) return;

    await mockBackend.saveProject(sessionId, files);
    alert(t("playground.saved"));
  };

  const handleRun = async () => {
    setIsRunning(true);
    setRuntimeLogs(["Initializing runtime..."]);

    try {
      // Reconstruct project object from current state
      const project = {
        id: sessionId || "temp",
        name: projectName,
        description: "User Project",
        files: files,
      };

      const logs = await executeProject(project);
      setRuntimeLogs(logs);
    } catch (e) {
      console.error(e);
      setRuntimeLogs((prev) => [...prev, "Error: Failed to execute project."]);
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-origami-cyan" size={32} />
          <p className="text-gray-400 font-mono animate-pulse">
            {t("playground.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen pt-16 bg-[#050505]">
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col min-h-0">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4 shrink-0 relative z-20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isEditingName ? (
                <input
                  autoFocus
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setIsEditingName(false)
                  }
                  className="text-2xl font-bold bg-gray-900 text-white border border-origami-blue rounded px-2 py-1 outline-none w-64"
                />
              ) : (
                <h1
                  className="text-2xl font-bold text-white flex items-center gap-2 cursor-pointer hover:text-origami-cyan transition-colors group"
                  onClick={() => setIsEditingName(true)}
                  title={t("playground.renameHint")}
                >
                  {projectName}
                  <Edit2
                    size={16}
                    className="opacity-0 group-hover:opacity-100 text-gray-500"
                  />
                </h1>
              )}
              <span className="text-xs font-normal text-gray-500 border border-gray-800 rounded px-2 py-0.5">
                {t("playground.beta")}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{t("playground.title")}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={templatesRef}>
              <button
                onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium rounded-lg border border-gray-800 transition-colors"
              >
                <BookOpen size={16} />
                Examples
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    isTemplatesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isTemplatesOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#18181B] border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-2">
                    <div className="text-xs font-bold text-gray-500 px-2 py-1 uppercase tracking-wider mb-1">
                      Load Example
                    </div>
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleLoadTemplateClick(template.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                      >
                        <div className="text-sm font-medium text-gray-200 group-hover:text-white">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {template.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                isRunning
                  ? "bg-gray-800 text-gray-500 border-gray-800 cursor-not-allowed"
                  : "bg-origami-blue/10 text-origami-blue border-origami-blue/30 hover:bg-origami-blue/20"
              }`}
            >
              {isRunning ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Play size={16} />
              )}
              Run
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium rounded-lg border border-gray-800 transition-colors"
            >
              <Save size={16} /> {t("playground.save")}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-rows-[1fr_auto] gap-4">
          <CodeEditor
            key={sessionId || "session-init"} // Forces remount when project/session changes
            files={files}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            onFileUpdate={handleFileUpdate}
            onFileRename={handleFileRename}
            onShare={handleShare}
            height="h-full"
            // We'll show logs via custom implementation instead of built-in console for now,
            // or pass logs if CodeEditor supported it.
            // For this iteration, we'll add a log panel below.
          />

          {/* Runtime Logs Panel */}
          <div className="h-48 bg-[#0F0F11] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-[#18181B] border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Console Output
              </span>
              <button
                onClick={() => setRuntimeLogs([])}
                className="text-xs text-gray-500 hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
              {runtimeLogs.length === 0 ? (
                <span className="text-gray-600 italic">
                  Ready to execute...
                </span>
              ) : (
                runtimeLogs.map((log, i) => (
                  <div key={i} className="text-gray-300 mb-1 break-all">
                    {log}
                  </div>
                ))
              )}
              {isRunning && (
                <div className="text-origami-cyan animate-pulse">_</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F11] border border-origami-border rounded-xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Share2 size={20} className="text-origami-blue" />{" "}
              {t("playground.shareTitle")}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {t("playground.shareDesc")}
            </p>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#18181B] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-origami-blue"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setIsUrlCopied(true);
                  setTimeout(() => setIsUrlCopied(false), 2000);
                }}
                className="bg-origami-blue/10 hover:bg-origami-blue/20 text-origami-blue border border-origami-blue/30 rounded-lg px-3 flex items-center justify-center transition-colors"
              >
                {isUrlCopied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Loading Template */}
      {pendingTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F11] border border-red-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" /> Warning
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Loading a new example will discard all current changes. Are you
              sure you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingTemplateId(null)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmLoadTemplate}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                Discard & Load
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playground;
