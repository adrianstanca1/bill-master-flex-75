import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";


const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      
      <div className="flex items-center justify-center">
        <SEO title="404 – Page not found" description="The page you are looking for does not exist." noindex />
        <div className="text-center py-24">
          <h1 className="text-4xl font-bold mb-2">404</h1>
          <p className="text-base text-text-secondary mb-4">Page not found</p>
          <a href="/" className="button-secondary">Go home</a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
