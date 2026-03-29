import { FinancialProvider } from "@/context/FinancialContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <FinancialProvider>{children}</FinancialProvider>;
}
