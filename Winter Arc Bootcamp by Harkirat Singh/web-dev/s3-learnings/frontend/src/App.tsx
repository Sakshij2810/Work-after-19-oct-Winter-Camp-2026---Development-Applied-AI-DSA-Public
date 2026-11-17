import "./index.css";

import UploadImageForm from "./views/UploadImageForm";
import ImagePreview from "./views/ImagePreview";
import { useState } from "react";

export function App() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <UploadImageForm onUploadSuccess={setPreviewUrl} />
      <ImagePreview previewUrl={previewUrl} />
    </div>
  );
}

export default App;
