import { cn } from "@/lib/utils";

export function GlassCard({ children, className, title, description, actions }) {
  return (
    <div className={cn("glass-card overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5", className)}>
      {(title || actions) && (
        <div className="px-6 py-5 border-b border-(--glass-border) flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-bold tracking-tight">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
