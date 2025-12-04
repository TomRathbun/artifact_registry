import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectLayout from './components/ProjectLayout';
import ArtifactListView from './components/ArtifactListView';
import ArtifactWizard from './components/ArtifactWizard';
import ArtifactGraphView from './components/ArtifactGraphView';

import ManagementView from './components/ManagementView';
import SiteManager from './components/SiteManager';
import ComponentManager from './components/ComponentManager';
import ComponentDiagram from './components/ComponentDiagram';
import DiagramList from './components/DiagramList';

import DiagramView from './components/DiagramView';
import LinkageListView from './components/LinkageListView';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-transparent text-slate-900">
          <Routes>
            <Route path="/" element={<ProjectDashboard />} />
            {/* Project layout with side panel */}
            <Route path="/project/:projectId" element={<ProjectLayout />}>
              {/* List views */}
              <Route index element={<ArtifactListView artifactType="need" />} />
              <Route path="visions" element={<ArtifactListView artifactType="vision" />} />
              <Route path="needs" element={<ArtifactListView artifactType="need" />} />
              <Route path="use-cases" element={<ArtifactListView artifactType="use_case" />} />
              <Route path="requirements" element={<ArtifactListView artifactType="requirement" />} />
              <Route path="people" element={<ManagementView type="people" />} />
              <Route path="areas" element={<ManagementView type="area" />} />
              <Route path="sites" element={<SiteManager />} />
              <Route path="components" element={<ComponentManager />} />
              <Route path="diagrams" element={<DiagramList />} />
              <Route path="diagrams/:diagramId" element={<DiagramView />} />
              <Route path="components/diagram" element={<ComponentDiagram />} />

              <Route path="linkages" element={<LinkageListView />} />
              <Route path="graph" element={<ArtifactGraphView />} />
              {/* Create new artifact */}
              <Route path=":artifactType/create" element={<ArtifactWizard />} />
              {/* Edit existing artifact */}
              <Route path=":artifactType/:artifactId" element={<ArtifactWizard />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
