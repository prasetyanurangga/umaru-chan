'use client';

import React, { useState, useEffect } from 'react';
import TreeView, { TreeNodeData } from '../components/treeView';
import ConfigurationForm from '../components/configurationForm';

function Tree() {
const [treeData, setTreeData] = useState<Map<any, any>[]>([])

  const apiUrl = "api"

  const handleSaveConfig = async (configuration: any) => {
    const par = {
        endpointUrl : configuration.endpointUrl,
        method: configuration.method.toUpperCase(),
        params: configuration.params,
        body: configuration.requestBody,
        bodyType: configuration.bodyType.toLowerCase(),
        mapping: configuration.mapping
      };
    try {
    const response = await fetch(`${apiUrl}/preview`, {
        method: 'POST',
        headers: {
        "Content-Type": "application/json",
        },
        body:JSON.stringify(par)
    });
    const data = await response.json();
    if (response.ok) {
       console.log(data.data)
       setTreeData(data.data)
    } else {
       console.log("gagal")
    }
    } catch (error: any) {
        console.log("gagal")
    } finally {

       console.log("gagal")
    }
    
  };

  return (
    <div className="app-container">
      <h1>API Gateway Integration</h1>
      <TreeView data={treeData} />
      
      <ConfigurationForm onSave={handleSaveConfig} />
    </div>
  );
}

export default Tree;
