import { Spin } from "antd";
import InventoryTable from "../../common/components/InventoryTable";
import PageHeader from "../../common/components/PageHeader";
import { Import, Plus } from "lucide-react";
import { useInventoryStore } from "../../stores/useInventoryStore";

const InventoryList = () => {
  const { inv_loading } = useInventoryStore();
  return (
    <>
      <PageHeader
        title="Inventory List"
        button={[
          {
            name: "Add Product",
            icon: Plus,
            bgColor: "bg-blue-600",
            link: "/inventory/create",
          },
          {
            name: "Import Product",
            icon: Import,
            bgColor: "bg-blue-800",
            link: "#",
          },
        ]}
      />
      <Spin spinning={inv_loading} size="large" fullscreen={true}></Spin>
      <div className="bg-white border border-gray-200 m-3 py-4 h-full rounded-xl shadow-md">
        <InventoryTable />
      </div>
    </>
  );
};

export default InventoryList;
