import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
// export const SidebarData = [
//   {
//     label: "NAVIGATION",
//     submenuOpen: true,
//     showSubRoute: false,
//     submenuHdr: "NAVIGATION",
//     submenuItems: [
//       {
//         label: "Dashboard",
//         link: route.dashboard,
//         icon: "layout-grid",
//       },
//       {
//         label: "Inventory Management",
//         icon: "clipboard",
//         submenu: true,
//         showSubRoute: false,
//         submenuItems: [
//           { label: "Inventory List", link: route.inventory },
//           { label: "Add Items", link: route.inventoryCreate },
//           { label: "Stock Adjustment", link: route.stockAdjustment },
//           { label: "Inventory Report", link: route.inventoryReport },
//           { label: "Low Stock", link: route.lowStock },
//         ],
//       },
//       {
//         label: "Applications",
//         icon: "send",
//         submenu: true,
//         showSubRoute: false,
//         submenuItems: [
//           { label: "Chat", link: route.chat },
//           { label: "Calendar", link: route.calendar },
//           { label: "Tasks", link: route.tasks },
//           { label: "Notes", link: route.notes },
//         ],
//       },
//       {
//         label: "Vessel Management",
//         icon: "ship",
//         submenu: true,
//         showSubRoute: false,
//         submenuItems: [
//           { label: "Vessel Overview", link: route.vesselOverview },
//           { label: "Dispatch Records", link: route.dispatchRecords },
//         ],
//       },
//       {
//         label: "Transactions",
//         icon: "scan",
//         submenu: true,
//         showSubRoute: false,
//         submenuItems: [
//           { label: "SIS", link: route.sis },
//           { label: "Returns/Adjustments", link: route.returns },
//           { label: "Transaction History", link: route.sisTransactions },
//           { label: "e-BinCard", link: route.ebincard },
//         ],
//       },
//       {
//         label: "Vendors",
//         icon: "user-dollar",
//         submenu: true,
//         showSubRoute: false,
//         submenuItems: [
//           { label: "Vendor Directory", link: route.vendorDirectory },
//           { label: "Add/Edit Vendors", link: route.addVendor },
//           { label: "Purchase Orders", link: route.purchaseOrder },
//           { label: "Vendor Reports", link: route.vendorReport },
//         ],
//       },
//       {
//         label: "Reports & Analytics",
//         icon: "chart-bar",
//         submenu: true,
//         showSubRoute: false,
//         submenuItems: [
//           { label: "Inventory Report", link: route.inventoryReport },
//           { label: "Dispatch Records", link: route.dispatchRecords },
//           { label: "Custom Report", link: route.customInventoryReport },
//         ],
//       },
//       {
//         label: "Settings",
//         icon: "settings",
//         submenu: true,
//         showSubRoute: false,
//         submenuItems: [
//           { label: "General Settings", link: route.settings },
//           { label: "User Management", link: route.userManagement },
//         ],
//       },
//       {
//         label: "Logout",
//         link: route.login,
//         icon: "logout",
//       },
//     ],
//   },
// ];
