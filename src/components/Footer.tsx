import React from "react";

export const Footer = () => {
  return (
    <footer className="text-center text-muted-foreground py-4">
      Made with ♥️ by phat © {new Date().getFullYear()}
    </footer>
  );
};
