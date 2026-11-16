"use client";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border/40 py-4 px-5">
      <div className="flex items-center justify-center">
        <p className="text-xs text-muted-foreground/70 text-center">
          &copy; {new Date().getFullYear()} Bagteq Group. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};
