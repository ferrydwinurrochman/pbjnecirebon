export interface User {
  id: string;
  username: string;
  name: string;
  role: "admin" | "developer" | "editor" | "user";
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  email?: string;
  phone?: string;
  assignedPages?: string[];
  permissions?: string[];
}

export interface Page {
  id: string;
  title: string;
  type: "powerbi" | "spreadsheet" | "html";
  subType?: string;
  content: string;
  embedUrl?: string;
  htmlContent?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignedUsers?: string[];
  permissions?: string[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
}

// Mock data storage
const users: User[] = [
  {
    id: "1",
    username: "admin",
    name: "System Administrator",
    role: "admin",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
    email: "admin@jne.co.id",
    phone: "+62-21-1234567",
    permissions: ["*"],
  },
  {
    id: "2",
    username: "developer",
    name: "Lead Developer",
    role: "developer",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
    email: "dev@jne.co.id",
    phone: "+62-21-1234568",
    permissions: ["users.view", "users.create", "users.edit", "pages.*", "system.edit"],
  },
  {
    id: "3",
    username: "editor",
    name: "Content Editor",
    role: "editor",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
    email: "editor@jne.co.id",
    phone: "+62-21-1234569",
    permissions: ["pages.view", "pages.edit"], },
  {
    id: "4",
    username: "user1",
    name: "John Doe",
    role: "user",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    lastLogin: new Date(),
    email: "john.doe@jne.co.id",
    phone: "+62-21-1234570",
    assignedPages: ["1", "2"],
  },
  {
    id: "5",
    username: "user2",
    name: "Jane Smith",
    role: "user",
    isActive: true,
    createdAt: new Date("2024-01-20"),
    lastLogin: new Date(),
    email: "jane.smith@jne.co.id",
    phone: "+62-21-1234571",
    assignedPages: ["1", "3"],
  },
  {
    id: "6",
    username: "user3",
    name: "Bob Wilson",
    role: "user",
    isActive: false,
    createdAt: new Date("2024-02-01"),
    email: "bob.wilson@jne.co.id",
    phone: "+62-21-1234572",
    assignedPages: ["2"],
  },
]

const pages: Page[] = [
 {
    id: "1",
    title: "Sales Dashboard",
    type: "powerbi",
    subType: "analytics",
    content: "Comprehensive sales analytics and performance metrics for JNE shipment services",
    embedUrl: "https://app.powerbi.com/embed/sample-sales-dashboard",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "1",
    assignedUsers: ["4", "5"],
  },
  {
    id: "2",
    title: "Shipment Tracking",
    type: "spreadsheet",
    subType: "operational",
    content: "Real-time shipment tracking and logistics management system",
    embedUrl: "https://docs.google.com/spreadsheets/d/sample-tracking-sheet",
    isActive: true,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-20"),
    createdBy: "1",
    assignedUsers: ["4", "6"],
  },
  {
    id: "3",
    title: "Customer Portal",
    type: "html",
    subType: "customer-facing",
    content: "Customer service portal with shipment information and support tools",
    htmlContent: `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #e31e24;">JNE Customer Portal</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Track Your Shipment</h3>
          <input type="text" placeholder="Enter tracking number" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
          <button style="background: #e31e24; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Track Now</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4>Express Delivery</h4>
            <p>Same day delivery for urgent packages</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4>Regular Service</h4>
            <p>Standard delivery within 2-3 business days</p>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4>Economy</h4>
            <p>Cost-effective solution for non-urgent items</p>
          </div>
        </div>
      </div>
    `,
    isActive: true,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-25"),
    createdBy: "2",
    assignedUsers: ["5"],
  },
]
        

let activityLogs: ActivityLog[] = [];

export function authenticate(username: string, password: string): User | null {
  const defaultCredentials = getDefaultCredentials();
  for (const [role, creds] of Object.entries(defaultCredentials)) {
    if (creds.username === username && creds.password === password) {
      const user = users.find((u) => u.username === username);
      if (user && user.isActive) {
        user.lastLogin = new Date();
        addActivityLog(user.id, "user_login", `${user.name} logged in`, "192.168.1.100");
        return user;
      }
    }
  }
  return null;
}

export function getDefaultCredentials() {
  return {
    admin: { username: "admin", password: "admin123" },
    developer: { username: "developer", password: "dev123" },
    editor: { username: "editor", password: "edit123" },
    user: { username: "user1", password: "user123" },
  };
}

export function getAllUsers(): User[] {
  return [...users];
}

export function getUserById(id: string): User | null {
  return users.find((u) => u.id === id) || null;
}

export function createUser(userData: Omit<User, "id" | "createdAt">): boolean {
  try {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    users.push(newUser);
    addActivityLog("system", "user_create", `New user created: ${newUser.name}`);
    return true;
  } catch {
    return false;
  }
}

export function updateUser(id: string, updates: Partial<User>): boolean {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users[index] = { ...users[index], ...updates };
  addActivityLog(id, "user_update", `User updated: ${users[index].name}`);
  return true;
}

export function deleteUser(id: string): boolean {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  const deletedUser = users.splice(index, 1)[0];
  addActivityLog("system", "user_delete", `Deleted user: ${deletedUser.name}`);
  return true;
}

export function getAllPages(): Page[] {
  return [...pages];
}

export function getPageById(id: string): Page | null {
  return pages.find((p) => p.id === id) || null;
}

export function createPage(pageData: Omit<Page, "id" | "createdAt" | "updatedAt">): boolean {
  try {
    const newPage: Page = {
      ...pageData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    pages.push(newPage);
    addActivityLog(pageData.createdBy, "page_create", `Created page: ${newPage.title}`);
    return true;
  } catch {
    return false;
  }
}

export function updatePage(id: string, updates: Partial<Page>): boolean {
  const index = pages.findIndex((p) => p.id === id);
  if (index === -1) return false;
  pages[index] = { ...pages[index], ...updates, updatedAt: new Date() };
  addActivityLog(updates.createdBy || "system", "page_update", `Updated page: ${pages[index].title}`);
  return true;
}

export function deletePage(id: string, userId: string): boolean {
  const index = pages.findIndex((p) => p.id === id);
  if (index === -1) return false;
  const deletedPage = pages.splice(index, 1)[0];
  addActivityLog(userId, "page_delete", `Deleted page: ${deletedPage.title}`);
  return true;
}

export function userHasPermission(user: User, permission: string): boolean {
  if (user.permissions?.includes("*")) return true;
  if (user.permissions?.includes(permission)) return true;

  const parts = permission.split(".");
  for (let i = parts.length - 1; i > 0; i--) {
    const wildcard = parts.slice(0, i).join(".") + ".*";
    if (user.permissions?.includes(wildcard)) return true;
  }
  return false;
}

export function userCanAccessPage(user: User, page: Page): boolean {
  if (user.role === "admin" || user.role === "developer") return true;
  if (user.role === "editor" && userHasPermission(user, "pages.view")) return true;
  return user.role === "user" ? user.assignedPages?.includes(page.id) || false : false;
}

export function addActivityLog(userId: string, action: string, details: string, ipAddress?: string): void {
  activityLogs.unshift({
    id: Date.now().toString(),
    userId,
    action,
    details,
    timestamp: new Date(),
    ipAddress,
  });
  if (activityLogs.length > 1000) activityLogs = activityLogs.slice(0, 1000);
}

export function getActivityLogs(limit = 50): ActivityLog[] {
  return activityLogs.slice(0, limit);
}

export function getDashboardStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.isActive).length,
    totalPages: pages.length,
    activePages: pages.filter((p) => p.isActive).length,
    recentRegistrations: users.filter((u) => u.createdAt > thirtyDaysAgo).length,
    dailyTraffic: Math.floor(Math.random() * 1000) + 500,
    monthlyTraffic: Math.floor(Math.random() * 30000) + 15000,
  };
}

