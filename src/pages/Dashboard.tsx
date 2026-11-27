import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiLogOut,
  FiMenu,
  FiArchive,
  FiActivity,
  FiTrash2,
} from "react-icons/fi";
import ReviveMedicalTechLogo from "/ReviveMedicalTech.png";
import FileManagement from "../components/FileManagement";
import UserManagementView from "../components/UserManagementView";
import TrashView from "../components/TrashView";
import ArchiveView from "../components/ArchiveView";
import AuditLogsView from "../components/AuditLogsView";
import type { User } from "../types";

const DASHBOARD_STATE_KEY = "edms_dashboard_nav";

type SavedDashboardState = {
  activeView?: string;
  selectedFolderId?: number | null;
  selectedFolderName?: string | null;
  navigationHistory?: number[];
  navigationNameHistory?: (string | null)[];
  isGlobalSearch?: boolean;
};

const readSavedDashboardState = (): SavedDashboardState => {
  try {
    const raw = localStorage.getItem(DASHBOARD_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const Dashboard: React.FC = () => {
  const saved = useMemo(() => readSavedDashboardState(), []);

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(
    typeof saved.selectedFolderId === "number" ? saved.selectedFolderId : null
  );
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(
    typeof saved.selectedFolderName === "string"
      ? saved.selectedFolderName
      : null
  );
  const [navigationHistory, setNavigationHistory] = useState<number[]>(
    Array.isArray(saved.navigationHistory) ? saved.navigationHistory : []
  );
  const [navigationNameHistory, setNavigationNameHistory] = useState<
    (string | null)[]
  >(
    Array.isArray(saved.navigationNameHistory)
      ? saved.navigationNameHistory
      : []
  );

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("edms_sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGlobalSearch, setIsGlobalSearch] = useState(
    !!saved.isGlobalSearch
  );
  const [activeView, setActiveView] = useState(
    typeof saved.activeView === "string" && saved.activeView
      ? saved.activeView
      : "dashboard"
  );
  const [permissionResource, setPermissionResource] = useState<{
    id: number;
    type: "folder" | "file";
  } | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const navigate = useNavigate();
  const user: User = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Non–super-admins shouldn't land on admin-only views after reload
    if (
      user.role !== "super_admin" &&
      ["audit", "trash", "users"].includes(activeView)
    ) {
      setActiveView("dashboard");
    }
  }, [user.role, activeView]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "edms_sidebar_collapsed",
        sidebarCollapsed ? "1" : "0"
      );
    } catch {
      /* optional */
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    try {
      const payload: SavedDashboardState = {
        activeView,
        selectedFolderId,
        selectedFolderName,
        navigationHistory,
        navigationNameHistory,
        isGlobalSearch,
      };
      localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify(payload));
    } catch {
      /* optional */
    }
  }, [
    activeView,
    selectedFolderId,
    selectedFolderName,
    navigationHistory,
    navigationNameHistory,
    isGlobalSearch,
  ]);

  useEffect(() => {
    const container = document.getElementById("file-management-wrapper");
    if (!container) return;

    const setTitles = () => {
      const selectors =
        ".truncate, .file-name, [data-filename], .text-ellipsis, .overflow-ellipsis";
      const candidates = container.querySelectorAll<HTMLElement>(selectors);
      candidates.forEach((el) => {
        const text = el.innerText?.trim();
        if (!text) return;
        if (!el.getAttribute("title")) el.setAttribute("title", text);
        const clickable = el.closest(
          'button, a, [role="button"], .file-item, .folder-item, .file-row, .folder-row, .folder-card, .file-card'
        );
        if (clickable instanceof HTMLElement && !clickable.getAttribute("title")) {
          clickable.setAttribute("title", text);
        }
      });
    };

    setTitles();
    const mo = new MutationObserver(setTitles);
    mo.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => mo.disconnect();
  }, [activeView, selectedFolderId, selectedFolderName]);

  const handleUserManagementClose = () => {
    setIsUserManagementOpen(false);
    setEditingUser(null);
  };

  const handleFolderSelect = (
    folderId: number | null,
    folderName?: string | null
  ) => {
    if (folderId === null) {
      setSelectedFolderId(null);
      setSelectedFolderName(null);
      setNavigationHistory([]);
      setNavigationNameHistory([]);
    } else {
      if (selectedFolderId !== null) {
        setNavigationHistory((prev) => [...prev, selectedFolderId]);
        setNavigationNameHistory((prev) => [...prev, selectedFolderName]);
      }
      setSelectedFolderId(folderId);
      setSelectedFolderName(folderName ?? null);
    }
  };

  const handleBackNavigation = () => {
    if (navigationHistory.length > 0) {
      const previousFolderId = navigationHistory[navigationHistory.length - 1];
      const previousFolderName =
        navigationNameHistory[navigationNameHistory.length - 1] ?? null;
      setNavigationHistory((prev) => prev.slice(0, -1));
      setNavigationNameHistory((prev) => prev.slice(0, -1));
      setSelectedFolderId(previousFolderId);
      setSelectedFolderName(previousFolderName);
    } else {
      setSelectedFolderId(null);
      setSelectedFolderName(null);
    }
  };

  const handleBreadcrumbJump = (index: number) => {
    // index 0 = Dashboard root
    if (index <= 0) {
      handleFolderSelect(null);
      return;
    }
    const historyNames = navigationNameHistory.filter(
      (name): name is string => !!name && name.trim().length > 0
    );
    const targetHistoryIdx = index - 1;
    if (targetHistoryIdx < historyNames.length) {
      const newHistIds = navigationHistory.slice(0, targetHistoryIdx);
      const newHistNames = navigationNameHistory.slice(0, targetHistoryIdx);
      const targetId = navigationHistory[targetHistoryIdx];
      const targetName = navigationNameHistory[targetHistoryIdx];
      setNavigationHistory(newHistIds);
      setNavigationNameHistory(newHistNames);
      setSelectedFolderId(targetId);
      setSelectedFolderName(targetName);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem(DASHBOARD_STATE_KEY);
    navigate("/login");
  };

  const selectedFolderPathSegments = useMemo(() => {
    if (!selectedFolderId) return [];
    const historyNames = navigationNameHistory.filter(
      (name): name is string => !!name && name.trim().length > 0
    );
    const segments = ["Dashboard", ...historyNames];
    if (selectedFolderName && selectedFolderName.trim().length > 0) {
      segments.push(selectedFolderName);
    }
    return segments;
  }, [navigationNameHistory, selectedFolderId, selectedFolderName]);

  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: FiHome, group: "Workspace" },
    { id: "archive", name: "Archive", icon: FiArchive, group: "Workspace" },
  ];

  if (user.role === "super_admin") {
    navigationItems.push(
      { id: "audit", name: "Audit Logs", icon: FiActivity, group: "Admin" },
      { id: "trash", name: "Trash", icon: FiTrash2, group: "Admin" },
      { id: "users", name: "Users", icon: FiUsers, group: "Admin" }
    );
  }

  const handleNavigationClick = (itemId: string) => {
    setActiveView(itemId);
    setSelectedFolderId(null);
    setSelectedFolderName(null);
    setNavigationHistory([]);
    setNavigationNameHistory([]);
    if (itemId !== "dashboard") {
      setSearchQuery("");
      setIsGlobalSearch(false);
    }
  };

  const pageTitle =
    activeView === "dashboard"
      ? "Dashboard"
      : activeView === "archive"
        ? "Archive"
        : activeView === "audit"
          ? "Audit Logs"
          : activeView === "trash"
            ? "Trash"
            : activeView === "users"
              ? "User Management"
              : "EDMS";

  const toggleMenu = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSidebarCollapsed((v) => !v);
    } else {
      setMobileSidebarOpen((v) => !v);
    }
  };

  const narrow = sidebarCollapsed && !mobileSidebarOpen;
  const rowClass = (active: boolean) =>
    `flex items-center gap-3 h-10 w-full rounded-md text-[14px] transition-colors ${
      narrow ? "md:justify-center" : ""
    } px-3 ${
      active
        ? "bg-ink-soft text-white font-medium shadow-[inset_3px_0_0_#5aa6e6]"
        : "text-[#b8c6d3] hover:bg-[#1b2d3d] hover:text-white"
    }`;

  const initials = (user.username || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-paper text-ink">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-ink/50"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-52 bg-[#0b1622] text-white flex flex-col transition-[width,transform] duration-200 ${
          sidebarCollapsed ? "md:w-[72px]" : "md:w-52"
        } ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div
          className={`border-b border-[#243445] ${
            narrow ? "md:px-2 md:py-2 md:flex md:justify-center" : "pl-0 pr-2 py-1.5"
          }`}
        >
          <div
            className={`overflow-hidden ${
              narrow ? "md:w-12 md:h-12 w-full" : "w-full"
            }`}
          >
            <img
              src={ReviveMedicalTechLogo}
              alt="Revive Medical Technologies"
              className={`block w-full object-contain object-left mix-blend-lighten ${
                narrow
                  ? "md:h-12 md:object-center md:scale-150 h-auto"
                  : "h-auto max-w-none w-[118%] -ml-2 scale-[1.05] origin-left"
              }`}
            />
          </div>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
          {navigationItems.map((item, i) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            const newGroup =
              item.group && item.group !== navigationItems[i - 1]?.group;
            return (
              <React.Fragment key={item.id}>
                {newGroup &&
                  (narrow ? (
                    <div className="mx-3 my-3 border-t border-[#243445]" />
                  ) : (
                    <p className="px-3 pt-5 pb-2 eyebrow text-[#8aa2b8]">
                      {item.group}
                    </p>
                  ))}
                <div className="mb-0.5">
                  <button
                    type="button"
                    title={narrow ? item.name : undefined}
                    onClick={() => {
                      handleNavigationClick(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={rowClass(active)}
                  >
                    <Icon size={15} className="shrink-0" aria-hidden="true" />
                    <span
                      className={`truncate flex-1 text-left ${
                        narrow ? "md:sr-only" : ""
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="border-t border-[#243445] px-3 py-3 space-y-0.5">
          <div
            className={`flex items-center gap-3 px-3 py-2 ${
              narrow ? "md:justify-center" : ""
            }`}
          >
            <span className="h-8 w-8 rounded-full bg-white/10 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {initials}
            </span>
            <span className={`min-w-0 ${narrow ? "md:hidden" : ""}`}>
              <span className="block text-sm font-medium truncate">
                {user.username}
              </span>
              <span className="block text-xs text-[#8aa2b8] capitalize truncate">
                {user.role?.replace(/_/g, " ")}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className={`${rowClass(false)} hover:!text-[#ff9a94]`}
            title={narrow ? "Log out" : undefined}
          >
            <FiLogOut size={15} className="shrink-0" />
            <span
              className={`truncate flex-1 text-left ${
                narrow ? "md:sr-only" : ""
              }`}
            >
              Log out
            </span>
          </button>
        </div>
      </aside>

      <div
        className={`min-w-0 flex flex-col min-h-screen transition-[margin] duration-200 ${
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-52"
        }`}
      >
        <header className="sticky top-0 z-20 h-16 bg-paper/95 backdrop-blur border-b border-rule px-4 md:px-6 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="h-10 w-10 -ml-1 shrink-0 rounded-md flex items-center justify-center text-muted hover:text-ink hover:bg-[#ebe8df]"
          >
            <FiMenu size={18} />
          </button>

          <nav aria-label="Breadcrumb" className="flex-1 min-w-0">
            <ol className="flex items-center gap-2 min-w-0">
              {activeView === "dashboard" &&
              selectedFolderPathSegments.length > 0 ? (
                selectedFolderPathSegments.map((segment, index) => {
                  const last = index === selectedFolderPathSegments.length - 1;
                  return (
                    <React.Fragment key={`${segment}-${index}`}>
                      {index > 0 && (
                        <li
                          aria-hidden="true"
                          className="hidden sm:block text-[#b5ad9c]"
                        >
                          /
                        </li>
                      )}
                      <li
                        className={`truncate ${last ? "" : "hidden sm:block"}`}
                      >
                        {last ? (
                          <h1
                            className="text-[17px] font-semibold tracking-tight truncate"
                            aria-current="page"
                            title={segment}
                          >
                            {segment}
                          </h1>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleBreadcrumbJump(index)}
                            className="text-sm text-muted hover:text-ink truncate max-w-[160px]"
                            title={segment}
                          >
                            {segment}
                          </button>
                        )}
                      </li>
                    </React.Fragment>
                  );
                })
              ) : (
                <li>
                  <h1
                    className="text-[17px] font-semibold tracking-tight truncate"
                    aria-current="page"
                  >
                    {pageTitle}
                  </h1>
                </li>
              )}
            </ol>
          </nav>

          <button
            type="button"
            className="flex items-center gap-2.5 h-10 pl-1 pr-2 rounded-md hover:bg-[#ebe8df]"
            aria-label={`Account: ${user.username}`}
            title={user.username}
          >
            <span
              aria-hidden="true"
              className="h-8 w-8 rounded-full bg-ink text-white text-xs font-semibold flex items-center justify-center"
            >
              {initials}
            </span>
            <span className="hidden sm:block text-left leading-tight">
              <span className="block text-sm font-medium">{user.username}</span>
              <span className="block text-xs text-muted capitalize max-w-[180px] truncate">
                {user.role?.replace(/_/g, " ")}
              </span>
            </span>
          </button>
        </header>

        <main className="flex-1 min-w-0 px-4 md:px-6 py-5">
          {activeView === "users" ? (
            <UserManagementView
              user={user}
              isUserManagementOpen={isUserManagementOpen}
              setIsUserManagementOpen={setIsUserManagementOpen}
              editingUser={editingUser}
              setEditingUser={setEditingUser}
              onUserCreated={() => setEditingUser(null)}
              onUserManagementClose={handleUserManagementClose}
            />
          ) : activeView === "audit" ? (
            <AuditLogsView user={user} />
          ) : activeView === "archive" ? (
            <ArchiveView
              user={user}
              selectedFolderId={selectedFolderId}
              onFolderSelect={handleFolderSelect}
              onBackNavigation={handleBackNavigation}
              onAssignPermission={(resourceId, resourceType) => {
                setPermissionResource({ id: resourceId, type: resourceType });
                setIsPermissionModalOpen(true);
              }}
            />
          ) : activeView === "trash" ? (
            <TrashView
              user={user}
              selectedFolderId={selectedFolderId}
              onFolderSelect={handleFolderSelect}
              onBackNavigation={handleBackNavigation}
              onAssignPermission={(resourceId, resourceType) => {
                setPermissionResource({ id: resourceId, type: resourceType });
                setIsPermissionModalOpen(true);
              }}
            />
          ) : (
            <div id="file-management-wrapper">
              <FileManagement
                selectedFolderId={selectedFolderId}
                selectedFolderName={selectedFolderName}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                isGlobalSearch={isGlobalSearch}
                onGlobalSearchChange={setIsGlobalSearch}
                user={user}
                isUploadModalOpen={isUploadModalOpen}
                setIsUploadModalOpen={setIsUploadModalOpen}
                isPermissionModalOpen={isPermissionModalOpen}
                setIsPermissionModalOpen={setIsPermissionModalOpen}
                permissionResource={permissionResource}
                setPermissionResource={setPermissionResource}
                onFolderSelect={handleFolderSelect}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
