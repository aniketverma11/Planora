import React from 'react';
import { Box } from '@mui/material';

const HtmlContent = ({ content, maxLines = null }) => {
  // Remove HTML tags for plain text preview if maxLines is set
  const getPlainText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const displayContent = maxLines 
    ? getPlainText(content) 
    : content;

  return (
    <Box
      sx={{
        fontSize: '14px',
        lineHeight: 1.6,
        color: '#172b4d',
        '& p': { 
          margin: '0.75em 0',
          '&:first-of-type': { marginTop: 0 },
          '&:last-of-type': { marginBottom: 0 }
        },
        '& h1': { 
          fontSize: '1.75em', 
          margin: '0.8em 0 0.4em', 
          fontWeight: 600,
          color: '#172b4d',
          borderBottom: '2px solid #e9ecef',
          paddingBottom: '0.3em'
        },
        '& h2': { 
          fontSize: '1.5em', 
          margin: '0.8em 0 0.4em', 
          fontWeight: 600,
          color: '#172b4d'
        },
        '& h3': { 
          fontSize: '1.25em', 
          margin: '0.8em 0 0.4em', 
          fontWeight: 600,
          color: '#172b4d'
        },
        '& ul, & ol': { 
          paddingLeft: '1.8em', 
          margin: '0.75em 0',
          '& li': {
            marginBottom: '0.5em',
            '&:last-child': { marginBottom: 0 }
          }
        },
        '& ul': {
          listStyleType: 'disc',
          '& ul': { listStyleType: 'circle' },
          '& ul ul': { listStyleType: 'square' }
        },
        '& a': { 
          color: '#0052cc', 
          textDecoration: 'underline',
          '&:hover': {
            color: '#0065ff',
            textDecoration: 'underline'
          }
        },
        '& strong, & b': {
          fontWeight: 600,
          color: '#172b4d'
        },
        '& em, & i': {
          fontStyle: 'italic'
        },
        '& u': {
          textDecoration: 'underline'
        },
        '& code': {
          bgcolor: '#f4f5f7',
          color: '#c7254e',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '0.9em',
          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
          border: '1px solid #e1e4e8'
        },
        '& pre': {
          bgcolor: '#f6f8fa',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          border: '1px solid #e1e4e8',
          margin: '1em 0',
          '& code': {
            bgcolor: 'transparent',
            padding: 0,
            border: 'none',
            color: '#24292e',
            fontSize: '13px'
          }
        },
        '& blockquote': {
          borderLeft: '4px solid #dfe2e5',
          margin: '1em 0',
          padding: '0.5em 1em',
          color: '#6a737d',
          bgcolor: '#f6f8fa'
        },
        '& hr': {
          border: 'none',
          borderTop: '1px solid #e1e4e8',
          margin: '1.5em 0'
        },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          margin: '1em 0',
          '& th, & td': {
            border: '1px solid #dfe2e5',
            padding: '8px 12px',
            textAlign: 'left'
          },
          '& th': {
            bgcolor: '#f6f8fa',
            fontWeight: 600
          }
        },
        ...(maxLines && {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
        })
      }}
      dangerouslySetInnerHTML={{ __html: displayContent }}
    />
  );
};

export default HtmlContent;
