// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FiHome,
//   FiUsers,
//   FiLogOut,
//   FiMenu,
//   FiX,
//   // FiStar,
//   FiTrash2,
// } from "react-icons/fi";
// import ReviveMedicalTechLogo from "/ReviveMediTech.jpg";
// import FileManagement from "../components/FileManagement";
// import UserManagementView from "../components/UserManagementView";
// // import FavoritesView from "../components/FavoritesView";
// // import FavoritesNavigationView from "../components/FavoritesNavigationView";
// import TrashView from "../components/TrashView";
// import type { User } from "../types";

// const Dashboard: React.FC = () => {
//   const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
//   const [selectedFolderName, setSelectedFolderName] = useState<string | null>(
//     null
//   );

//   // navigationHistory stores folder IDs (as before)
//   const [navigationHistory, setNavigationHistory] = useState<number[]>([]);
//   // navigationNameHistory stores folder names in parallel (new)
//   const [navigationNameHistory, setNavigationNameHistory] = useState<
//     (string | null)[]
//   >([]);

//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
//   const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
//   // const [searchQuery, setSearchQuery] = useState("");
//   const [activeView, setActiveView] = useState("dashboard");
//   const [permissionResource, setPermissionResource] = useState<{
//     id: number;
//     type: "folder" | "file";
//   } | null>(null);
//   const [editingUser, setEditingUser] = useState<User | null>(null);

//   // const { data: folders, isLoading: foldersLoading } = useFolderTree();
//   const navigate = useNavigate();

//   const user: User = JSON.parse(localStorage.getItem("user") || "{}");

//   // --- NEW: add titles (tooltips) for truncated file names inside FileManagement ---
//   useEffect(() => {
//     const container = document.getElementById("file-management-wrapper");
//     if (!container) return;

//     const setTitles = () => {
//       // common classes / attributes used to show file name text (covered heuristically)
//       const candidates = container.querySelectorAll<HTMLElement>(
//         ".truncate, .file-name, [data-filename], .text-ellipsis, .overflow-ellipsis"
//       );
//       candidates.forEach((el) => {
//         const text = el.innerText?.trim();
//         if (text && !el.getAttribute("title")) {
//           el.setAttribute("title", text);
//         }
//       });
//     };

//     // initial pass
//     setTitles();

//     // observe DOM changes so dynamically-added rows also get titles
//     const mo = new MutationObserver(() => {
//       setTitles();
//     });
//     mo.observe(container, { childList: true, subtree: true, characterData: true });

//     return () => mo.disconnect();
//   }, [
//     activeView,
//     isUploadModalOpen,
//     isPermissionModalOpen,
//     isUserManagementOpen,
//     selectedFolderId,
//     selectedFolderName,
//   ]);
//   // --- end new code ---

//   // const handleEditUser = (userItem: User) => {
//   //   setEditingUser(userItem);
//   //   setIsUserManagementOpen(true);
//   // };

//   const handleUserManagementClose = () => {
//     setIsUserManagementOpen(false);
//     setEditingUser(null);
//   };

//   // Navigation functions with history
//   // NOTE: onFolderSelect can be called with (folderId) or (folderId, folderName)
//   const handleFolderSelect = (folderId: number | null, folderName?: string | null) => {
//     if (folderId === null) {
//       // Going back to root - clear history and name
//       setSelectedFolderId(null);
//       setSelectedFolderName(null);
//       setNavigationHistory([]);
//       setNavigationNameHistory([]);
//     } else {
//       // Going into a folder - add current folder id & name to history (if currently inside a folder)
//       if (selectedFolderId !== null) {
//         setNavigationHistory((prev) => [...prev, selectedFolderId]);
//         setNavigationNameHistory((prev) => [...prev, selectedFolderName]);
//       }
//       setSelectedFolderId(folderId);
//       setSelectedFolderName(folderName ?? null);
//     }
//   };

//   const handleBackNavigation = () => {
//     if (navigationHistory.length > 0) {
//       // Go back to previous folder in history
//       const previousFolderId = navigationHistory[navigationHistory.length - 1];
//       const previousFolderName =
//         navigationNameHistory[navigationNameHistory.length - 1] ?? null;

//       setNavigationHistory((prev) => prev.slice(0, -1));
//       setNavigationNameHistory((prev) => prev.slice(0, -1));

//       setSelectedFolderId(previousFolderId);
//       setSelectedFolderName(previousFolderName);
//     } else {
//       // No history - go to root
//       setSelectedFolderId(null);
//       setSelectedFolderName(null);
//     }
//   };

