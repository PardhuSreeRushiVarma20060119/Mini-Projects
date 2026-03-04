import { Link, useLocation } from "wouter";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BookOpenText, X } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [location] = useLocation();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpenText className="text-primary h-6 w-6 mr-2" />
              <span className="font-heading font-bold text-xl">BookSphere</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="py-4">
          <nav className="space-y-1">
            <MobileNavLink 
              href="/browse" 
              active={location === '/browse'} 
              onClick={onClose}
            >
              Browse
            </MobileNavLink>
            
            <MobileNavLink 
              href="/new-releases" 
              active={location === '/new-releases'} 
              onClick={onClose}
            >
              New Releases
            </MobileNavLink>
            
            <MobileNavLink 
              href="/best-sellers" 
              active={location === '/best-sellers'} 
              onClick={onClose}
            >
              Best Sellers
            </MobileNavLink>
            
            <MobileNavLink 
              href="/admin" 
              active={location === '/admin'} 
              onClick={onClose}
            >
              Admin Dashboard
            </MobileNavLink>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface MobileNavLinkProps {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function MobileNavLink({ href, active, onClick, children }: MobileNavLinkProps) {
  return (
    <Link href={href}>
      <a 
        className={`block py-2 px-6 rounded-md hover:bg-gray-100 ${
          active ? 'bg-gray-100 text-primary' : ''
        }`}
        onClick={onClick}
      >
        {children}
      </a>
    </Link>
  );
}
