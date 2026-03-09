import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/hooks/useTheme';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { IdeasPage } from '@/pages/IdeasPage';
import { BriefPage } from '@/pages/BriefPage';
import { SocialContentPage } from '@/pages/SocialContentPage';
import { ContentDetailPage } from '@/pages/ContentDetailPage';
import { ContentStudioPage } from '@/pages/ContentStudioPage';
import { ContentTemplatePage } from '@/pages/ContentTemplatePage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { CompanyContentPage } from '@/pages/CompanyContentPage';
import { MediaLibraryPage } from '@/pages/MediaLibraryPage';
import { MediaUploadPage } from '@/pages/MediaUploadPage';
import { TeamPage } from '@/pages/TeamPage';
import { ApiPage } from '@/pages/ApiPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/AdminPage';
import { KimiTestPage } from '@/pages/KimiTestPage';
import { SpeedTestPage } from '@/pages/SpeedTestPage';
import { ConversationPage } from '@/pages/ConversationPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* App Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/ideas" element={<IdeasPage />} />
            <Route path="/ideas/brief/:ideaId" element={<BriefPage />} />
            <Route path="/social-content" element={<SocialContentPage />} />
            <Route path="/social-content/new" element={<ContentStudioPage />} />
            <Route path="/social-content/:id" element={<ContentDetailPage />} />
            <Route path="/social-content/:id/edit" element={<ContentStudioPage />} />
            <Route path="/content-templates" element={<ContentTemplatePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/company-content" element={<CompanyContentPage />} />
            <Route path="/media" element={<MediaLibraryPage />} />
            <Route path="/media/upload" element={<MediaUploadPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/api" element={<ApiPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Admin Route */}
            <Route path="/admin" element={<AdminPage />} />
            
            {/* Test Routes */}
            <Route path="/test/kimi" element={<KimiTestPage />} />
            <Route path="/test/speed" element={<SpeedTestPage />} />
            
            {/* AI Conversation */}
            <Route path="/conversation" element={<ConversationPage />} />
            <Route path="/conversation/:conversationId" element={<ConversationPage />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
