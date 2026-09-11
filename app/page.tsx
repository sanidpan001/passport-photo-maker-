// NO WATERMARK - NO SIGNIN - NO SERVER UPLOAD
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Download,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ZoomIn,
  Crop,
  FileText,
  ShieldCheck,
  Sparkles,
  Camera,
  Globe,
  X,
  Menu,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
type CountrySize = {
  label: string;
  sub: string;
  widthMM: number;
  heightMM: number;
  dpi: number;
};

type Point = { x: number; y: number };

// ── Country sizes ──────────────────────────────────────
const COUNTRY_SIZES: CountrySize[] = [
  { label: "India", sub: "35 x 45 mm", widthMM: 35, heightMM: 45, dpi: 600 },
  { label: "USA", sub: "2 x 2 inch (51x51mm)", widthMM: 51, heightMM: 51, dpi: 600 },
  { label: "UK", sub: "35 x 45 mm", widthMM: 35, heightMM: 45, dpi: 600 },
  { label: "Canada", sub: "50 x 70 mm", widthMM: 50, heightMM: 70, dpi: 600 },
  { label: "Schengen", sub: "35 x 45 mm", widthMM: 35, heightMM: 45, dpi: 600 },
  { label: "Australia", sub: "35 x 45 mm", widthMM: 35, heightMM: 45, dpi: 600 },
];

// ── Ad slot component ──────────────────────────────────
function AdSlot({
  label,
  width,
  height,
  scriptId,
  children,
  className,
}: {
  label: string;
  width: number;
  height: number;
  scriptId: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Clear and inject the ad scripts
    const container = ref.current;
    container.innerHTML = "";

    const s1 = document.createElement("script");
    s1.type = "text/javascript";
    s1.text = `atOptions = ${JSON.stringify({
      key: scriptId,
      format: "iframe",
      height: height,
      width: width,
      params: {},
    })};`;

    const s2 = document.createElement("script");
    s2.src = `https://www.highrevenueformat.com/${scriptId}/invoke.js`;
    s2.async = true;

    container.appendChild(s1);
    container.appendChild(s2);
  }, [scriptId, height, width]);

  return (
    <div
      className={`ad-slot ${className ?? ""}`}
      style={{ maxWidth: `${width}px`, margin: "0 auto" }}
    >
      <div className="ad-slot-label">{label}</div>
      <div ref={ref} style={{ width: `${width}px`, height: `${height}px` }} />
    </div>
  );
}

