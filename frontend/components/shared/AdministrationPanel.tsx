'use client';
import CreateProject from "./CreateProject";

import ProjectList from "./Projects";
const AdministrationPanel = () => {
  
  return (
    <div className={`border rounded-lg p-4 mb-4 shadow-md }`}>
      <CreateProject />
      <ProjectList />
    </div>
  );
}

export default AdministrationPanel;