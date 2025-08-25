
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, User, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { secureStorage } from '@/lib/SecureStorage';
import { sanitizeFileUpload } from '@/lib/sanitization';

export function ProfileUpload() {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const profile = await secureStorage.getItem('profile-image');
      const logo = await secureStorage.getItem('company-logo');
      setProfileImage(profile);
      setCompanyLogo(logo);
    };
    loadImages();
  }, []);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'profile' | 'logo'
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file using security sanitization
      const validation = sanitizeFileUpload(file);
      if (!validation.isValid) {
        toast({
          title: "Invalid file",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (type === 'profile') {
          setProfileImage(imageUrl);
          secureStorage.setItem('profile-image', imageUrl);
          toast({
            title: "Profile image uploaded",
            description: "Your profile image has been saved securely",
          });
        } else {
          setCompanyLogo(imageUrl);
          secureStorage.setItem('company-logo', imageUrl);
          toast({
            title: "Company logo uploaded",
            description: "Your company logo has been saved securely",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: 'profile' | 'logo') => {
    if (type === 'profile') {
      setProfileImage(null);
      secureStorage.removeItem('profile-image');
      toast({ title: "Profile image removed" });
    } else {
      setCompanyLogo(null);
      secureStorage.removeItem('company-logo');
      toast({ title: "Company logo removed" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Image */}
        <div>
          <Label className="text-sm font-medium">Profile Image</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative">
              {profileImage ? (
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                  />
                  <button
                    onClick={() => removeImage('profile')}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 w-5 h-5 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'profile')}
                className="hidden"
                id="profile-upload"
              />
              <label htmlFor="profile-upload">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Profile
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>

        {/* Company Logo */}
        <div>
          <Label className="text-sm font-medium">Company Logo</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative">
              {companyLogo ? (
                <div className="relative">
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="w-16 h-16 rounded-md object-contain border-2 border-border bg-surface p-1"
                  />
                  <button
                    onClick={() => removeImage('logo')}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 w-5 h-5 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-md bg-muted border-2 border-border flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logo')}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </span>
                </Button>
              </label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Logo will appear on invoices and other documents
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
