"use client";

import { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentViewerProps {
  url: string;
  filename: string;
  onClose: () => void;
}

export function DocumentViewer({ url, filename, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);

  // Determine file type
  const isPDF = url.match(/\.pdf$/i) || url.includes('/raw/upload/');
  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                  (!url.includes('/raw/upload/') && url.includes('/image/upload/'));
  
  // For documents that can't be previewed in browser
  const isDownloadOnly = url.match(/\.(doc|docx|xls|xlsx|txt|csv)$/i);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="font-semibold text-lg truncate">{filename}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom controls for images */}
            {isImage && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Download button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            {/* Open in new tab */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            {/* Close button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {isImage && (
            <div className="flex items-center justify-center min-h-full">
              <img
                src={url}
                alt={filename}
                style={{ 
                  width: `${zoom}%`,
                  maxWidth: 'none',
                  height: 'auto'
                }}
                className="rounded shadow-lg"
              />
            </div>
          )}

          {isPDF && (
            <div className="w-full h-full">
              <iframe
                src={`${url}#view=FitH`}
                className="w-full h-full rounded shadow-lg"
                title={filename}
              />
            </div>
          )}

          {isDownloadOnly && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-white rounded-lg p-8 shadow-lg max-w-md">
                <Download className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Preview Not Available</h4>
                <p className="text-gray-600 mb-6">
                  This file type cannot be previewed in the browser. Please download it to view.
                </p>
                <Button
                  onClick={handleDownload}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download {filename}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
