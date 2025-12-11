import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LogoUploadProps {
  currentLogoUrl?: string;
  onLogoChange: (url: string) => void;
}

export const LogoUpload = ({ currentLogoUrl, onLogoChange }: LogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, SVG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("brand-assets")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(fileName);

      onLogoChange(publicUrl);
      toast({ title: "Logo uploaded successfully!" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
      setPreview(currentLogoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setPreview(null);
    onLogoChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground mb-2 block">
        Logo Image
      </label>
      
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="Logo preview"
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <Image className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Upload controls */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload Logo"}
          </Button>

          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveLogo}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            PNG, JPG, or SVG. Max 2MB. Recommended: 200x50px
          </p>
        </div>
      </div>
    </div>
  );
};
