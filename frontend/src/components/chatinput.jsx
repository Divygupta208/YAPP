import React, { useState } from "react";
import { FiPaperclip } from "react-icons/fi";

function ChatInput({ message, setMessage, handleSendMessage }) {
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Selected ${type} file:`, file);
      setAttachment(file); // Set the selected file as attachment

      // If the selected file is an image, create a preview URL
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null); // Reset preview if not an image
      }
    }
    setShowAttachmentOptions(false); // Hide options after file selection
  };

  const onSend = () => {
    handleSendMessage(attachment); // Pass attachment to handleSendMessage
    setAttachment(null); // Reset attachment after sending
    setPreview(null); // Reset preview after sending
  };

  return (
    <div className="relative flex flex-col space-y-2">
      {/* Attachment Options */}
      {showAttachmentOptions && (
        <div className="absolute bottom-full mb-2 right-0 bg-white shadow-lg rounded-lg p-2 z-10">
          <div>
            <label
              htmlFor="imageInput"
              className="flex items-center cursor-pointer space-x-2 p-2 hover:bg-gray-200 rounded"
            >
              <span>📷 Image</span>
              <input
                type="file"
                id="imageInput"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "image")}
              />
            </label>
          </div>
          <div>
            <label
              htmlFor="pdfInput"
              className="flex items-center cursor-pointer space-x-2 p-2 hover:bg-gray-200 rounded"
            >
              <span>📄 PDF</span>
              <input
                type="file"
                id="pdfInput"
                className="hidden"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, "pdf")}
              />
            </label>
          </div>
          <div>
            <label
              htmlFor="docInput"
              className="flex items-center cursor-pointer space-x-2 p-2 hover:bg-gray-200 rounded"
            >
              <span>📝 Document</span>
              <input
                type="file"
                id="docInput"
                className="hidden"
                accept=".doc,.docx,.txt,.pdf"
                onChange={(e) => handleFileChange(e, "document")}
              />
            </label>
          </div>
        </div>
      )}

      {/* Selected Attachment Display and Image Preview */}
      {attachment && (
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <span>Selected attachment:</span>
          <strong>{attachment.name}</strong>
        </div>
      )}
      {preview && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            className="h-20 w-20 object-cover rounded"
          />
        </div>
      )}

      {/* Message Input and Send Button */}
      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-grow border border-gray-300 rounded-lg p-2"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
        >
          <FiPaperclip size={24} className="text-gray-500" />
        </button>
        <button
          type="button"
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          onClick={onSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