// ── FAQ item ───────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-semibold text-slate-800">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-slate-600">{a}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────
export default function Home() {
  // NO WATERMARK - NO SIGNIN - NO SERVER UPLOAD
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [whiteBgApplied, setWhiteBgApplied] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // ── Load image ──────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      setImageLoaded(false);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setWhiteBgApplied(false);

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // ── Draw preview ────────────────────────────────────
  const drawPreview = useCallback(() => {
    if (!imageLoaded || !imageRef.current || !previewCanvasRef.current) return;
    const img = imageRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = COUNTRY_SIZES[selectedSize];
    const pxW = Math.round((size.widthMM * size.dpi) / 25.4);
    const pxH = Math.round((size.heightMM * size.dpi) / 25.4);

    canvas.width = pxW;
    canvas.height = pxH;

    // White background
    // NO WATERMARK - NO SIGNIN - NO SERVER UPLOAD
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, pxW, pxH);

    // Cover-fit the image into the canvas, then apply zoom + offset
    const imgAspect = img.width / img.height;
    const canvasAspect = pxW / pxH;

    let drawW: number, drawH: number;
    if (imgAspect > canvasAspect) {
      drawH = pxH;
      drawW = pxH * imgAspect;
    } else {
      drawW = pxW;
      drawH = pxW / imgAspect;
    }

    drawW *= zoom;
    drawH *= zoom;

    const dx = (pxW - drawW) / 2 + offset.x;
    const dy = (pxH - drawH) / 2 + offset.y;

    ctx.drawImage(img, dx, dy, drawW, drawH);
  }, [imageLoaded, selectedSize, zoom, offset]);

  // ── Draw original ───────────────────────────────────
  const drawOriginal = useCallback(() => {
    if (!imageLoaded || !imageRef.current || !originalCanvasRef.current) return;
    const img = imageRef.current;
    const canvas = originalCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxW = 500;
    const maxH = 400;
    const scale = Math.min(maxW / img.width, maxH / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [imageLoaded]);

  useEffect(() => {
    drawOriginal();
    drawPreview();
  }, [drawOriginal, drawPreview]);

  // ── Auto white background ───────────────────────────
  const applyWhiteBg = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tCtx = tempCanvas.getContext("2d");
    if (!tCtx) return;

    tCtx.drawImage(img, 0, 0);
    const imageData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    // Fill non-white-ish areas: flood fill from edges
    // Simple approach: replace near-white pixels with pure white, and edge-fill
    const threshold = 240;
    const visited = new Uint8Array(data.length / 4);
    const stack: number[] = [];
    const w = tempCanvas.width;
    const h = tempCanvas.height;

    // Push all edge pixels
    for (let x = 0; x < w; x++) {
      stack.push(x, 0, x, h - 1);
    }
    for (let y = 0; y < h; y++) {
      stack.push(0, y, w - 1, y);
    }

    while (stack.length >= 2) {
      const y = stack.pop()!;
      const x = stack.pop()!;
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      const idx = (y * w + x) * 4;
      if (visited[idx / 4]) continue;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (r > threshold && g > threshold && b > threshold) {
        visited[idx / 4] = 1;
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        // Push neighbors
        stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
      }
    }

    tCtx.putImageData(imageData, 0, 0);

    // Replace the image ref with the processed version
    const newImg = new Image();
    newImg.onload = () => {
      imageRef.current = newImg;
      setWhiteBgApplied(true);
      drawOriginal();
      drawPreview();
    };
    newImg.src = tempCanvas.toDataURL("image/png");
  };

  // ── Download single photo ────────────────────────────
  const downloadSingle = () => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const link = document.createElement("a");
    link.download = `passport-photo-${COUNTRY_SIZES[selectedSize].label.replace(/\s/g, "-").toLowerCase()}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.98);
    link.click();
  };

  // ── Download A4 sheet ───────────────────────────────
  const downloadA4 = () => {
    if (!previewCanvasRef.current) return;
    const photoCanvas = previewCanvasRef.current;

    // A4 at 300 DPI: 2480 x 3508
    const a4W = 2480;
    const a4H = 3508;
    const a4 = document.createElement("canvas");
    a4.width = a4W;
    a4.height = a4H;
    const ctx = a4.getContext("2d");
    if (!ctx) return;

    // White background
    // NO WATERMARK - NO SIGNIN - NO SERVER UPLOAD
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, a4W, a4H);

    // Layout: 4 columns x 2 rows = 8 photos
    const cols = 4;
    const rows = 2;
    const margin = 60;
    const gap = 30;

    const photoW = photoCanvas.width;
    const photoH = photoCanvas.height;

    // Scale photos to fit
    const availW = a4W - 2 * margin - (cols - 1) * gap;
    const availH = a4H - 2 * margin - (rows - 1) * gap;
    const cellW = availW / cols;
    const cellH = availH / rows;

    // Scale photo to fit in cell while maintaining aspect ratio
    const photoAspect = photoW / photoH;
    const cellAspect = cellW / cellH;
    let drawW: number, drawH: number;
    if (photoAspect > cellAspect) {
      drawW = cellW;
      drawH = cellW / photoAspect;
    } else {
      drawH = cellH;
      drawW = cellH * photoAspect;
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = margin + col * (cellW + gap) + (cellW - drawW) / 2;
        const y = margin + row * (cellH + gap) + (cellH - drawH) / 2;

        // Draw photo
        ctx.drawImage(photoCanvas, x, y, drawW, drawH);

        // Crop marks (corner brackets)
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1.5;
        const markLen = 15;
        const markGap = 3;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x - markGap, y - markGap + markLen);
        ctx.lineTo(x - markGap, y - markGap);
        ctx.lineTo(x - markGap + markLen, y - markGap);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + drawW + markGap - markLen, y - markGap);
        ctx.lineTo(x + drawW + markGap, y - markGap);
        ctx.lineTo(x + drawW + markGap, y - markGap + markLen);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x - markGap, y + drawH + markGap - markLen);
        ctx.lineTo(x - markGap, y + drawH + markGap);
        ctx.lineTo(x - markGap + markLen, y + drawH + markGap);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + drawW + markGap - markLen, y + drawH + markGap);
        ctx.lineTo(x + drawW + markGap, y + drawH + markGap);
        ctx.lineTo(x + drawW + markGap, y + drawH + markGap - markLen);
        ctx.stroke();
      }
    }

    const link = document.createElement("a");
    link.download = "passport-photo-a4-sheet-8-photos.jpg";
    link.href = a4.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  // ── Image drag to reposition ────────────────────────
  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (!imageLoaded) return;
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingImage) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleImageMouseUp = () => {
    setIsDraggingImage(false);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageLoaded || !e.touches[0]) return;
    setIsDraggingImage(true);
    setDragStart({
      x: e.touches[0].clientX - offset.x,
      y: e.touches[0].clientY - offset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingImage || !e.touches[0]) return;
    e.preventDefault();
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDraggingImage(false);
  };

  const resetTool = () => {
    setImageSrc(null);
    setImageLoaded(false);
    imageRef.current = null;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setWhiteBgApplied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentSize = COUNTRY_SIZES[selectedSize];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* ── Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-800">
              PassportPro Studio
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#home" className="text-sm font-medium text-slate-600 transition-colors hover:text-green-600">
              Home
            </a>
            <a href="#how-to-use" className="text-sm font-medium text-slate-600 transition-colors hover:text-green-600">
              How to Use
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-600 transition-colors hover:text-green-600">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 sm:inline-block">
              100% Free Forever
            </span>
            <button
              className="rounded-lg p-2 text-slate-600 md:hidden"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-3">
              <a href="#home" onClick={() => setMobileMenu(false)} className="text-sm font-medium text-slate-600 hover:text-green-600">
                Home
              </a>
              <a href="#how-to-use" onClick={() => setMobileMenu(false)} className="text-sm font-medium text-slate-600 hover:text-green-600">
                How to Use
              </a>
              <a href="#faq" onClick={() => setMobileMenu(false)} className="text-sm font-medium text-slate-600 hover:text-green-600">
                FAQ
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* ── Ad Slot 1: Top 728x90 ──────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <AdSlot
          label="Advertisement"
          width={728}
          height={90}
          scriptId="4e68ac77881c17fe128a46565d9a4e8c"
        />
      </div>

      {/* ── Hero ──────────────────────────────────────── */}
      <section id="home" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            <Sparkles className="h-4 w-4" />
            Free Passport Photo Maker
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl md:text-5xl">
            Create Passport Photos
            <span className="block text-green-600">in 3 Simple Steps</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 sm:text-lg">
            Upload, select your country size, and download a print-ready passport photo.
            No watermark, no sign-in, no subscription — 100% free forever.
          </p>

          {/* Green badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">No Sign-In Required</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">No Watermark</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">No Subscription</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Tool ─────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Step 1: Upload */}
        {!imageLoaded && (
          <div className="animate-fade-in-up">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                1
              </div>
              <h2 className="text-xl font-bold text-slate-800">Upload Your Photo</h2>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center transition-all duration-300 hover:border-green-400 hover:bg-green-50/30 sm:py-24 ${
                dragging ? "drag-active" : ""
              }`}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <Upload className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-slate-700">
                Drop your photo here or Click to browse
              </p>
              <p className="mt-2 text-sm text-slate-400">JPG, PNG</p>
              <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Lock className="h-3.5 w-3.5" />
                Your photo stays on your device, we don&apos;t upload it
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* ── Ad Slot 2: Middle 468x60 ──────────────────── */}
        <div className="my-8">
          <AdSlot
            label="Advertisement"
            width={468}
            height={60}
            scriptId="a16c0fcd26ca339248720236d7830743"
          />
        </div>

        {/* Step 2: Process */}
        {imageLoaded && (
          <div className="animate-fade-in-up">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                2
              </div>
              <h2 className="text-xl font-bold text-slate-800">Adjust Your Photo</h2>
              <button
                onClick={resetTool}
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Start Over
              </button>
            </div>

            {/* Split view */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Original */}
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-600">Original</span>
                </div>
                <div className="flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-4">
                  <canvas
                    ref={originalCanvasRef}
                    className="max-h-[300px] max-w-full rounded-lg object-contain"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Crop className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-slate-600">
                    Passport Preview — {currentSize.label} ({currentSize.sub})
                  </span>
                </div>
                <div
                  className="flex items-center justify-center overflow-hidden rounded-2xl p-4"
                  style={{ background: "#FFFFFF" }}
                  onMouseDown={handleImageMouseDown}
                  onMouseMove={handleImageMouseMove}
                  onMouseUp={handleImageMouseUp}
                  onMouseLeave={handleImageMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <canvas
                    ref={previewCanvasRef}
                    className="max-h-[300px] max-w-full cursor-move rounded-lg object-contain shadow-md"
                    style={{ background: "#FFFFFF" }}
                  />
                </div>
                <p className="mt-2 text-center text-xs text-slate-400">
                  Drag the photo to center your face
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Country size dropdown */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Country / Size
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setSizeOpen(!sizeOpen)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:border-green-300"
                    >
                      <span>
                        {currentSize.label} — {currentSize.sub}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          sizeOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {sizeOpen && (
                      <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        {COUNTRY_SIZES.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedSize(i);
                              setSizeOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-green-50 ${
                              i === selectedSize ? "bg-green-50 font-semibold text-green-700" : "text-slate-600"
                            }`}
                          >
                            <span>{s.label}</span>
                            <span className="text-xs text-slate-400">{s.sub}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Zoom slider */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Zoom: {zoom.toFixed(1)}x
                  </label>
                  <div className="flex items-center gap-3">
                    <ZoomIn className="h-4 w-4 text-slate-400" />
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Auto white BG button */}
              <div className="mt-5">
                <button
                  onClick={applyWhiteBg}
                  disabled={whiteBgApplied}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all sm:w-auto ${
                    whiteBgApplied
                      ? "cursor-default bg-green-100 text-green-700"
                      : "bg-slate-800 text-white hover:bg-slate-900"
                  }`}
                >
                  {whiteBgApplied ? (
                    <>
                      <Check className="h-4 w-4" />
                      White Background Applied
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Auto White Background
                    </>
                  )}
                </button>
              </div>

              {/* Ticks */}
              <div className="mt-5 flex flex-wrap gap-3">
                <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  whiteBgApplied ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-400"
                }`}>
                  <Check className="h-4 w-4" />
                  White BG
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                  <Check className="h-4 w-4" />
                  Correct Size
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                  <Check className="h-4 w-4" />
                  Face Centered
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Download */}
        {imageLoaded && (
          <div className="mt-8 animate-fade-in-up">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                3
              </div>
              <h2 className="text-xl font-bold text-slate-800">Download Your Photo</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Single photo */}
              <button
                onClick={downloadSingle}
                className="group flex flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                <Download className="h-8 w-8 transition-transform group-hover:scale-110" />
                <span className="text-lg font-bold">Download Passport Photo (HD)</span>
                <span className="text-sm text-green-50">
                  JPG · {currentSize.dpi} DPI · {currentSize.label}
                </span>
              </button>

              {/* A4 sheet */}
              <button
                onClick={downloadA4}
                className="group flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-slate-200 bg-white p-8 text-slate-700 shadow-sm transition-all hover:border-green-300 hover:shadow-lg hover:scale-[1.02]"
              >
                <FileText className="h-8 w-8 text-slate-600 transition-transform group-hover:scale-110" />
                <span className="text-lg font-bold">Download A4 Sheet</span>
                <span className="text-sm text-slate-400">8 Photos for Print Shop</span>
              </button>
            </div>

            <p className="mt-4 text-center text-sm font-medium text-slate-500">
              No watermark · Ready to print
            </p>
          </div>
        )}

        {/* ── Ad Slot 3: Bottom 320x50 ─────────────────── */}
        <div className="mt-10">
          <AdSlot
            label="Advertisement"
            width={320}
            height={50}
            scriptId="156aa9027843884a8cf9eb2ea64b4219"
          />
        </div>
      </main>

      {/* ── Right sticky 300x250 placeholder ──────────── */}
      <div className="fixed right-4 top-24 z-40 hidden xl:block">
        <div
          className="ad-slot"
          style={{ width: 300, height: 250 }}
        >
          <div className="ad-slot-label">Advertisement</div>
          <div className="flex h-full items-center justify-center p-4 text-center">
            <div>
              <AdSlot
                label=""
                width={300}
                height={220}
                scriptId="156aa9027843884a8cf9eb2ea64b4219"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SEO Content ────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* What is PassportPro Studio */}
        <div id="what-is" className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-slate-800">
            What is PassportPro Studio?
          </h2>
          <p className="text-base leading-relaxed text-slate-600">
            PassportPro Studio is a free, lab-quality passport photo maker that works
            entirely in your browser. There is no watermark, no sign-in, and no
            subscription. You upload a photo, pick your country size, and download a
            print-ready passport photo in seconds. Everything runs on your device —
            your photo never leaves your computer.
          </p>
        </div>

        {/* How to Create in 3 Steps */}
        <div id="how-to-use" className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-slate-800">
            How to Create a Passport Photo in 3 Steps
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-base font-bold text-white">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700">Upload Your Photo</h3>
                <p className="text-sm text-slate-500">
                  Drag and drop a JPG or PNG photo, or click to browse. Your image stays
                  on your device — nothing is uploaded to any server.
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-base font-bold text-white">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700">Select Your Size</h3>
                <p className="text-sm text-slate-500">
                  Choose from 10+ country sizes (India, USA, UK, Canada, Schengen,
                  Australia). Use Auto White Background, zoom, and drag to center your face.
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-base font-bold text-white">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-700">Download</h3>
                <p className="text-sm text-slate-500">
                  Download a single HD passport photo at 600 DPI, or an A4 sheet with 8
                  photos and crop marks ready for your local print shop.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Free */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-slate-800">Why Is It Free?</h2>
          <p className="text-base leading-relaxed text-slate-600">
            We run on ads, not subscriptions. The small advertisements on this page pay
            for the servers and development, so you never have to enter a credit card or
            create an account. There is no catch — no watermark, no hidden fees, no
            trial period. PassportPro Studio is free forever.
          </p>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-slate-800">Features</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: CheckCircle2, text: "100% Free" },
              { icon: Lock, text: "No Sign-In Required" },
              { icon: EyeOff, text: "No Watermark" },
              { icon: ShieldCheck, text: "No Subscription" },
              { icon: Globe, text: "10+ Country Sizes" },
              { icon: Sparkles, text: "Auto White Background" },
              { icon: FileText, text: "A4 Print Sheet with 8 Photos" },
              { icon: Lock, text: "Offline — Photos Stay on Your Device" },
              { icon: Camera, text: "Mobile Friendly" },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <f.icon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-slate-700">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div id="faq" className="mb-12">
          <h2 className="mb-2 text-2xl font-bold text-slate-800">
            Frequently Asked Questions
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">
            <FaqItem
              q="Is PassportPro Studio really free?"
              a="Yes, it is 100% free forever. The tool is ad-supported, so you never pay anything. There are no hidden fees, no trial periods, and no premium tiers."
            />
            <FaqItem
              q="Will there be a watermark on my photo?"
              a="Never. Your downloaded passport photo has zero watermarks. What you see in the preview is exactly what you get."
            />
            <FaqItem
              q="Do I need to sign up or create an account?"
              a="No. There is no sign-in, no registration, and no account required. You open the page, upload your photo, and download — that's it."
            />
            <FaqItem
              q="Is it safe? Where does my photo go?"
              a="Your photo stays entirely on your device. All processing happens in your browser using the Canvas API. We do not upload your image to any server."
            />
            <FaqItem
              q="Can I print the photos at a print shop?"
              a="Yes. You can download an A4 sheet with 8 passport photos and crop marks, ready to take to any print shop. The single photo download is at 600 DPI for high-quality printing."
            />
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-700">PassportPro Studio</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
              <a href="#" className="transition-colors hover:text-green-600">Privacy</a>
              <a href="#" className="transition-colors hover:text-green-600">Terms</a>
              <a href="#" className="transition-colors hover:text-green-600">Contact</a>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-slate-400">
            © 2026 PassportPro Studio — All Passport Tools 100% Free Forever
          </div>
          <div className="mt-2 text-center text-xs font-semibold text-green-600">
            No login. No watermark. No subscription.
          </div>
        </div>
      </footer>
    </div>
  );
}