export function updateUserRole(userId: string, newRole: User["role"], updatedBy: string): boolean {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  const oldRole = user.role;
  user.role = newRole;
  switch (newRole) {
    case "admin": user.permissions = ["*"]; break;
    case "developer": user.permissions = ["users.view", "users.create", "users.edit", "pages.*", "system.edit"]; break;
    case "editor": user.permissions = ["pages.view", "pages.edit"]; break;
    default: user.permissions = [];
  }
  addActivityLog(updatedBy, "role_change", `Changed role from ${oldRole} to ${newRole}: ${user.name}`);
  return true;
}

export function assignPageToUser(userId: string, pageId: string, assignedBy: string): boolean {
  const user = users.find((u) => u.id === userId);
  const page = pages.find((p) => p.id === pageId);
  if (!user || !page) return false;
  if (!user.assignedPages) user.assignedPages = [];
  if (!user.assignedPages.includes(pageId)) {
    user.assignedPages.push(pageId);
    addActivityLog(assignedBy, "page_assign", `Assigned page "${page.title}" to ${user.name}`);
  }
  return true;
}

export function removePageFromUser(userId: string, pageId: string, removedBy: string): boolean {
  const user = users.find((u) => u.id === userId);
  const page = pages.find((p) => p.id === pageId);
  if (!user || !page || !user.assignedPages) return false;
  const index = user.assignedPages.indexOf(pageId);
  if (index > -1) {
    user.assignedPages.splice(index, 1);
    addActivityLog(removedBy, "page_unassign", `Removed page "${page.title}" from ${user.name}`);
  }
  return true;
}

export function getPageSubTypes(): string[] {
  const subTypes = new Set<string>();
  for (const page of pages) {
    if (page.subType) {
      subTypes.add(page.subType);
    }
  }
  return Array.from(subTypes);
}