//   const handleUserCreated = () => {
//     setEditingUser(null);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const navigationItems = [
//     {
//       id: "dashboard",
//       name: "Dashboard",
//       icon: FiHome,
//       color: "text-blue-600",
//     },
//     // {
//     //   id: "favorites",
//     //   name: "Favorites",
//     //   icon: FiStar,
//     //   color: "text-yellow-600",
//     // },
//   ];

//   // Add Trash and Users sections only for super_admin
//   if (user.role === "super_admin") {
//     navigationItems.push({
//       id: "trash",
//       name: "Trash",
//       icon: FiTrash2,
//       color: "text-red-600",
//     });
//     navigationItems.push({
//       id: "users",
//       name: "Users",
//       icon: FiUsers,
//       color: "text-indigo-600",
//     });
//   }

//   // Add Logout to navigation items
//   navigationItems.push({
//     id: "logout",
//     name: "Logout",
//     icon: FiLogOut,
//     color: "text-red-600",
//   });

//   const handleNavigationClick = (itemId: string) => {
//     if (itemId === "logout") {
//       handleLogout();
//     } else {
//       setActiveView(itemId);
//       // Reset selected folder when switching views
//       setSelectedFolderId(null);
//       setSelectedFolderName(null);
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
//       {/* Sidebar */}
//       <div
//         className={`fixed inset-y-0 left-0 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-300 ease-in-out lg:static ${
//           sidebarOpen
//             ? "translate-x-0 w-80 lg:block"
//             : "-translate-x-full lg:hidden"
//         } ${
//           mobileSidebarOpen ? "translate-x-0 w-80" : "-translate-x-full"
//         } border-r border-gray-200/60`}
//       >
//         <div className="flex flex-col h-full">
//           {/* Header */}
//           <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
//             <div className="flex items-center space-x-3">
//               <img
//                 src={ReviveMedicalTechLogo}
//                 alt="Revive Medical Tech"
//                 className="h-12 md:h-16 lg:h-20 xl:h-24 2xl:h-20 w-auto transition-all duration-300"
//               />
//             </div>
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="hidden lg:flex p-2 hover:bg-gray-100 rounded-xl transition-colors"
//             >
//               <FiX size={18} className="text-gray-500" />
//             </button>
//             <button
//               onClick={() => setMobileSidebarOpen(false)}
//               className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
//             >
//               <FiX size={18} className="text-gray-500" />
//             </button>
//           </div>

//           {/* Navigation */}
//           <div className="flex-1 px-3">
//             <nav className="space-y-1">
//               {navigationItems.map((item) => {
//                 const Icon = item.icon;
//                 return (
//                   <button
//                     key={item.id}
//                     onClick={() => handleNavigationClick(item.id)}
//                     className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${
//                       activeView === item.id && item.id !== "logout"
//                         ? "bg-blue-50 text-blue-700 border border-blue-200"
//                         : item.id === "logout"
//                         ? "text-red-600 hover:bg-red-50"
//                         : "text-gray-600 hover:bg-gray-50"
//                     }`}
//                   >
//                     <Icon
//                       size={20}
//                       className={`mr-3 ${
//                         activeView === item.id && item.id !== "logout"
//                           ? "text-blue-600"
//                           : item.color
//                       }`}
//                     />
//                     <span className="font-medium">{item.name}</span>
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>

//           {/* User Section */}
//           <div className="p-6 border-t border-gray-200/60">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
//                 <span className="text-white font-semibold text-sm">
//                   {user.username ? user.username.charAt(0).toUpperCase() : "U"}
//                 </span>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-semibold text-gray-900 truncate">
//                   {user.username}
//                 </p>
//                 <p className="text-xs text-gray-500 capitalize">{user.role}</p>
               
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
//         {/* Header */}
//         <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
//           <div className="flex items-center justify-between p-6">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => setMobileSidebarOpen(true)}
//                 className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
//               >
//                 <FiMenu size={24} className="text-gray-600" />
//               </button>
//               {!sidebarOpen && (
//                 <button
//                   onClick={() => setSidebarOpen(true)}
//                   className="hidden lg:flex p-2 hover:bg-gray-100 rounded-xl transition-colors"
//                 >
//                   <FiMenu size={24} className="text-gray-600" />
//                 </button>
//               )}
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   {activeView === "dashboard" && "Dashboard"}
//                   {/* {activeView === "favorites" && "Favorites"} */}
//                   {activeView === "trash" && "Trash"}
//                   {activeView === "users" && "User Management"}
//                 </h1>
//                 <p className="text-gray-500">
//                   {selectedFolderId
//                     ? selectedFolderName
//                       ? `Folder: ${selectedFolderName}`
//                       : `Folder: ${selectedFolderId}`
//                     : "All your files in one place"}
//                 </p>
//               </div>
//             </div>

