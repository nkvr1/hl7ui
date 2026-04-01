'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Activity,
  Stethoscope,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Patients', href: '/timeline' },
  { icon: Activity, label: 'Timeline', href: '/timeline' },
  { icon: Stethoscope, label: 'Doctors', href: '/timeline' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className={`dash-sidebar ${collapsed ? 'dash-sidebar-collapsed' : ''}`}>
      {/* Logo */}
      <div className="dash-sidebar-logo">
        <div className="dash-logo-icon">
          <Activity className="h-5 w-5" />
        </div>
        {!collapsed && <span className="dash-logo-text">HealthView</span>}
      </div>

      {/* Nav */}
      <nav className="dash-sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={`dash-nav-item ${active ? 'dash-nav-active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="dash-sidebar-footer">
        <button onClick={onToggle} className="dash-nav-item">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
