import React, { useState, useEffect, useRef } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import "./Module.css";
import {
  FaTrash,
  FaUpload,
  FaEdit,
  FaDownload,
  FaEllipsisV,
  FaLink,
} from "react-icons/fa";
import LinkModal from "./LinkModal";

const Module = ({ module, setModules, modules, setFeedbackMessage }) => {
  const [resources, setResources] = useState(module.resources);
  const [showOptions, setShowOptions] = useState(false);
  const [showUploadInput, setShowUploadInput] = useState(false);
  const [newTitle, setNewTitle] = useState(module.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const moduleRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moduleRef.current && !moduleRef.current.contains(event.target)) {
        setShowOptions(false);
        setShowUploadInput(false);
        setActiveButton(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getRandomLightColor = () => {
    const letters = 'BCDEF'; // Using letters B to F to ensure light colors
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  };

  const handleToggleOptions = (button) => {
    if (activeButton !== button) {
      setShowOptions(true);
      setActiveButton(button);
    } else {
      setShowOptions(!showOptions);
      setActiveButton(null);
    }
    setShowUploadInput(false);
  };

  const handleUploadFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newResource = {
        id: `resource-${Date.now()}`,
        title: file.name,
        type: "file",
        file: file,
        color: getRandomLightColor(),
      };
      setResources([...resources, newResource]);
      setFeedbackMessage("File uploaded");
      setTimeout(() => {
        setFeedbackMessage("");
        setShowUploadInput(false);
        setShowOptions(false);
        setActiveButton(null);
      }, 200);
    }
  };

  const handleDeleteModule = () => {
    setModules(modules.filter((mod) => mod.id !== module.id));
    setFeedbackMessage("Module deleted");
    setTimeout(() => {
      setFeedbackMessage("");
      setShowOptions(false);
      setActiveButton(null);
    }, 3000);
  };

  const handleRenameModule = () => {
    const updatedModules = modules.map((mod) =>
      mod.id === module.id ? { ...mod, title: newTitle } : mod
    );
    setModules(updatedModules);
    setIsEditingTitle(false);
    setFeedbackMessage("Module renamed");
    setTimeout(() => setFeedbackMessage(""), 3000);
  };

  const handleDeleteResource = (resourceId) => {
    setResources(resources.filter((res) => res.id !== resourceId));
    setFeedbackMessage("Resource deleted");
    setTimeout(() => setFeedbackMessage(""), 3000);
  };

  const handleRenameResource = (resourceId, newTitle) => {
    const updatedResources = resources.map((res) =>
      res.id === resourceId ? { ...res, title: newTitle } : res
    );
    setResources(updatedResources);
    setFeedbackMessage("Resource renamed");
    setTimeout(() => setFeedbackMessage(""), 3000);
  };

  const handleDownloadFile = (file) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    setFeedbackMessage("File downloaded");
    setTimeout(() => setFeedbackMessage(""), 3000);
  };

  const handleAddLink = ({ url, displayName }) => {
    const newResource = {
      id: `resource-${Date.now()}`,
      title: displayName || url,
      type: "link",
      color: getRandomLightColor(),
    };
    setResources([...resources, newResource]);
    setFeedbackMessage("Link added");
    setTimeout(() => {
      setFeedbackMessage("");
      setShowLinkModal(false);
      setShowOptions(false);
      setActiveButton(null);
    }, 200);
  };

  return (
    <div className="module" ref={moduleRef}>
      <button
        style={{ backgroundColor: "black" }}
        onClick={() => handleToggleOptions("ellipsis")}
      >
        <FaEllipsisV />
      </button>
      <div className="module-options">
        {showOptions && (
          <div className="options">
            <button
              style={{ backgroundColor: "#673F69" }}
              onClick={() => {
                handleDeleteModule();
                setShowOptions(false);
              }}
            >
              <FaTrash /> Delete Module
            </button>
            <button
              style={{ backgroundColor: "#987070" }}
              onClick={() => {
                setShowLinkModal(true);
                setShowOptions(false);
                setActiveButton(null);
              }}
            >
              <FaLink /> Add Link
            </button>
            <button
              style={{ backgroundColor: "#AF8F6F" }}
              onClick={() => {
                setShowUploadInput(!showUploadInput);
                setShowOptions(false);
                setActiveButton(null);
              }}
            >
              <FaUpload /> Upload
            </button>
          </div>
        )}
      </div>

      {isEditingTitle ? (
        <div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            onClick={handleRenameModule}
            style={{
              backgroundColor: "black",
              float: "unset",
              padding: "7px",
              fontSize: "16px",
            }}
          >
            <FaEdit /> Save
          </button>
        </div>
      ) : (
        <h2 onClick={() => setIsEditingTitle(true)}>
          {module.title} <FaEdit />
        </h2>
      )}

      {showLinkModal && (
        <LinkModal
          onClose={() => setShowLinkModal(false)}
          onAddLink={handleAddLink}
        />
      )}

      {showUploadInput && <input type="file" onChange={handleUploadFile} />}

      <Droppable droppableId={module.id} type="resource">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {resources.map((resource, index) => (
              <Draggable
                key={resource.id}
                draggableId={resource.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <div
                      className="resource"
                      style={{ backgroundColor: resource.color }}
                    >
                      {resource.type === "file" ? (
                        <span>{resource.title}</span>
                      ) : (
                        <a
                          href={resource.title}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {resource.title}
                        </a>
                      )}
                      <div className="resource-buttons">
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          <FaTrash />
                        </button>
                        {resource.type === "file" && (
                          <button
                            className="download-button"
                            onClick={() => handleDownloadFile(resource.file)}
                          >
                            <FaDownload />
                          </button>
                        )}
                        <button
                          className="rename-button"
                          onClick={() =>
                            handleRenameResource(resource.id, resource.title)
                          }
                        >
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Module;
