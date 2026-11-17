import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";

const UploadImageForm = ({
  onUploadSuccess,
}: {
  onUploadSuccess: (url: string) => void;
}) => {
  const BACKEND_URL = process.env.BUN_PUBLIC_BACKEND_URL;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!selectedFile) {
      setMessage("Please choose an image.");
      return;
    }

    setIsUploading(true);

    try {
      const presignResponse = await fetch(`${BACKEND_URL}/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        }),
      });

      if (!presignResponse.ok) throw new Error("Presign failed");

      // const { signedUrl, key, publicUrl } = await presignResponse.json();
      // console.log("publicUrl....", publicUrl);

      const { signedUrl, key } = await presignResponse.json();

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!uploadResponse.ok) throw new Error("Upload to S3 failed");

      onUploadSuccess(URL.createObjectURL(selectedFile));
      setMessage("Upload successful!");
    } catch (error) {
      console.log("error.....", error);
      setMessage("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }
  return (
    <div>
      <Input
        type="file"
        accept="image/*"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSelectedFile(e.target.files?.[0] ?? null)
        }
      />
      <Button disabled={isUploading} onClick={handleUpload}>
        {isUploading ? "Uploading..." : "Upload Image"}
      </Button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadImageForm;
