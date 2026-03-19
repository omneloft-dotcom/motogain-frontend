import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import ToastContainer from "./components/common/ToastContainer";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import DeleteAccount from "./pages/auth/DeleteAccount";
import Dashboard from "./pages/dashboard/Dashboard";
import ListingsPage from "./pages/listings/ListingsPage";
import MyListings from "./pages/listings/MyListings";
import ListingDetail from "./pages/listings/ListingDetail";
import CreateListing from "./pages/listings/CreateListing";
import EditListing from "./pages/listings/EditListing";
import FavoritesPage from "./pages/favorites/FavoritesPage";
import MatchesPage from "./pages/matches/MatchesPage";
import MyMatchesPage from "./pages/matches/MyMatchesPage";
import ListingMatchedCouriers from "./pages/listings/ListingMatchedCouriers";
import MessagesInbox from "./pages/messages/MessagesInbox";
import ChatPage from "./pages/messages/ChatPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Announcements from "./pages/Announcements";
import Club from "./pages/Club";
import Settings from "./pages/Settings";
import ProfileSettings from "./pages/ProfileSettings";
import NewsUpdates from "./pages/NewsUpdates";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import CourierCalendar from "./pages/courier/CourierCalendar";
import CourierGuidePage from "./pages/help/CourierGuidePage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingListings from "./pages/admin/PendingListings";
import UsersManagement from "./pages/admin/UsersManagement";
import BanManagement from "./pages/admin/BanManagement";
import Reports from "./pages/admin/Reports";
import AllListings from "./pages/admin/AllListings";
import Profiles from "./pages/admin/Profiles";
import AdminListingDetail from "./pages/admin/AdminListingDetail";
import ListingDetailAdmin from "./pages/admin/ListingDetailAdmin";
import NewsSourcesManagement from "./pages/admin/NewsSourcesManagement";
import NewsManagement from "./pages/admin/NewsManagement";
import CampaignsManagement from "./pages/admin/CampaignsManagement";
import CampaignLeadsManagement from "./pages/admin/CampaignLeadsManagement";
import PushBroadcast from "./pages/admin/PushBroadcast";
import Kvkk from "./pages/legal/Kvkk";
import Terms from "./pages/legal/Terms";
import BetaInfo from "./pages/legal/BetaInfo";
import Privacy from "./pages/legal/Privacy";

export default function App() {
  return (
    <>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/delete-account" element={<DeleteAccount />} />
      <Route path="/kvkk" element={<Kvkk />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/beta-info" element={<BetaInfo />} />
      <Route path="/privacy" element={<Privacy />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/listings/create" element={<CreateListing />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/news" element={<NewsUpdates />} />
          {/* WEB-ONLY: Offer creation disabled - mobile-only feature */}
          {/* <Route path="/offers" element={<Offers />} /> */}
          <Route path="/club" element={<Club />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/kurye-rehberi" element={<CourierGuidePage />} />
          {/* FAZ 17.5: Matching routes disabled - job marketplace not active */}
          {/* <Route path="/matches" element={<MyMatchesPage />} /> */}
          {/* <Route path="/matches/saved" element={<SavedMatchesPage />} /> */}
          {/* <Route path="/listings/:id/matched-couriers" element={<ListingMatchedCouriers />} /> */}
          {/* <Route path="/listings/:id/agreement" element={<CourierAgreementPage />} /> */}
          <Route path="/messages" element={<MessagesInbox />} />
          <Route path="/messages/:conversationId" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/settings" element={<ProfileSettings />} />
          <Route path="/courier-calendar" element={<CourierCalendar />} />
        </Route>

        {/* 🔒 Admin Routes - Protected by AdminRoute */}
        <Route element={<AdminRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/listings" element={<AllListings />} />
            <Route path="/admin/listings/:id" element={<AdminListingDetail />} />
            <Route path="/admin/pending-listings" element={<PendingListings />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/bans" element={<BanManagement />} />
            <Route path="/admin/profiles" element={<Profiles />} />
            <Route path="/admin/news-sources" element={<NewsSourcesManagement />} />
            <Route path="/admin/news" element={<NewsManagement />} />
            <Route path="/admin/campaigns" element={<CampaignsManagement />} />
            <Route path="/admin/campaign-leads" element={<CampaignLeadsManagement />} />
            <Route path="/admin/push-broadcast" element={<PushBroadcast />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    <ToastContainer />
    </>
  );
}