//             {/* <div className="flex items-center space-x-3">
//               {activeView === "users" && (
//                 <button
//                   onClick={() => {
//                     setEditingUser(null);
//                     setIsUserManagementOpen(true);
//                   }}
//                   className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
//                 >
//                   <FiUserPlus size={18} />
//                   <span>Add User</span>
//                 </button>
//               )}
//             </div> */}
//           </div>
//         </header>

//         {/* Content Area */}
//         <div className="flex-1 flex overflow-hidden">
//           <div className="flex-1 overflow-y-auto p-6">
//             {activeView === "users" ? (
//               <UserManagementView
//                 user={user}
//                 isUserManagementOpen={isUserManagementOpen}
//                 setIsUserManagementOpen={setIsUserManagementOpen}
//                 editingUser={editingUser}
//                 setEditingUser={setEditingUser}
//                 onUserCreated={handleUserCreated}
//                 onUserManagementClose={handleUserManagementClose}
//               />
//             ) : /* activeView === "favorites" ? (
//               selectedFolderId ? (
//                 <FavoritesNavigationView
//                   user={user}
//                   selectedFolderId={selectedFolderId}
//                   onFolderSelect={handleFolderSelect}
//                   onBackNavigation={handleBackNavigation}
//                   onAssignPermission={(resourceId, resourceType) => {
//                     setPermissionResource({
//                       id: resourceId,
//                       type: resourceType,
//                     });
//                     setIsPermissionModalOpen(true);
//                   }}
//                 />
//               ) : (
//                 <FavoritesView
//                   user={user}
//                   onFolderSelect={handleFolderSelect}
//                   onAssignPermission={(resourceId, resourceType) => {
//                     setPermissionResource({
//                       id: resourceId,
//                       type: resourceType,
//                     });
//                     setIsPermissionModalOpen(true);
//                   }}
//                 />
//               )
//             ) : */ activeView === "trash" ? (
//               <TrashView
//                 user={user}
//                 selectedFolderId={selectedFolderId}
//                 onFolderSelect={handleFolderSelect}
//                 onBackNavigation={handleBackNavigation}
//                 onAssignPermission={(resourceId, resourceType) => {
//                   setPermissionResource({ id: resourceId, type: resourceType });
//                   setIsPermissionModalOpen(true);
//                 }}
//               />
//             ) : (
//               // <-- wrapper added to scope tooltip logic without touching FileManagement internals
//               <div id="file-management-wrapper">
//                 <FileManagement
//                   selectedFolderId={selectedFolderId}
//                   selectedFolderName={selectedFolderName}
//                   searchQuery=""
//                   user={user}
//                   isUploadModalOpen={isUploadModalOpen}
//                   setIsUploadModalOpen={setIsUploadModalOpen}
//                   isPermissionModalOpen={isPermissionModalOpen}
//                   setIsPermissionModalOpen={setIsPermissionModalOpen}
//                   permissionResource={permissionResource}
//                   setPermissionResource={setPermissionResource}
//                   onFolderSelect={handleFolderSelect}
//                   onBackNavigation={handleBackNavigation}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Mobile sidebar overlay */}
//       {mobileSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
//           onClick={() => setMobileSidebarOpen(false)}
//         ></div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiLogOut,
  FiMenu,
  FiX,
  // FiStar,
  FiTrash2,
} from "react-icons/fi";
import ReviveMedicalTechLogo from "/ReviveMediTech.jpg";
import FileManagement from "../components/FileManagement";
import UserManagementView from "../components/UserManagementView";
// import FavoritesView from "../components/FavoritesView";
// import FavoritesNavigationView from "../components/FavoritesNavigationView";
import TrashView from "../components/TrashView";
import type { User } from "../types";

