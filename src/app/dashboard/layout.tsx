import './theme.css';
import './dashboard.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata = {
  title: 'Patient Dashboard',
  description: 'Hospital patient management dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
