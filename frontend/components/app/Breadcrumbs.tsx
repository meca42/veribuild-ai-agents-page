import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-[var(--vb-neutral-600)]" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight size={16} className="mx-2" />}
          {item.href ? (
            <Link to={item.href} className="hover:text-[var(--vb-neutral-900)] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--vb-neutral-900)] font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
