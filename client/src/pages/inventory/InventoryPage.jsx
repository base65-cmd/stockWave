import React, { useState, useEffect } from "react";
import InventoryForm from "../../common/components/InventoryForm";
import { useParams } from "react-router-dom";
import { useInventoryStore } from "../../stores/useInventoryStore";
import PageHeader from "../../common/components/PageHeader";

const InventoryPage = ({ mode }) => {
  const { id } = useParams();
  const { fetchInventoryById } = useInventoryStore();
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
      fetchData();
    }
  }, [id, mode, fetchInventoryById]);

  if (error) return <div className="text-red-600">{error}</div>;
  if (mode !== "create" && !data) return <div>Loading...</div>;

  return (
    <>
      <PageHeader title="Inventory" />
      <InventoryForm mode={mode} data={data} />
    </>
  );
};

export default InventoryPage;
