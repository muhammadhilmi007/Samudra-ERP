import React from 'react';

export interface OrgNode {
  id: string;
  name: string;
  title?: string;
  children?: OrgNode[];
}

interface OrganizationalChartProps {
  data: OrgNode;
}

const renderNode = (node: OrgNode) => (
  <li key={node.id} className="mb-4">
    <div className="p-2 border rounded bg-white shadow text-center">
      <div className="font-bold">{node.name}</div>
      {node.title && <div className="text-xs text-gray-500">{node.title}</div>}
    </div>
    {node.children && node.children.length > 0 && (
      <ul className="ml-8 border-l-2 border-gray-300 pl-4">
        {node.children.map(renderNode)}
      </ul>
    )}
  </li>
);

const OrganizationalChart: React.FC<OrganizationalChartProps> = ({ data }) => (
  <div className="overflow-x-auto">
    <ul className="list-none">{renderNode(data)}</ul>
  </div>
);

export default OrganizationalChart; 