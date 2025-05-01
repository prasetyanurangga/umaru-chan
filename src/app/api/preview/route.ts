import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
  const requestBody = await req.json();
  const {
    endpointUrl,
    method = 'GET',
    queryParams = {},
    body,
    bodyType = 'json',
    mapping,
  } = requestBody;

  try {
    const headers: any = {};
    if (body && bodyType === 'json') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axios.request({
      method,
      url: endpointUrl,
      params: queryParams,
      headers,
      data: bodyType === 'json' ? body : bodyType === 'raw' ? body : undefined,
    });

    
    var respon = jsonToTreeViewFinal(response.data)

    console.log(respon);


    return NextResponse.json({
      message: `Berhasil`,
      data: respon
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getDataByPath(jsonData: any, path: string): any {
    const pathParts: string[] = path.split('.');
    let current: any = jsonData;
  
    for (const part of pathParts) {
      if (current && Object.prototype.hasOwnProperty.call(current, part)) {
        current = current[part];
      } else {
        return undefined; // Path tidak valid
      }
    }
    return current;
  }
  

interface TreeNode {
    id: string;
    name: string;
    type: string;
    path: string;
    children?: TreeNode[];
    value?: any;
  }
  
  function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  function jsonToTreeViewFinal(data: any, currentPath: string = ''): TreeNode[] {
    if (Array.isArray(data)) {
      const rootNode: TreeNode = {
        id: generateId(),
        name: 'root',
        type: 'array',
        path: currentPath,
        children: data.map((item, index) => {
          const itemPath = `${currentPath}.${index}`;
          const childNode: TreeNode = {
            id: generateId(),
            name: `Data ${index + 1}`,
            type: Array.isArray(item) ? "array" : (typeof item === 'object' && item !== null ? "object" : typeof item),
            path: itemPath,
          };
          if (typeof item === 'object' && item !== null) {
            childNode.children = jsonToTreeViewFinal(item, itemPath) as TreeNode[];
          }
          return childNode;
        }),
      };
      return [rootNode];
    } else if (typeof data === 'object' && data !== null) {
      const tree: TreeNode[] = [];
      const arraykey = Object.keys(data);
      arraykey.forEach(itemKey => {
        const itemPath = currentPath ? `${currentPath}.${itemKey}` : itemKey;
        const id = generateId();
        const value: any = data[itemKey];
        const node: TreeNode = {
          id: id,
          name: itemKey,
          type: Array.isArray(value) ? "array" : (typeof value === 'object' && value !== null ? "object" : typeof value),
          path: itemPath,
        };
        if (Array.isArray(value)) {
          node.children = value.map((item, index) => {
            const childPath = `${itemPath}.${index}`;
            const childId = generateId();
            const childNode: TreeNode = {
              id: childId,
              name: `Data ${index + 1}`,
              type: Array.isArray(item) ? "array" : (typeof item === 'object' && item !== null ? "object" : typeof item),
              path: childPath,
            };
            if (typeof item === 'object' && item !== null) {
              childNode.children = jsonToTreeViewFinal(item, childPath) as TreeNode[];
            }
            return childNode;
          });
        } else if (typeof value === 'object' && value !== null) {
          node.children = jsonToTreeViewFinal(value, itemPath) as TreeNode[];
        } else {
          node.value = value; // Tambahkan nilai primitif jika diperlukan
        }
        tree.push(node);
      });
      return tree;
    } else {
      return [{ id: generateId(), name: String(data), type: typeof data, path: currentPath }];
    }
  }
  