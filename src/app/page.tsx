"use client";
import Image from "next/image";
import { useRef, useState } from "react";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Extract pixel data after drawing the image
            extractPixelData();
          }
        }
      };
    }
  };

  // Function to calculate the Euclidean distance between two colors
  const calculateDistance = (
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number }
  ) => {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  // K-means clustering function
  const kMeans = (colors: { r: number; g: number; b: number }[], k: number) => {
    // 1. Randomly initialize k centroids
    let centroids = [];
    for (let i = 0; i < k; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      centroids.push({ ...randomColor });
    }

    let prevCentroids = Array.from(centroids);
    let clusters: { r: number; g: number; b: number }[][] = Array(k)
      .fill(null)
      .map(() => []); // array of k empty arrays

    let converged = false;

    while (!converged) {
      // 2. Assign each color to the nearest centroid
      clusters = Array(k)
        .fill(null)
        .map(() => []); // Reset clusters
      for (const color of colors) {
        let closestCentroidIndex = 0;
        let minDistance = Infinity;
        for (let i = 0; i < k; i++) {
          const dist = calculateDistance(color, centroids[i]);
          if (dist < minDistance) {
            minDistance = dist;
            closestCentroidIndex = i;
          }
        }
        clusters[closestCentroidIndex].push(color);
      }

      // 3. Recalculate centroids
      centroids = clusters.map((cluster) => {
        // TODO consider returning random color if cluster is empty
        if (cluster.length === 0) return { r: 0, g: 0, b: 0 }; // Avoid empty clusters
        let sumR = 0,
          sumG = 0,
          sumB = 0;
        for (const color of cluster) {
          sumR += color.r;
          sumG += color.g;
          sumB += color.b;
        }
        const count = cluster.length;
        return {
          r: Math.round(sumR / count),
          g: Math.round(sumG / count),
          b: Math.round(sumB / count),
        };
      });

      // 4. Check for convergence (if centroids have stopped changing)
      converged = true;
      for (let i = 0; i < k; i++) {
        if (
          centroids[i].r !== prevCentroids[i].r ||
          centroids[i].g !== prevCentroids[i].g ||
          centroids[i].b !== prevCentroids[i].b
        ) {
          converged = false;
          break;
        }
      }

      prevCentroids = Array.from(centroids);
    }

    return centroids; // Return the k dominant colors (centroids)
  };

  const extractPixelData = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Get all pixel data from the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        const colors: { r: number; g: number; b: number }[] = [];

        // Loop through the pixel data and store RGB values
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i]; // Red
          const g = pixels[i + 1]; // Green
          const b = pixels[i + 2]; // Blue
          colors.push({ r, g, b });
        }

        console.log("Extracted Colors:", colors);

        // Use K-means clustering to find the k dominant colors
        const k = 5; // You can change this number to get more or fewer colors
        const dominantColors = kMeans(colors, k);

        console.log("Dominant Colors:", dominantColors);
      }
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
      <canvas ref={canvasRef} className="hidden" />
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
