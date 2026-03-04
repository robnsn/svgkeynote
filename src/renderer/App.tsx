import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface ConversionStatus {
  svgPath?: string;
  keynoteePath?: string;
  isConverting: boolean;
  error?: string;
  success?: boolean;
}

export function App() {
  const [status, setStatus] = useState<ConversionStatus>({
    isConverting: false
  });
  const dragOverRef = useRef(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverRef.current = true;
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverRef.current = false;
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverRef.current = false;

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.path.endsWith('.svg')) {
      setStatus({
        isConverting: false,
        error: 'Please drop an SVG file'
      });
      return;
    }

    await convertSVGFile(file.path);
  };

  const handleFileSelect = async () => {
    const filePath = await window.electronAPI.openFile();
    if (filePath) {
      await convertSVGFile(filePath);
    }
  };

  const convertSVGFile = async (svgPath: string) => {
    setStatus({
      isConverting: true,
      svgPath
    });

    try {
      const result = await window.electronAPI.convertSVG(svgPath);

      if (result.success) {
        setStatus({
          isConverting: false,
          svgPath,
          keynoteePath: result.outputPath,
          success: true
        });
      } else {
        setStatus({
          isConverting: false,
          error: result.error || 'Conversion failed'
        });
      }
    } catch (error) {
      setStatus({
        isConverting: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const openInFinder = async () => {
    if (status.keynoteePath) {
      await window.electronAPI.openInFinder(status.keynoteePath);
    }
  };

  const reset = () => {
    setStatus({ isConverting: false });
  };

  useEffect(() => {
    // Listen for files dropped on the dock icon
    window.electronAPI.onFileDropped((filePath: string) => {
      convertSVGFile(filePath);
    });
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1>SVG to Keynote</h1>
        <p className="subtitle">Convert SVG diagrams to editable Keynote presentations</p>
      </div>

      {!status.success ? (
        <div className="main">
          <div
            className={`drop-zone ${dragOverRef.current ? 'drag-over' : ''} ${
              status.isConverting ? 'converting' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {status.isConverting ? (
              <div className="converting-indicator">
                <div className="spinner"></div>
                <p>Converting your SVG...</p>
              </div>
            ) : (
              <div className="drop-content">
                <div className="icon">📄</div>
                <h2>Drag & Drop SVG File</h2>
                <p>or click to browse</p>
                <button className="browse-btn" onClick={handleFileSelect}>
                  Select File
                </button>
              </div>
            )}
          </div>

          {status.error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{status.error}</span>
            </div>
          )}

          {status.svgPath && !status.success && (
            <div className="file-info">
              <p>
                <strong>Selected:</strong> {status.svgPath.split('/').pop()}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="success-container">
          <div className="success-icon">✨</div>
          <h2>Conversion Complete!</h2>

          <div className="result-file">
            <div className="file-icon">📊</div>
            <div className="file-details">
              <p className="file-name">{status.keynoteePath?.split('/').pop()}</p>
              <p className="file-path">{status.keynoteePath}</p>
            </div>
          </div>

          <div className="button-group">
            <button className="primary-btn" onClick={openInFinder}>
              Show in Finder
            </button>
            <button className="secondary-btn" onClick={reset}>
              Convert Another
            </button>
          </div>

          <div className="info-box">
            <p>
              🎉 Your file is ready! Open the .pptx in Keynote — all shapes are natively editable.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
