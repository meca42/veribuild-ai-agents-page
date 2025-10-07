import { Outlet, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Image,
  FileStack,
  MessageSquare,
  FileInput,
  Package,
  AlertCircle,
  ClipboardCheck,
  Bot,
  Activity,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type * as API from "@/lib/api/types";

const navigation = [
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Files", href: "/files", icon: FileText },
  { name: "Drawings", href: "/drawings", icon: Image },
  { name: "Documents", href: "/documents", icon: FileStack },
  { name: "RFIs", href: "/rfi", icon: MessageSquare },
  { name: "Submittals", href: "/submittals", icon: FileInput },
  { name: "Materials", href: "/materials", icon: Package },
  { name: "Issues", href: "/issues", icon: AlertCircle },
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Runs", href: "/runs", icon: Activity },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<API.Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    return localStorage.getItem('selectedProjectId');
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, userProfile, organizations, currentOrgId, setCurrentOrgId, logout } = useAuth();

  const currentOrg = organizations.find(o => o.org_id === currentOrgId);
  const userInitials = userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 
                       user?.email?.substring(0, 2).toUpperCase() || 'U';

  const projectContextPages = ['/drawings', '/documents', '/rfi', '/submittals', '/materials', '/issues', '/inspections', '/agents', '/runs'];
  const needsProjectSelector = projectContextPages.some(page => location.pathname.startsWith(page));

  useEffect(() => {
    const loadProjects = async () => {
      if (!currentOrgId) return;
      
      try {
        const response = await api.listProjects(currentOrgId, { pageSize: 100 });
        setProjects(response.data);
        
        if (response.data.length > 0 && !currentProjectId) {
          const firstProjectId = response.data[0].id;
          setCurrentProjectId(firstProjectId);
          localStorage.setItem('selectedProjectId', firstProjectId);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };

    loadProjects();
  }, [currentOrgId]);

  useEffect(() => {
    if (id) {
      setCurrentProjectId(id);
      localStorage.setItem('selectedProjectId', id);
    }
  }, [id]);

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId);
    localStorage.setItem('selectedProjectId', projectId);
    navigate(`/projects/${projectId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-neutral-50">
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white border-r border-neutral-200 transition-all duration-300 hidden lg:flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200">
          {!sidebarCollapsed && (
            <Link to="/projects" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--vb-primary)] rounded-lg flex items-center justify-center text-white font-bold">
                V
              </div>
              <span className="font-semibold text-[var(--vb-neutral-900)]">VeriBuild</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--vb-primary)] text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon size={20} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-neutral-200 flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200">
              <Link to="/projects" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-8 h-8 bg-[var(--vb-primary)] rounded-lg flex items-center justify-center text-white font-bold">
                  V
                </div>
                <span className="font-semibold text-[var(--vb-neutral-900)]">VeriBuild</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-3">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[var(--vb-primary)] text-white"
                            : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-neutral-100 text-neutral-600"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            {organizations.length > 0 && (
              <Select 
                value={currentOrgId || undefined}
                onChange={(e) => setCurrentOrgId(e.target.value)}
                className="w-48 hidden sm:flex"
              >
                {organizations.map((org) => (
                  <option key={org.org_id} value={org.org_id}>
                    {org.org.name}
                  </option>
                ))}
              </Select>
            )}

            {projects.length > 0 && currentProjectId && (id || needsProjectSelector) && (
              <Select 
                value={currentProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-48 hidden sm:flex"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2" aria-label="User menu">
                  <div className="w-8 h-8 bg-[var(--vb-accent)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {userInitials}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {userProfile?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Organization
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
