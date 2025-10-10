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
        '& p': { margin: '0.5em 0' },
        '& h1, & h2, & h3': { margin: '0.5em 0' },
        '& ul, & ol': { paddingLeft: '1.5em', margin: '0.5em 0' },
        '& a': { color: '#1976d2', textDecoration: 'underline' },
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
