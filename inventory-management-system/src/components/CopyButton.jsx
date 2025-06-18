import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '../utils/toast';

const CopyButton = ({ text, size = 'sm', className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        showToast('Copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy text', 'error');
      });
  };

  return (
    <button
      onClick={handleCopy}
      className={`btn btn-${size} btn-link text-muted p-0 ms-2 ${className}`}
      title="Copy to clipboard"
      style={{ border: 'none' }}
    >
      <FontAwesomeIcon 
        icon={copied ? faCheck : faCopy} 
        className={copied ? 'text-success' : ''}
      />
    </button>
  );
};

export default CopyButton;