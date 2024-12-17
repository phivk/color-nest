"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Upload an Image</h1>
      <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md mb-4">
        Choose File
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>
      {image && (
        <div className="w-full max-w-lg flex flex-col items-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Preview:</h2>
          <Image
            src={image}
            alt="Uploaded"
            className="rounded-lg shadow-md w-full h-auto"
            width={500}
            height={500}
          />
        </div>
      )}
    </main>
  );
}
