import React, { useState } from "react";
import Tree from "react-d3-tree";
import { toJpeg, toPng } from "html-to-image";

import {
  FaDownload,
  FaEdit,
  FaPlusCircle,
  FaPlusSquare,
  FaTrash,
} from "react-icons/fa";
import "./App.css";

const defaultTreeData = [
  {
    name: "Root",
    children: [],
  },
];

function App() {
  const [treeData, setTreeData] = useState(defaultTreeData);
  const [nodeName, setNodeName] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [newNodeName, setNewNodeName] = useState("");

  // Function to add a node
  const addNode = (type) => {
    if (!selectedNode) return alert("Select a node first!");
    const newTree = JSON.parse(JSON.stringify(treeData));
    const findAndAddNode = (node) => {
      if (node.name === selectedNode.name) {
        const newNode = { name: nodeName };
        if (type === "child") {
          node.children = [...(node.children || []), newNode];
        } else if (type === "parent") {
          const parentNode = { name: nodeName, children: [node] };
          return parentNode;
        }
      }
      if (node.children) {
        node.children = node.children.map(findAndAddNode);
      }
      return node;
    };
    const updatedTree = newTree.map(findAndAddNode);
    setTreeData(type === "parent" ? updatedTree : newTree);
    setNodeName("");
  };

  // Function to handle node click and selection
  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData);
  };

  // Function to enable editing of a node
  const handleEditNode = () => {
    if (!selectedNode) return alert("Select a node to edit!");
    setEditingNode(selectedNode);
    setNewNodeName(selectedNode.name);
  };

  // Function to save the edited node name
  const saveNodeName = () => {
    if (!newNodeName.trim()) return alert("Node name cannot be empty!");

    const newTree = JSON.parse(JSON.stringify(treeData));

    const findAndUpdateNode = (node) => {
      if (node.name === editingNode.name) {
        node.name = newNodeName;
      }
      if (node.children) {
        node.children = node.children.map(findAndUpdateNode);
      }
      return node;
    };

    setTreeData(newTree.map(findAndUpdateNode));
    setEditingNode(null);
    setNewNodeName("");
  };

  // Function to delete the selected node
  const deleteNode = () => {
    if (!selectedNode) return alert("Select a node to delete!");

    const newTree = JSON.parse(JSON.stringify(treeData));

    const findAndDeleteNode = (node, parent = null) => {
      if (node.name === selectedNode.name) {
        if (parent) {
          parent.children = parent.children.filter(
            (child) => child.name !== node.name
          );
        }
        return null; // node deleted
      }

      if (node.children) {
        node.children = node.children
          .map((child) => findAndDeleteNode(child, node))
          .filter(Boolean);
      }

      return node;
    };

    const updatedTree = newTree.map(findAndDeleteNode).filter(Boolean); // Remove nulls from tree
    setTreeData(updatedTree);
    setSelectedNode(null); // Clear selection
  };

  // Function to download the tree as an image (PNG or JPG)
  const downloadTreeAsImage = (format) => {
    const treeElement = document.querySelector(".tree-wrapper");

    const downloadFn = format === "png" ? toPng : toJpeg;

    downloadFn(treeElement)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `tree-structure.${format}`;
        link.click();
      })
      .catch((err) => {
        console.error("Oops, something went wrong!", err);
      });
  };

  const getTreeTranslation = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    return { x: screenWidth / 2, y: screenHeight / 4 };
  };

  return (
    <div className="App">
      <h1 className="title">
        🌳  Hierarchical Tree Formation  🌳
      </h1>

      <div className="controls">
        <input
          type="text"
          className="node-input"
          placeholder="Enter node name"
          value={nodeName}
          onChange={(e) => setNodeName(e.target.value)}
        />
        <button
          className="icon-button add-child"
          onClick={() => addNode("child")}
        >
          <FaPlusCircle /> Add Child Node
        </button>
        <button
          className="icon-button add-parent"
          onClick={() => addNode("parent")}
        >
          <FaPlusSquare /> Add Parent Node
        </button>
        <button className="icon-button edit-node" onClick={handleEditNode}>
          <FaEdit /> Edit Node
        </button>
        <button className="icon-button delete-node" onClick={deleteNode}>
          <FaTrash /> Delete Node
        </button>
        <button
          className="icon-button download-png"
          onClick={() => downloadTreeAsImage("png")}
        >
          <FaDownload /> Download as PNG
        </button>
      </div>

      <div className="tree-wrapper">
        <Tree
          data={treeData}
          orientation="vertical"
          onNodeClick={(node) => handleNodeClick(node.data)}
          translate={getTreeTranslation()} 
          nodeSvgShape={{
            shape: "circle",
            shapeProps: {
              r: 15,
              fill:
                selectedNode && selectedNode.name === editingNode?.name
                  ? "#FFEB3B"
                  : "#4CAF50",
            },
          }}
          styles={{
            links: {
              stroke: "#ccc",
            },
            nodes: {
              node: {
                circle: {
                  fill: "#4CAF50",
                  stroke: "#000",
                  strokeWidth: 2,
                },
              },
              leafNode: {
                circle: {
                  fill: "#FF5722",
                },
              },
            },
          }}
        />
      </div>
      {editingNode && (
        <div className="edit-node-popup">
          <h3>Edit Node: {editingNode.name}</h3>
          <input
            type="text"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            placeholder="Enter new node name"
          />
          <button className="save-button" onClick={saveNodeName}>
            Save
          </button>
        </div>
      )}

      {selectedNode && (
        <div className="selected-node-info">
          <p className="selected-node-name">
            Selected Node: {selectedNode.name}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
