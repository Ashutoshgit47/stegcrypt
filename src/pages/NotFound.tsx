import { Home, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
      <div className="relative max-w-md w-full">
        {/* Background Blocks */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#D02020] border-[3px] border-[#121212] dark:border-white shadow-[8px_8px_0px_0px_#121212] dark:shadow-[8px_8px_0px_0px_white] -rotate-12 -z-10" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#1040C0] border-[3px] border-[#121212] dark:border-white shadow-[8px_8px_0px_0px_#121212] dark:shadow-[8px_8px_0px_0px_white] rotate-6 -z-10" />

        <div className="cyber-card text-center p-12 bg-white dark:bg-[#121212] relative">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-[#F0C020] border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_white] mb-8 rotate-3">
            <AlertTriangle className="h-10 w-10 text-[#121212] stroke-[3px]" />
          </div>

          <h1 className="text-7xl font-black uppercase tracking-tighter mb-2 bg-[#121212] text-white dark:bg-white dark:text-[#121212] inline-block px-4 py-2 transform -skew-x-6">
            404
          </h1>

          <p className="text-xl font-black uppercase tracking-wide mt-8 mb-8 opacity-90">
            System Error:<br/>Page Not Found
          </p>

          <Button asChild variant="default" className="w-full h-14 border-[3px] border-[#121212] dark:border-white shadow-[4px_4px_0px_0px_#D02020] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-black uppercase tracking-widest bg-[#1040C0] text-white gap-3">
            <Link to="/">
              <Home className="h-5 w-5 stroke-[3px]" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

