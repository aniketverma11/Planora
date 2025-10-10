import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Alert,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Delete,
  Visibility,
  Close,
  AttachFile,
} from '@mui/icons-material';
import { uploadDocument, deleteDocument } from '../services/api';

const DocumentManager = ({ taskId, documents, onDocumentsChange }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }

        // Validate file type
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
          'application/pdf'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} is not supported. Only images and PDFs are allowed.`);
        }

        return uploadDocument(taskId, file);
      });

      await Promise.all(uploadPromises);
      setUploadProgress(100);
      
      // Refresh documents list
      if (onDocumentsChange) {
        onDocumentsChange();
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocument(taskId, documentId);
      if (onDocumentsChange) {
        onDocumentsChange();
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete document');
    }
  };

  const handlePreview = (document) => {
    setPreviewDocument(document);
    setPreviewOpen(true);
  };

  const getFileIcon = (document) => {
    if (document.is_image) {
      return <Image sx={{ color: '#4caf50' }} />;
    } else if (document.is_pdf) {
      return <PictureAsPdf sx={{ color: '#f44336' }} />;
    }
    return <InsertDriveFile sx={{ color: '#2196f3' }} />;
  };

  const renderPreview = () => {
    if (!previewDocument) return null;

    if (previewDocument.is_image) {
      return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <img
            src={previewDocument.file}
            alt={previewDocument.file_name}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
            }}
          />
        </Box>
      );
    } else if (previewDocument.is_pdf) {
      return (
        <Box sx={{ width: '100%', height: '70vh' }}>
          <iframe
            src={previewDocument.file}
            title={previewDocument.file_name}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </Box>
      );
    }

    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Preview not available for this file type
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      {/* Upload Section */}
      <Box sx={{ mb: 2 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <Button
          variant="outlined"
          startIcon={<CloudUpload />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          fullWidth
          sx={{
            borderColor: '#dfe1e6',
            color: '#172b4d',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#0052cc',
              bgcolor: '#f4f5f7',
            },
          }}
        >
          {uploading ? 'Uploading...' : 'Attach files'}
        </Button>
        
        {uploading && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Supported: Images (JPG, PNG, GIF, WebP, SVG) and PDF. Max 10MB per file.
        </Typography>
      </Box>

      {/* Documents List */}
      {documents && documents.length > 0 && (
        <Paper variant="outlined" sx={{ borderColor: '#dfe1e6' }}>
          <List sx={{ p: 0 }}>
            {documents.map((doc, index) => (
              <ListItem
                key={doc.id}
                sx={{
                  borderBottom: index < documents.length - 1 ? '1px solid #dfe1e6' : 'none',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#f4f5f7',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getFileIcon(doc)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#172b4d' }}>
                      {doc.file_name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                      <Chip
                        label={doc.formatted_size}
                        size="small"
                        sx={{
                          height: '20px',
                          fontSize: '0.7rem',
                          bgcolor: '#e5e7eb',
                          color: '#374151',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </Typography>
                      {doc.uploaded_by_username && (
                        <Typography variant="caption" color="text.secondary">
                          by {doc.uploaded_by_username}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Preview">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handlePreview(doc)}
                      sx={{ mr: 1 }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleDelete(doc.id)}
                      sx={{ color: '#f44336' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {documents && documents.length === 0 && (
        <Box
          sx={{
            border: '2px dashed #dfe1e6',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            bgcolor: '#fafbfc',
          }}
        >
          <AttachFile sx={{ fontSize: 48, color: '#8993a4', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No documents attached yet
          </Typography>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {previewDocument && getFileIcon(previewDocument)}
            <Typography variant="h6">{previewDocument?.file_name}</Typography>
          </Box>
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {renderPreview()}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            href={previewDocument?.file}
            download={previewDocument?.file_name}
            variant="outlined"
          >
            Download
          </Button>
          <Button onClick={() => setPreviewOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManager;
