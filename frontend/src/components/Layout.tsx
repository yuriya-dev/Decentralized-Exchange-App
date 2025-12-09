import type { ReactNode } from 'react';
import Navbar from './Navbar';

export const Layout = ({ children }: { children: ReactNode }) => {

  // UPDATE: min-h-[101vh] ditambahkan disini. Ini memaksa scrollbar selalu muncul di seluruh aplikasi, mencegah layout shifting.
  return (
    <div className="min-h-[101vh] flex flex-col bg-light-bg dark:bg-fintech-bg dark:bg-fintech-mesh transition-colors duration-300">
      <Navbar />
      
      <main className="p-4 lg:p-8 flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};