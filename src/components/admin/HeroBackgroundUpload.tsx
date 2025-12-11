import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGameStore } from "@/store/gameStore";
import { Upload, X, Image } from "lucide-react";

const HeroBackgroundUpload = () => {
  const { brand, updateBrand } = useGameStore();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `hero-background-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("brand-assets")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(fileName);

      updateBrand({ heroBackgroundUrl: urlData.publicUrl });

      toast({
        title: "Background uploaded",
        description: "Hero background image has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeBackground = () => {
    updateBrand({ heroBackgroundUrl: "" });
    toast({
      title: "Background removed",
      description: "Hero background has been reset to default",
    });
  };

  return (
    <div className="space-y-4">
      <Label>Hero Background Image</Label>
      
      {brand.heroBackgroundUrl ? (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-border aspect-video">
            <img
              src={brand.heroBackgroundUrl}
              alt="Hero background"
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeBackground}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Upload a background image for your hero section
          </p>
          <Label htmlFor="hero-bg-upload" className="cursor-pointer">
            <Button variant="outline" disabled={uploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Image"}
              </span>
            </Button>
          </Label>
          <Input
            id="hero-bg-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      )}
      
      {brand.heroBackgroundUrl && (
        <div>
          <Label htmlFor="hero-bg-replace" className="cursor-pointer">
            <Button variant="outline" size="sm" disabled={uploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Replace Image"}
              </span>
            </Button>
          </Label>
          <Input
            id="hero-bg-replace"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
};

export default HeroBackgroundUpload;
