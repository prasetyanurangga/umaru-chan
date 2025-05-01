import React, { useState } from "react";

// Definisikan tipe node Tree
export interface TreeNodeData {
    id: string;
    name: string;
    type?: string;
    path?: string;
    children?: TreeNodeData[];
    value?: any;
}
  

interface TreeNodeProps {
  node: Map<any, any>;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const hasChildren = node['children'] && node['children'].length > 0;

  return (
    <div style={{ marginLeft: 16 }}>
      <div
       
        style={{ cursor: hasChildren ? "pointer" : "default" }}
      >
        <span  onClick={() => setExpanded(!expanded)}>{hasChildren && (expanded ? "▼ " : "▶ ")}</span>
        {node['name']}
      </div>

      {hasChildren && expanded && (
        <div>
          {node['children']!.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

interface TreeViewProps {
  data: Map<any, any>[];
}

const TreeView: React.FC<TreeViewProps> = ({ data }) => {
  return (
    <div>
      {data.map((node) => (
        <TreeNode key={node['id']} node={node} />
      ))}
    </div>
  );
};

export default TreeView;
