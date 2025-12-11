import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Upload, X, Globe, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FaviconOgUploadProps {
  faviconUrl?: string;
  ogImageUrl?: string;
  onFaviconChange: (url: string) => void;
  onOgImageChange: (url: string) => void;
}

export const FaviconOgUpload = ({ 
  faviconUrl, 
  ogImageUrl, 
  onFaviconChange, 
  onOgImageChange 
}: FaviconOgUploadProps) => {
  const { toast } = useToast();
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);

  const handleUpload = async (file: File, type: 'favicon' | 'og') => {
    const setUploading = type === 'favicon' ? setUploadingFavicon : setUploadingOg;
    const onChange = type === 'favicon' ? onFaviconChange : onOgImageChange;
    const maxSize = type === 'favicon' ? 1 : 5;
    
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please upload an image smaller than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    const validTypes = type === 'favicon' 
      ? ['image/x-icon', 'image/png', 'image/svg+xml', 'image/ico']
      : ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type) && type === 'og') {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast({
        title: `${type === 'favicon' ? 'Favicon' : 'OG Image'} uploaded!`,
        description: "Don't forget to save your brand settings.",
      });
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Favicon Upload */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Favicon</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a favicon (ICO, PNG, or SVG). Recommended size: 32x32 or 64x64 pixels.
        </p>
        
        <div className="flex items-center gap-4">
          {faviconUrl ? (
            <div className="relative">
              <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center">
                <img 
                  src={faviconUrl} 
                  alt="Favicon preview" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={() => onFaviconChange("")}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
              <Image className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1">
            <Input
              type="file"
              accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file, 'favicon');
              }}
              className="hidden"
              id="favicon-upload"
            />
            <label htmlFor="favicon-upload">
              <Button variant="outline" className="gap-2 cursor-pointer" asChild disabled={uploadingFavicon}>
                <span>
                  <Upload className="w-4 h-4" />
                  {uploadingFavicon ? "Uploading..." : "Upload Favicon"}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      {/* OG Image Upload */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Social Sharing Image (Open Graph)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          This image appears when your site is shared on social media. Recommended size: 1200x630 pixels.
        </p>
        
        <div className="flex items-start gap-4">
          {ogImageUrl ? (
            <div className="relative">
              <img 
                src={ogImageUrl} 
                alt="OG Image preview" 
                className="w-48 h-24 object-cover rounded-lg border border-border"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={() => onOgImageChange("")}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="w-48 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
              <Image className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file, 'og');
              }}
              className="hidden"
              id="og-upload"
            />
            <label htmlFor="og-upload">
              <Button variant="outline" className="gap-2 cursor-pointer" asChild disabled={uploadingOg}>
                <span>
                  <Upload className="w-4 h-4" />
                  {uploadingOg ? "Uploading..." : "Upload OG Image"}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaviconOgUpload;
