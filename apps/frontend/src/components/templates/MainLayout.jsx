import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Sidebar } from '@/components/organisms/Navigation/Sidebar';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

/**
 * MainLayout - Primary layout template for the application
 * Provides consistent structure for all pages with header, sidebar, and footer
 */
const MainLayout = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-0">
                <div className="flex h-16 items-center border-b px-4">
                  <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <span className="text-xl font-bold text-primary">Samudra Paket</span>
                  </Link>
                </div>
                <div className="p-4">
                  <Sidebar />
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="text-xl font-bold text-primary">Samudra Paket</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <Sidebar />
        </aside>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} PT. Sarana Mudah Raya (Samudra Paket). All rights reserved.
        </div>
      </footer>
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
