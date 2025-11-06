import React, { useState, useEffect } from "react";
import InventoryForm from "../../common/components/InventoryForm";
import { useParams } from "react-router-dom";
import { useInventoryStore } from "../../stores/useInventoryStore";
import PageHeader from "../../common/components/PageHeader";
import { Spin } from "antd";

const InventoryPage = ({ mode }) => {
  const { id } = useParams();
  const { fetchInventoryById, inventory_by_id_loading } = useInventoryStore();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode !== "create") {
      const fetchData = async () => {
        try {
          const gottenData = await fetchInventoryById(id);
          setData(gottenData);
        } catch (err) {
          console.error("Failed to fetch inventory:", err);
          setError("Failed to load inventory.");
        }
      };
      window.scrollTo({ top: 0, behavior: "smooth" });
      fetchData();
    }
  }, [id, mode, fetchInventoryById]);

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <>
      <PageHeader title="Inventory" />
      <Spin spinning={inventory_by_id_loading} size="large" fullscreen={true} />
      <InventoryForm mode={mode} data={data} />
    </>
  );
};

export default InventoryPage;
