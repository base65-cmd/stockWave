import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Sidebar from "./common/components/Sidebar";
import Navbar from "./common/components/Navbar";
import InventoryList from "./pages/inventory/inventoryList";
import InventoryPage from "./pages/inventory/InventoryPage";
import { Toaster } from "react-hot-toast";
import SIS from "./pages/transactions/SIS";
import TransactionsPage from "./pages/transactions/TransactionsPage";
import VesselOverview from "./pages/vessel/VesselOverview";
import DispatchedGroupedView from "./pages/transactions/DispatchedGroupedView";
import DispatchRecords from "./pages/transactions/DispatchRecords";
import EBincard from "./pages/transactions/eBinCard";
import LowStock from "./pages/inventory/LowStock";
import LoginPage from "./pages/auth/LoginPage";
import PurchaseOrders from "./pages/vendors/PurchaseOrders";
import CreatePO from "./pages/vendors/CreatePO";
import RequireAuth from "./common/components/RequireAuth";
import VendorDirectory from "./pages/vendors/VendorDirectory";
import useWindowWidth from "./common/components/useWindowWidth";
import useSidebarStore from "./stores/useSidebarStore";
import DevPage from "./pages/DevPage";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSISPage = location.pathname === "/sis";
  const isVendorDirectory = location.pathname === "/vendor";
  const { isOpen } = useSidebarStore();
  const windowWidth = useWindowWidth();

  return (
    <div className="flex w-full">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="*"
          element={
            <RequireAuth>
              <div className="flex w-full">
                {!isLoginPage && !isSISPage && (
                  <nav>
                    <Sidebar />
                  </nav>
                )}

                <main
                  className={`w-full bg-[#f7f7f7] ${
                    !isVendorDirectory ? "overflow-hidden" : ""
                  }`}
                >
                  {!isLoginPage && <Navbar />}
                  <aside className="mt-20">
                    {windowWidth < 1024 && isOpen && !isSISPage && (
                      <div className="fixed top-20 inset-0 bg-black/40 flex justify-center items-center z-15"></div>
                    )}

                    <Routes>
                      {/* Active Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/inventory" element={<InventoryList />} />
                      <Route
                        path="/inventory/:id/view"
                        element={<InventoryPage mode="view" />}
                      />
                      <Route
                        path="/inventory/:id/edit"
                        element={<InventoryPage mode="edit" />}
                      />
                      <Route
                        path="/inventory/create"
                        element={<InventoryPage mode="create" />}
                      />
                      <Route path="/sis" element={<SIS />} />
                      <Route
                        path="/sis-transactions"
                        element={<TransactionsPage />}
                      />
                      <Route path="/vessel" element={<VesselOverview />} />
                      <Route
                        path="/vessel/:name/:id"
                        element={<DispatchedGroupedView />}
                      />
                      <Route path="/ebincard" element={<EBincard />} />
                      <Route path="/low-stock" element={<LowStock />} />
                      <Route path="/out-of-stock" element={<LowStock />} />
                      <Route
                        path="/purchase-order"
                        element={<PurchaseOrders />}
                      />
                      <Route
                        path="/purchase-order/create"
                        element={<CreatePO />}
                      />
                      <Route path="/vendor" element={<VendorDirectory />} />

                      {/* In Development */}
                      <Route
                        path="/stock-adjustment"
                        element={<DevPage title="Stock Adjustment" />}
                      />
                      <Route
                        path="/inventory-report"
                        element={<DevPage title="Inventory Report" />}
                      />

                      <Route path="/chat" element={<DevPage title="Chat" />} />
                      <Route
                        path="/calendar"
                        element={<DevPage title="Calendar" />}
                      />
                      <Route
                        path="/tasks"
                        element={<DevPage title="Tasks" />}
                      />
                      <Route
                        path="/notes"
                        element={<DevPage title="Notes" />}
                      />
                      <Route
                        path="/returns"
                        element={<DevPage title="Returns/Adjustments" />}
                      />
                      <Route
                        path="/add-vendor"
                        element={<DevPage title="Add/Edit Vendors" />}
                      />
                      <Route
                        path="/vendor-report"
                        element={<DevPage title="Vendor Reports" />}
                      />

                      <Route
                        path="/dispatch"
                        element={<DevPage title="Dispatch Records Report" />}
                      />
                      <Route
                        path="/dispatch-records"
                        element={<DevPage title="Dispatch Records" />}
                      />
                      <Route
                        path="/custom-report"
                        element={<DevPage title="Custom Report" />}
                      />

                      <Route
                        path="/settings"
                        element={<DevPage title="General Settings" />}
                      />
                      <Route
                        path="/user-management"
                        element={<DevPage title="User Management" />}
                      />
                    </Routes>
                  </aside>
                </main>
              </div>
            </RequireAuth>
          }
        />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          className: "",
          duration: 3000,
          style: {
            background: "#1C64F2",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}

export default App;
