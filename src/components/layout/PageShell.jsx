/**
 * PageShell - Global page composition wrapper
 * Provides consistent layout, centering, and rhythm for all main pages
 * Eliminates "floating" feeling and creates intentional framing
 *
 * Intent:
 * - "focus" (default): dashboards, tables, grids - wider, more breathing space
 * - "content": announcements, news, info pages - narrower, tighter rhythm
 */
export default function PageShell({
  title,
  description,
  actions,
  children,
  intent = "focus"
}) {
  const maxWidth = intent === "content" ? "max-w-4xl" : "max-w-6xl";
  const headerSpacing = intent === "content" ? "mb-8" : "mb-12";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card/10">
      <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {/* Page Header - Identity Block */}
        {(title || description || actions) && (
          <div className={headerSpacing}>
            <div className="flex items-start justify-between gap-4">
              <div>
                {title && (
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-text-secondary">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