const Dashboard: React.FC = () => {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(
    null
  );

  // navigationHistory stores folder IDs (as before)
  const [navigationHistory, setNavigationHistory] = useState<number[]>([]);
  // navigationNameHistory stores folder names in parallel (new)
  const [navigationNameHistory, setNavigationNameHistory] = useState<
    (string | null)[]
  >([]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [permissionResource, setPermissionResource] = useState<{
    id: number;
    type: "folder" | "file";
  } | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // const { data: folders, isLoading: foldersLoading } = useFolderTree();
  const navigate = useNavigate();

  const user: User = JSON.parse(localStorage.getItem("user") || "{}");

  // --- NEW: add titles (tooltips) for truncated file names inside FileManagement ---
  // Improved: set the `title` also on the nearest clickable / container ancestor
  useEffect(() => {
    const container = document.getElementById("file-management-wrapper");
    if (!container) return;

    const setTitles = () => {
      // candidates inside FileManagement that usually hold file/folder names
      const selectors =
        ".truncate, .file-name, [data-filename], .text-ellipsis, .overflow-ellipsis";
      const candidates = container.querySelectorAll<HTMLElement>(selectors);

      candidates.forEach((el) => {
        const text = el.innerText?.trim();
        if (!text) return;

        // set title on the text element itself if missing
        if (!el.getAttribute("title")) {
          el.setAttribute("title", text);
        }

        // Also set the title on a reasonable enclosing clickable/container element
        // so hovering the icon or surrounding area shows the same tooltip.
        // Check common clickable/container selectors and some file/folder class names
        const clickableSelectors =
          'button, a, [role="button"], .file-item, .folder-item, .file-row, .folder-row, .project-folder, .folder-card, .file-card';
        let clickable: Element | null = null;
        try {
          clickable = el.closest(clickableSelectors);
        } catch {
          // In case closest throws for some exotic selector, we'll fallback below
          clickable = null;
        }

        // If we found a clickable ancestor, set its title if not already set
        if (clickable && clickable instanceof HTMLElement && !clickable.getAttribute("title")) {
          clickable.setAttribute("title", text);
        } else {
          // Fallbacks:
          // 1) parent element (covers icon next to name in the same wrapper)
          const parent = el.parentElement;
          if (parent && !parent.getAttribute("title")) {
            parent.setAttribute("title", text);
          }
          // 2) grandparent as a last resort
          else if (parent?.parentElement && !parent.parentElement.getAttribute("title")) {
            parent.parentElement.setAttribute("title", text);
          }
        }

        // Also ensure any sibling icons (e.g., svg inside the same wrapper) inherit the title via wrapper,
        // so hovering over icon will show the tooltip as well.
      });
    };

    // initial pass
    setTitles();

    // observe DOM changes so dynamically-added rows also get titles
    const mo = new MutationObserver(() => {
      setTitles();
    });
    mo.observe(container, { childList: true, subtree: true, characterData: true });

    return () => mo.disconnect();
  }, [
    activeView,
    isUploadModalOpen,
    isPermissionModalOpen,
    isUserManagementOpen,
    selectedFolderId,
    selectedFolderName,
  ]);
  // --- end new code ---

  // const handleEditUser = (userItem: User) => {
  //   setEditingUser(userItem);
  //   setIsUserManagementOpen(true);
  // };

  const handleUserManagementClose = () => {
    setIsUserManagementOpen(false);
    setEditingUser(null);
  };

  // Navigation functions with history
  // NOTE: onFolderSelect can be called with (folderId) or (folderId, folderName)
  const handleFolderSelect = (folderId: number | null, folderName?: string | null) => {
    if (folderId === null) {
      // Going back to root - clear history and name
      setSelectedFolderId(null);
      setSelectedFolderName(null);
      setNavigationHistory([]);
      setNavigationNameHistory([]);
    } else {
      // Going into a folder - add current folder id & name to history (if currently inside a folder)
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
      // Go back to previous folder in history
      const previousFolderId = navigationHistory[navigationHistory.length - 1];
      const previousFolderName =
        navigationNameHistory[navigationNameHistory.length - 1] ?? null;

      setNavigationHistory((prev) => prev.slice(0, -1));
      setNavigationNameHistory((prev) => prev.slice(0, -1));

      setSelectedFolderId(previousFolderId);
      setSelectedFolderName(previousFolderName);
    } else {
      // No history - go to root
      setSelectedFolderId(null);
      setSelectedFolderName(null);
    }
  };

  const handleUserCreated = () => {
    setEditingUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: FiHome,
      color: "text-blue-600",
    },
    // {
    //   id: "favorites",
    //   name: "Favorites",
    //   icon: FiStar,
    //   color: "text-yellow-600",
    // },
  ];

  // Add Trash and Users sections only for super_admin
  if (user.role === "super_admin") {
    navigationItems.push({
      id: "trash",
      name: "Trash",
      icon: FiTrash2,
      color: "text-red-600",
    });
    navigationItems.push({
      id: "users",
      name: "Users",
      icon: FiUsers,
      color: "text-indigo-600",
    });
  }

  // Add Logout to navigation items
  navigationItems.push({
    id: "logout",
    name: "Logout",
    icon: FiLogOut,
    color: "text-red-600",
  });

  const handleNavigationClick = (itemId: string) => {
    if (itemId === "logout") {
      handleLogout();
    } else {
      setActiveView(itemId);
      // Reset selected folder when switching views
      setSelectedFolderId(null);
      setSelectedFolderName(null);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-300 ease-in-out lg:static ${
          sidebarOpen
            ? "translate-x-0 w-80 lg:block"
            : "-translate-x-full lg:hidden"
        } ${
          mobileSidebarOpen ? "translate-x-0 w-80" : "-translate-x-full"
        } border-r border-gray-200/60`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
            <div className="flex items-center space-x-3">
              <img
                src={ReviveMedicalTechLogo}
                alt="Revive Medical Tech"
                className="h-12 md:h-16 lg:h-20 xl:h-24 2xl:h-20 w-auto transition-all duration-300"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiX size={18} className="text-gray-500" />
            </button>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiX size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigationClick(item.id)}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${
                      activeView === item.id && item.id !== "logout"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : item.id === "logout"
                        ? "text-red-600 hover:bg-red-50"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`mr-3 ${
                        activeView === item.id && item.id !== "logout"
                          ? "text-blue-600"
                          : item.color
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="p-6 border-t border-gray-200/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
               
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiMenu size={24} className="text-gray-600" />
              </button>
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden lg:flex p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FiMenu size={24} className="text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeView === "dashboard" && "Dashboard"}
                  {/* {activeView === "favorites" && "Favorites"} */}
                  {activeView === "trash" && "Trash"}
                  {activeView === "users" && "User Management"}
                </h1>
                <p className="text-gray-500">
                  {selectedFolderId
                    ? selectedFolderName
                      ? `Folder: ${selectedFolderName}`
                      : `Folder: ${selectedFolderId}`
                    : "All your files in one place"}
                </p>
              </div>
            </div>

            {/* <div className="flex items-center space-x-3">
              {activeView === "users" && (
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setIsUserManagementOpen(true);
                  }}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
                >
                  <FiUserPlus size={18} />
                  <span>Add User</span>
                </button>
              )}
            </div> */}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {activeView === "users" ? (
              <UserManagementView
                user={user}
                isUserManagementOpen={isUserManagementOpen}
                setIsUserManagementOpen={setIsUserManagementOpen}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                onUserCreated={handleUserCreated}
                onUserManagementClose={handleUserManagementClose}
              />
            ) : /* activeView === "favorites" ? (
              selectedFolderId ? (
                <FavoritesNavigationView
                  user={user}
                  selectedFolderId={selectedFolderId}
                  onFolderSelect={handleFolderSelect}
                  onBackNavigation={handleBackNavigation}
                  onAssignPermission={(resourceId, resourceType) => {
                    setPermissionResource({
                      id: resourceId,
                      type: resourceType,
                    });
                    setIsPermissionModalOpen(true);
                  }}
                />
              ) : (
                <FavoritesView
                  user={user}
                  onFolderSelect={handleFolderSelect}
                  onAssignPermission={(resourceId, resourceType) => {
                    setPermissionResource({
                      id: resourceId,
                      type: resourceType,
                    });
                    setIsPermissionModalOpen(true);
                  }}
                />
              )
            ) : */ activeView === "trash" ? (
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
              // <-- wrapper added to scope tooltip logic without touching FileManagement internals
              <div id="file-management-wrapper">
                <FileManagement
                  selectedFolderId={selectedFolderId}
                  selectedFolderName={selectedFolderName}
                  searchQuery=""
                  user={user}
                  isUploadModalOpen={isUploadModalOpen}
                  setIsUploadModalOpen={setIsUploadModalOpen}
                  isPermissionModalOpen={isPermissionModalOpen}
                  setIsPermissionModalOpen={setIsPermissionModalOpen}
                  permissionResource={permissionResource}
                  setPermissionResource={setPermissionResource}
                  onFolderSelect={handleFolderSelect}
                  onBackNavigation={handleBackNavigation}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;
