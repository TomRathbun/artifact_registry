import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectLayout from './components/ProjectLayout';
import ArtifactListView from './components/ArtifactListView';
import ArtifactWizard from './components/ArtifactWizard';
import ArtifactPresentation from './components/ArtifactPresentation';
import ArtifactGraphView from './components/ArtifactGraphView';

import ManagementView from './components/ManagementView';
import SiteManager from './components/SiteManager';
import ComponentManager from './components/ComponentManager';
import ComponentDiagram from './components/ComponentDiagram';
import DiagramList from './components/DiagramList';

import DiagramView from './components/DiagramView';
import LinkageListView from './components/LinkageListView';
import AboutPage from './components/AboutPage';
import ChangelogPage from './components/ChangelogPage';

import ImageGallery from './components/ImageGallery';
import StatisticsView from './components/StatisticsView';
import DependencyPage from './components/DependencyPage';
import DatabaseManager from './components/DatabaseManager';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import PasswordChangePage from './components/PasswordChangePage';

const queryClient = new QueryClient();

function App() {
  const token = localStorage.getItem('token');

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-transparent text-slate-900">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/change-password" element={<PasswordChangePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/" element={token ? <ProjectDashboard /> : <LoginPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/images" element={<ImageGallery />} />
            <Route path="/dependencies" element={<DependencyPage />} />
            {/* Project layout with side panel */}
            <Route path="/project/:projectId" element={<ProjectLayout />}>
              <Route path="images" element={<ImageGallery />} />
              {/* List views */}
              <Route index element={<ArtifactListView artifactType="vision" />} />
              <Route path="visions" element={<ArtifactListView artifactType="vision" />} />
              <Route path="needs" element={<ArtifactListView artifactType="need" />} />
              <Route path="use-cases" element={<ArtifactListView artifactType="use_case" />} />
              <Route path="requirements" element={<ArtifactListView artifactType="requirement" />} />
              <Route path="requirements/create" element={<ArtifactWizard />} />
              <Route path="requirements/:artifactId" element={<ArtifactPresentation />} />
              <Route path="documents" element={<ArtifactListView artifactType="document" />} />
              <Route path="documents/create" element={<ArtifactWizard />} />
              <Route path="documents/:artifactId" element={<ArtifactPresentation />} />
              <Route path="people" element={<ManagementView type="people" />} />
              <Route path="areas" element={<ManagementView type="area" />} />
              <Route path="sites" element={<SiteManager />} />
              <Route path="components" element={<ComponentManager />} />
              <Route path="diagrams" element={<DiagramList />} />
              <Route path="diagrams/:diagramId" element={<DiagramView />} />
              <Route path="components/diagram" element={<ComponentDiagram />} />

              <Route path="linkages" element={<LinkageListView />} />
              <Route path="graph" element={<ArtifactGraphView />} />
              <Route path="statistics" element={<StatisticsView />} />
              <Route path="database" element={<DatabaseManager />} />
              {/* Create new artifact */}
              <Route path=":artifactType/create" element={<ArtifactWizard />} />
              {/* View artifact in presentation mode (new default) */}
              <Route path=":artifactType/:artifactId" element={<ArtifactPresentation />} />
              {/* Edit existing artifact */}
              <Route path=":artifactType/:artifactId/edit" element={<ArtifactWizard />} />
            </Route>
            <Route path="/database" element={<DatabaseManager />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider >
  );
}

export default App;
