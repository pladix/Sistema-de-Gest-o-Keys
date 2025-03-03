import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container mx-auto">
        <p>
          © {currentYear} PladixCentral. All rights reserved.
        </p>
      </div>
    </footer>
  );
}